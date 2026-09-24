"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ImageCropModal } from "@/components/ui/image-crop-modal";

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function CoverUploader({ ownerUserId }: { ownerUserId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  if (user?.id !== ownerUserId) {
    return null;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) setFile(selected);
    event.target.value = "";
  }

  async function handleSave(blob: Blob) {
    const formData = new FormData();
    formData.append("file", blob, "cover.jpg");

    await apiFetch("/api/uploads/cover", {
      method: "POST",
      body: formData,
    });

    setFile(null);
    router.refresh();
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Alterar foto de capa"
        className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
      >
        <CameraIcon />
        Alterar capa
      </button>

      {file ? (
        <ImageCropModal
          file={file}
          shape="rect"
          outputWidth={1500}
          outputHeight={500}
          title="Foto de capa"
          onCancel={() => setFile(null)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}
