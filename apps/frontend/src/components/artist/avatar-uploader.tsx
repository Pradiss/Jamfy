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

export function AvatarUploader({ ownerUserId }: { ownerUserId: string }) {
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
    formData.append("file", blob, "avatar.jpg");

    await apiFetch("/api/uploads/avatar", {
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
        aria-label="Alterar foto de perfil"
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-950 text-white shadow-sm transition hover:opacity-90 dark:border-zinc-900 dark:bg-white dark:text-zinc-950"
      >
        <CameraIcon />
      </button>

      {file ? (
        <ImageCropModal
          file={file}
          shape="circle"
          outputWidth={512}
          outputHeight={512}
          title="Foto de perfil"
          onCancel={() => setFile(null)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}
