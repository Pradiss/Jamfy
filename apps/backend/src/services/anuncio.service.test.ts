import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../config/prisma.js", () => ({
  prisma: {
    anuncio: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("./upload.service.js", () => ({
  uploadService: {
    deleteFiles: vi.fn(),
  },
}));

const { prisma } = await import("../config/prisma.js");
const { uploadService } = await import("./upload.service.js");
const { anuncioService } = await import("./anuncio.service.js");

const OWNER_ID = "owner-1";
const OTHER_USER_ID = "someone-else";
const ANUNCIO_ID = "anuncio-1";

describe("anuncioService.update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the anuncio doesn't exist", async () => {
    vi.mocked(prisma.anuncio.findUnique).mockResolvedValue(null);

    await expect(
      anuncioService.update(OWNER_ID, ANUNCIO_ID, { titulo: "Novo título" }),
    ).rejects.toThrow("Anúncio não encontrado.");

    expect(prisma.anuncio.update).not.toHaveBeenCalled();
  });

  it("rejects when the caller isn't the owner", async () => {
    vi.mocked(prisma.anuncio.findUnique).mockResolvedValue({
      usuarioId: OWNER_ID,
      fotos: [],
    } as never);

    await expect(
      anuncioService.update(OTHER_USER_ID, ANUNCIO_ID, {
        titulo: "Tentativa de outro usuário",
      }),
    ).rejects.toThrow("Você não tem permissão para editar este anúncio.");

    expect(prisma.anuncio.update).not.toHaveBeenCalled();
  });

  it("lets the owner update their own anuncio", async () => {
    vi.mocked(prisma.anuncio.findUnique).mockResolvedValue({
      usuarioId: OWNER_ID,
      fotos: [],
    } as never);
    vi.mocked(prisma.anuncio.update).mockResolvedValue({
      id: ANUNCIO_ID,
    } as never);

    await anuncioService.update(OWNER_ID, ANUNCIO_ID, {
      titulo: "Título atualizado",
    });

    expect(prisma.anuncio.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ANUNCIO_ID } }),
    );
  });
});

describe("anuncioService.remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the anuncio doesn't exist", async () => {
    vi.mocked(prisma.anuncio.findUnique).mockResolvedValue(null);

    await expect(
      anuncioService.remove(OWNER_ID, ANUNCIO_ID),
    ).rejects.toThrow("Anúncio não encontrado.");

    expect(prisma.anuncio.delete).not.toHaveBeenCalled();
  });

  it("rejects when the caller isn't the owner", async () => {
    vi.mocked(prisma.anuncio.findUnique).mockResolvedValue({
      usuarioId: OWNER_ID,
      fotos: [],
    } as never);

    await expect(
      anuncioService.remove(OTHER_USER_ID, ANUNCIO_ID),
    ).rejects.toThrow("Você não tem permissão para remover este anúncio.");

    expect(prisma.anuncio.delete).not.toHaveBeenCalled();
  });

  it("lets the owner remove their own anuncio and cleans up its photos", async () => {
    vi.mocked(prisma.anuncio.findUnique).mockResolvedValue({
      usuarioId: OWNER_ID,
      fotos: ["https://example.com/foto.jpg"],
    } as never);
    vi.mocked(prisma.anuncio.delete).mockResolvedValue({} as never);

    await anuncioService.remove(OWNER_ID, ANUNCIO_ID);

    expect(prisma.anuncio.delete).toHaveBeenCalledWith({
      where: { id: ANUNCIO_ID },
    });
    expect(uploadService.deleteFiles).toHaveBeenCalledWith([
      "https://example.com/foto.jpg",
    ]);
  });
});
