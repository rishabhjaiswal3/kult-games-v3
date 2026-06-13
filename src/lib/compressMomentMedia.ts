import { MOMENT_IMAGE_COMPRESS } from "@/constants/moments";

export type CompressMomentMediaResult = {
  file: File;
  wasCompressed: boolean;
  originalSizeBytes: number;
};

const SKIP_IMAGE_TYPES = new Set(["image/gif", "image/svg+xml"]);
const OUTPUT_CANDIDATES = ["image/webp", "image/jpeg"] as const;

let preferredOutputMime: (typeof OUTPUT_CANDIDATES)[number] | null = null;

function resolveOutputMimeType(): (typeof OUTPUT_CANDIDATES)[number] {
  if (preferredOutputMime) return preferredOutputMime;

  if (typeof document === "undefined") {
    preferredOutputMime = "image/jpeg";
    return preferredOutputMime;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  for (const mime of OUTPUT_CANDIDATES) {
    const blob = canvas.toDataURL(mime, 0.8);
    if (blob.startsWith(`data:${mime}`)) {
      preferredOutputMime = mime;
      return mime;
    }
  }

  preferredOutputMime = "image/jpeg";
  return preferredOutputMime;
}

export function scaleToMaxLongEdge(width: number, height: number, maxLongEdge: number) {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxLongEdge) {
    return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
  }

  const scale = maxLongEdge / longEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function replaceExtension(filename: string, extension: string) {
  const base = filename.replace(/\.[^.]+$/, "") || "moment";
  return `${base}.${extension}`;
}

function mimeExtension(mime: string) {
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  return "jpg";
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode image"));
          return;
        }
        resolve(blob);
      },
      mime,
      quality,
    );
  });
}

async function loadImageBitmap(file: File) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not decode image"));
      img.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function drawToCanvas(source: ImageBitmap | HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source && typeof source.close === "function") {
    source.close();
  }

  return canvas;
}

function fileFromBlob(blob: Blob, file: File, outputMime: string) {
  return new File(
    [blob],
    replaceExtension(file.name, mimeExtension(outputMime)),
    { type: outputMime, lastModified: Date.now() },
  );
}

async function compressRasterImage(file: File): Promise<File> {
  const outputMime = resolveOutputMimeType();
  let longEdge = MOMENT_IMAGE_COMPRESS.maxLongEdgePx;
  let bestBlob: Blob | null = null;

  while (longEdge >= MOMENT_IMAGE_COMPRESS.minLongEdgePx) {
    const source = await loadImageBitmap(file);
    const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    const { width, height } = scaleToMaxLongEdge(sourceWidth, sourceHeight, longEdge);
    const canvas = drawToCanvas(source, width, height);

    let quality = MOMENT_IMAGE_COMPRESS.startQuality;
    while (quality >= MOMENT_IMAGE_COMPRESS.minQuality) {
      const blob = await canvasToBlob(canvas, outputMime, quality);
      bestBlob = blob;

      if (blob.size <= MOMENT_IMAGE_COMPRESS.targetMaxBytes) {
        return fileFromBlob(blob, file, outputMime);
      }

      quality -= MOMENT_IMAGE_COMPRESS.qualityStep;
    }

    longEdge = Math.round(longEdge * MOMENT_IMAGE_COMPRESS.dimensionStepRatio);
  }

  if (!bestBlob) {
    throw new Error("Could not compress image");
  }

  if (bestBlob.size > MOMENT_IMAGE_COMPRESS.hardMaxBytes) {
    throw new Error(
      `Image is still ${Math.ceil(bestBlob.size / 1024)} KB after optimization. Use a simpler screenshot under 500 KB.`,
    );
  }

  return fileFromBlob(bestBlob, file, outputMime);
}

function shouldCompressImage(file: File) {
  if (!file.type.startsWith("image/")) return false;
  if (SKIP_IMAGE_TYPES.has(file.type)) return false;
  return true;
}

/**
 * Shrinks moment uploads on the client before presign + PUT.
 * Images are resized and re-encoded; videos pass through unchanged.
 */
export async function compressMomentMediaFile(file: File): Promise<CompressMomentMediaResult> {
  const originalSizeBytes = file.size;

  if (!shouldCompressImage(file)) {
    return { file, wasCompressed: false, originalSizeBytes };
  }

  try {
    const compressed = await compressRasterImage(file);

    if (compressed.size > MOMENT_IMAGE_COMPRESS.hardMaxBytes) {
      throw new Error("Optimized image exceeds the 500 KB upload limit.");
    }

    const wasCompressed = compressed.size < originalSizeBytes || compressed.type !== file.type;
    return {
      file: compressed,
      wasCompressed,
      originalSizeBytes,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("500 KB")) {
      throw error;
    }
    if (file.size <= MOMENT_IMAGE_COMPRESS.hardMaxBytes) {
      return { file, wasCompressed: false, originalSizeBytes };
    }
    throw new Error("Could not optimize this image. Try a smaller JPG, PNG, or WebP.");
  }
}
