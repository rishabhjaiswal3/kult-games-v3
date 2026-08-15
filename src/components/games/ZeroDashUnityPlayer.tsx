import { useEffect, useRef, useState } from "react";

type UnityInstance = {
  Quit: () => Promise<void>;
  SendMessage: (objectName: string, methodName: string, value?: string) => void;
};

type CreateUnityInstance = (
  canvas: HTMLCanvasElement,
  config: Record<string, unknown>,
  onProgress: (progress: number) => void,
) => Promise<UnityInstance>;

declare global {
  interface Window {
    createUnityInstance?: CreateUnityInstance;
  }
}

type ZeroDashUnityPlayerProps = {
  buildUrl: string;
  jwt: string | null;
};

function normalizeBuildUrl(value: string): string {
  const url = new URL(value, window.location.origin);
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

export function ZeroDashUnityPlayer({ buildUrl, jwt }: ZeroDashUnityPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let unityInstance: UnityInstance | null = null;
    let startupTimer: number | undefined;
    const baseUrl = normalizeBuildUrl(buildUrl);
    const script = document.createElement("script");
    script.src = `${baseUrl}/ZeroDash.loader.js`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = async () => {
      try {
        if (!window.createUnityInstance) {
          throw new Error("Zero Dash loader did not initialize Unity");
        }

        startupTimer = window.setTimeout(() => {
          if (!disposed) setError("Zero Dash initialization timed out. Check the Unity error in the browser console.");
        }, 180_000);

        const instance = await window.createUnityInstance(
          canvas,
          {
            arguments: [],
            dataUrl: `${baseUrl}/ZeroDash.data`,
            frameworkUrl: `${baseUrl}/ZeroDash.framework.js`,
            codeUrl: `${baseUrl}/ZeroDash.wasm`,
            streamingAssetsUrl: "/StreamingAssets",
            companyName: "Kult Games",
            productName: "Zero Dash",
            productVersion: "1.0",
            showBanner: (message: string, type: string) => {
              if (type === "error" && !disposed) setError(message);
              else if (type === "warning") console.warn("[ZeroDash Unity]", message);
            },
            // Match the known-working standalone Zero Dash configuration.
            matchWebGLToCanvasSize: false,
            devicePixelRatio: 1,
          },
          (value) => {
            if (!disposed) setProgress(Math.round(value * 100));
          },
        );

        if (disposed) {
          await instance.Quit().catch(() => undefined);
          return;
        }

        unityInstance = instance;
        if (startupTimer) window.clearTimeout(startupTimer);
        setProgress(100);

        if (jwt) {
          window.setTimeout(() => {
            if (disposed || !unityInstance) return;
            try {
              unityInstance.SendMessage("GameBootstrapper", "SetJwtToken", jwt);
            } catch (sendError) {
              console.warn("[ZeroDash] Could not send JWT to Unity", sendError);
            }
          }, 1500);
        }
      } catch (loadError) {
        if (startupTimer) window.clearTimeout(startupTimer);
        if (!disposed) {
          setError(loadError instanceof Error ? loadError.message : "Unable to start Zero Dash");
        }
      }
    };

    script.onerror = () => {
      if (!disposed) setError(`Unable to load ${script.src}`);
    };

    document.body.appendChild(script);

    return () => {
      disposed = true;
      if (startupTimer) window.clearTimeout(startupTimer);
      script.remove();
      if (unityInstance) void unityInstance.Quit().catch(() => undefined);
    };
  }, [buildUrl, jwt]);

  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        id="unity-canvas"
        width={900}
        height={600}
        tabIndex={-1}
        className="block h-auto max-h-full w-auto max-w-full touch-none bg-black [aspect-ratio:3/2]"
      />
      {progress < 100 && !error ? (
        <div className="absolute inset-0 grid place-items-center bg-[#03060c]">
          <div className="w-[min(78vw,420px)] text-center">
            <p className="font-tech text-sm uppercase tracking-[0.2em] text-white">Loading Zero Dash</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/55">{progress}%</p>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-[#03060c] p-6 text-center">
          <div>
            <p className="font-tech text-sm uppercase tracking-wider text-red-300">Zero Dash could not start</p>
            <p className="mt-3 max-w-lg break-words text-sm text-white/60">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
