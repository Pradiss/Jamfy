import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { supabaseAdmin } from "../config/supabase.js";

const BUCKET = "media";
const BUCKET_FILE_SIZE_LIMIT = "50MB";

let bucketReady: Promise<void> | null = null;

function ensureBucket() {
  if (!bucketReady) {
    bucketReady = supabaseAdmin.storage
      .createBucket(BUCKET, {
        public: true,
        fileSizeLimit: BUCKET_FILE_SIZE_LIMIT,
      })
      .then(async ({ error }) => {
        if (!error) return;

        if (!/already exists/i.test(error.message)) {
          throw new Error(`Não foi possível preparar o armazenamento: ${error.message}`);
        }

        // Bucket already existed (possibly created with the old 5MB limit
        // before portfolio videos were supported) — raise its cap too.
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(
          BUCKET,
          { public: true, fileSizeLimit: BUCKET_FILE_SIZE_LIMIT },
        );

        if (updateError) {
          throw new Error(
            `Não foi possível preparar o armazenamento: ${updateError.message}`,
          );
        }
      });
  }

  return bucketReady;
}

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

function extensionForMime(mimeType: string) {
  return EXTENSION_BY_MIME[mimeType] ?? mimeType.split("/")[1] ?? "bin";
}

async function uploadBuffer(path: string, buffer: Buffer, mimeType: string) {
  await ensureBucket();

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Não foi possível enviar a imagem: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return `${data.publicUrl}?v=${Date.now()}`;
}

class UploadService {
  async uploadAvatar(userId: string, buffer: Buffer, mimeType: string) {
    const url = await uploadBuffer(`avatars/${userId}.jpg`, buffer, mimeType);

    await prisma.usuario.update({
      where: { id: userId },
      data: { fotoUrl: url },
    });

    return url;
  }

  async uploadCover(userId: string, buffer: Buffer, mimeType: string) {
    const artistProfile = await prisma.perfilArtista.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    if (!artistProfile) {
      throw new Error("Perfil de artista não encontrado.");
    }

    const url = await uploadBuffer(
      `covers/${artistProfile.id}.jpg`,
      buffer,
      mimeType,
    );

    await prisma.perfilArtista.update({
      where: { id: artistProfile.id },
      data: { fotoCapaUrl: url },
    });

    return url;
  }

  async uploadPortfolioFile(userId: string, buffer: Buffer, mimeType: string) {
    const artistProfile = await prisma.perfilArtista.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    if (!artistProfile) {
      throw new Error("Perfil de artista não encontrado.");
    }

    const tipo = mimeType.startsWith("video/") ? "VIDEO" : "FOTO";
    const path = `portfolio/${artistProfile.id}/${randomUUID()}.${extensionForMime(mimeType)}`;

    const url = await uploadBuffer(path, buffer, mimeType);

    return { url, tipo: tipo as "VIDEO" | "FOTO" };
  }
}

export const uploadService = new UploadService();
