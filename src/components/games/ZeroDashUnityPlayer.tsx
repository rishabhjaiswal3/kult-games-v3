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

type ZeroDashBridge = {
  version: number;
  reportGameEnd: (payload: unknown) => Promise<unknown>;
  syncRun: (payload: unknown) => Promise<unknown>;
};

declare global {
  interface Window {
    createUnityInstance?: CreateUnityInstance;
    zeroDashBridge?: ZeroDashBridge;
  }
}

type ZeroDashUnityPlayerProps = {
  buildUrl: string;
  jwt: string | null;
  walletAddress?: string | null;
};

function normalizeBuildUrl(value: string): string {
  const url = new URL(value, window.location.origin);
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

const ZERODASH_BACKEND_URL = "https://zerodashbackend.onrender.com";

/**
 * Mirrors `installZeroDashUnityScoreBridge` from zerodashgame's `react-version`
 * (src/components/GameCanvas.jsx) — the Unity build calls `window.zeroDashBridge.reportGameEnd`
 * at game-end to POST `/player/game-sync`, which can trigger the backend's on-chain
 * `recordSession` write on a new high score. Without this bridge installed, Unity's call
 * throws (`window.zeroDashBridge` undefined) and the sync never happens.
 */
function installZeroDashUnityScoreBridge(walletAddress?: string | null) {
  const report = async (raw: unknown) => {
    const wallet =
      (typeof raw === "object" && raw !== null && typeof (raw as Record<string, unknown>).wallet === "string"
        ? ((raw as Record<string, unknown>).wallet as string)
        : null) ||
      walletAddress ||
      localStorage.getItem("walletAddress");
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      console.warn("[ZeroDash] game-sync skipped — no wallet");
      return { ok: false, reason: "no_wallet" };
    }
    let data: Record<string, unknown> = {};
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch {
        return { ok: false, reason: "invalid_json" };
      }
    } else if (typeof raw === "object" && raw !== null) {
      data = raw as Record<string, unknown>;
    }
    const highScore = data?.highScore ?? data?.score ?? data?.bestScore;
    const coins = data?.coins ?? data?.coin;
    try {
      const res = await fetch(`${ZERODASH_BACKEND_URL}/player/game-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${wallet}`,
        },
        body: JSON.stringify({
          highScore,
          coins,
          client: "unity-webgl",
          ts: Date.now(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn("[ZeroDash] game-sync failed", res.status, body);
        return { ok: false, status: res.status, body };
      }
      return { ok: true, body };
    } catch (e) {
      console.warn("[ZeroDash] game-sync error", (e as Error).message);
      return { ok: false, reason: (e as Error).message };
    }
  };

  window.zeroDashBridge = {
    version: 2,
    reportGameEnd: (payload: unknown) => report(payload),
    syncRun: (payload: unknown) => report(payload),
  };
}

export function ZeroDashUnityPlayer({ buildUrl, jwt, walletAddress }: ZeroDashUnityPlayerProps) {
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

        installZeroDashUnityScoreBridge(walletAddress);

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
      delete window.zeroDashBridge;
      if (unityInstance) void unityInstance.Quit().catch(() => undefined);
    };
  }, [buildUrl, jwt, walletAddress]);

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
