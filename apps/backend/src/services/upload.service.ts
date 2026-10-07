import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { prisma } from "../config/prisma.js";
import { supabaseAdmin } from "../config/supabase.js";

// Cache the file for a year — safe because every upload gets a fresh
// "?v=<timestamp>" query string, so an updated photo is always a new URL
// rather than overwriting a cached one.
const CACHE_CONTROL = "31536000";

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

// Every uploaded photo gets re-encoded to WebP — it's smaller than JPEG/PNG
// at the same visual quality, which is most of what actually makes a page
// heavy (photos dwarf JS/CSS on this site). Videos pass through untouched.
async function toWebp(buffer: Buffer, mimeType: string) {
  if (!mimeType.startsWith("image/") || mimeType === "image/webp") {
    return { buffer, mimeType, extension: extensionForMime(mimeType) };
  }

  const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

  return { buffer: webpBuffer, mimeType: "image/webp", extension: "webp" };
}

function pathFromPublicUrl(url: string) {
  const marker = `/object/public/${BUCKET}/`;
  const withoutQuery = url.split("?")[0] ?? "";
  const markerIndex = withoutQuery.indexOf(marker);

  if (markerIndex === -1) return null;

  return withoutQuery.slice(markerIndex + marker.length);
}

async function uploadBuffer(path: string, buffer: Buffer, mimeType: string) {
  await ensureBucket();

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      cacheControl: CACHE_CONTROL,
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
    const image = await toWebp(buffer, mimeType);
    const url = await uploadBuffer(
      `avatars/${userId}.${image.extension}`,
      image.buffer,
      image.mimeType,
    );

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

    const image = await toWebp(buffer, mimeType);
    const url = await uploadBuffer(
      `covers/${artistProfile.id}.${image.extension}`,
      image.buffer,
      image.mimeType,
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
    const image = await toWebp(buffer, mimeType);
    const path = `portfolio/${artistProfile.id}/${randomUUID()}.${image.extension}`;

    const url = await uploadBuffer(path, image.buffer, image.mimeType);

    return { url, tipo: tipo as "VIDEO" | "FOTO" };
  }

  async uploadAnuncioPhoto(userId: string, buffer: Buffer, mimeType: string) {
    const image = await toWebp(buffer, mimeType);
    const path = `anuncios/${userId}/${randomUUID()}.${image.extension}`;

    return uploadBuffer(path, image.buffer, image.mimeType);
  }

  async deleteFiles(urls: string[]) {
    const paths = urls
      .map(pathFromPublicUrl)
      .filter((path): path is string => Boolean(path));

    if (paths.length === 0) return;

    await ensureBucket();

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths);

    if (error) {
      // Not fatal — the DB record is still the source of truth, this is
      // best-effort cleanup to avoid piling up orphaned files.
      console.error("Não foi possível remover arquivos do armazenamento:", error.message);
    }
  }
}

export const uploadService = new UploadService();
