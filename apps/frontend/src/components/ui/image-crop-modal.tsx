"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { primaryButtonClass } from "@/lib/ui";

const PREVIEW_WIDTH = 320;

type Props = {
  file: File;
  shape: "circle" | "rect";
  outputWidth: number;
  outputHeight: number;
  title: string;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void>;
};

export function ImageCropModal({
  file,
  shape,
  outputWidth,
  outputHeight,
  title,
  onCancel,
  onSave,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dragState = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const aspect = outputWidth / outputHeight;
  const previewHeight = PREVIEW_WIDTH / aspect;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      imageRef.current = image;
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setReady(true);
    };

    image.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const baseScale = useCallback(() => {
    const image = imageRef.current;
    if (!image) return 1;
    return Math.max(
      PREVIEW_WIDTH / image.naturalWidth,
      previewHeight / image.naturalHeight,
    );
  }, [previewHeight]);

  function clampOffset(
    candidate: { x: number; y: number },
    scale: number,
  ) {
    const image = imageRef.current;
    if (!image) return candidate;

    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    const minX = Math.min(0, PREVIEW_WIDTH - drawWidth);
    const minY = Math.min(0, previewHeight - drawHeight);

    return {
      x: Math.min(0, Math.max(minX, candidate.x)),
      y: Math.min(0, Math.max(minY, candidate.y)),
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !ready) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = baseScale() * zoom;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    ctx.clearRect(0, 0, PREVIEW_WIDTH, previewHeight);
    ctx.save();

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(
        PREVIEW_WIDTH / 2,
        previewHeight / 2,
        Math.min(PREVIEW_WIDTH, previewHeight) / 2,
        0,
        Math.PI * 2,
      );
      ctx.clip();
    }

    ctx.drawImage(image, offset.x, offset.y, drawWidth, drawHeight);
    ctx.restore();

    if (shape === "circle") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(
        PREVIEW_WIDTH / 2,
        previewHeight / 2,
        Math.min(PREVIEW_WIDTH, previewHeight) / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
  }, [ready, zoom, offset, shape, previewHeight, baseScale]);

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!dragState.current) return;

    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    const scale = baseScale() * zoom;

    setOffset(
      clampOffset(
        {
          x: dragState.current.startOffsetX + dx,
          y: dragState.current.startOffsetY + dy,
        },
        scale,
      ),
    );
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleZoomChange(value: number) {
    const scale = baseScale() * value;
    setZoom(value);
    setOffset((current) => clampOffset(current, scale));
  }

  async function handleSave() {
    const image = imageRef.current;
    if (!image) return;

    setError(null);
    setSaving(true);

    try {
      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = outputWidth;
      outputCanvas.height = outputHeight;
      const ctx = outputCanvas.getContext("2d");
      if (!ctx) throw new Error("Não foi possível processar a imagem.");

      const k = outputWidth / PREVIEW_WIDTH;
      const scale = baseScale() * zoom * k;

      ctx.drawImage(
        image,
        offset.x * k,
        offset.y * k,
        image.naturalWidth * scale,
        image.naturalHeight * scale,
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        outputCanvas.toBlob(resolve, "image/jpeg", 0.9),
      );

      if (!blob) throw new Error("Não foi possível gerar a imagem.");

      await onSave(blob);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar a imagem.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="self-start text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <canvas
          ref={canvasRef}
          width={PREVIEW_WIDTH}
          height={previewHeight}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="touch-none rounded-2xl bg-surface"
          style={{ cursor: "grab" }}
        />

        <div className="flex w-full items-center gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">−</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => handleZoomChange(Number(event.target.value))}
            className="flex-1 accent-accent"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">+</span>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Arraste para posicionar e use o controle para dar zoom.
        </p>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!ready || saving}
            className={`flex-1 ${primaryButtonClass}`}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
