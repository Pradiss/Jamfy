import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../config/prisma.js", () => ({
  prisma: {
    solicitacaoContratacao: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const { prisma } = await import("../config/prisma.js");
const { hiringRequestService } = await import("./hiring-request.service.js");
const { StatusSolicitacao } = await import("../../generated/prisma/client.js");

const ARTIST_OWNER_ID = "artist-user-1";
const HIRER_ID = "hirer-user-1";
const OTHER_USER_ID = "some-other-user";
const REQUEST_ID = "request-1";

function pendingRequestForArtist(overrides: Record<string, unknown> = {}) {
  return {
    id: REQUEST_ID,
    status: StatusSolicitacao.PENDENTE,
    dataEvento: null,
    numeroSets: 1,
    duracaoSetMinutos: 60,
    intervaloMinutos: 0,
    contratanteId: HIRER_ID,
    artista: { id: "artist-profile-1", usuarioId: ARTIST_OWNER_ID },
    ...overrides,
  };
}

describe("hiringRequestService.decline (resolveAsArtist)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when the caller isn't the request's artist", async () => {
    vi.mocked(prisma.solicitacaoContratacao.findUnique).mockResolvedValue(
      pendingRequestForArtist() as never,
    );

    await expect(
      hiringRequestService.decline(OTHER_USER_ID, REQUEST_ID),
    ).rejects.toThrow("Solicitação de contratação não encontrada.");

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects when the request is no longer pending", async () => {
    vi.mocked(prisma.solicitacaoContratacao.findUnique).mockResolvedValue(
      pendingRequestForArtist({ status: StatusSolicitacao.ACEITA }) as never,
    );

    await expect(
      hiringRequestService.decline(ARTIST_OWNER_ID, REQUEST_ID),
    ).rejects.toThrow("Somente solicitações pendentes podem ser respondidas.");

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("lets the request's artist decline it", async () => {
    vi.mocked(prisma.solicitacaoContratacao.findUnique).mockResolvedValue(
      pendingRequestForArtist() as never,
    );

    const transactionClient = {
      solicitacaoContratacao: { update: vi.fn().mockResolvedValue({}) },
      agendaArtista: {
        deleteMany: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      notificacao: { create: vi.fn().mockResolvedValue({}) },
    };
    vi.mocked(prisma.$transaction).mockImplementation((callback) =>
      (
        callback as unknown as (tx: typeof transactionClient) => unknown
      )(transactionClient) as never,
    );

    await hiringRequestService.decline(ARTIST_OWNER_ID, REQUEST_ID);

    expect(transactionClient.solicitacaoContratacao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: REQUEST_ID },
        data: { status: StatusSolicitacao.RECUSADA },
      }),
    );
    expect(transactionClient.agendaArtista.deleteMany).toHaveBeenCalledWith({
      where: { solicitacaoId: REQUEST_ID },
    });
    expect(transactionClient.notificacao.create).toHaveBeenCalledOnce();
  });
});

describe("hiringRequestService.cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockTransaction() {
    const transactionClient = {
      solicitacaoContratacao: { update: vi.fn().mockResolvedValue({}) },
      agendaArtista: { deleteMany: vi.fn().mockResolvedValue({}) },
      notificacao: { create: vi.fn().mockResolvedValue({}) },
    };
    vi.mocked(prisma.$transaction).mockImplementation((callback) =>
      (
        callback as unknown as (tx: typeof transactionClient) => unknown
      )(transactionClient) as never,
    );
    return transactionClient;
  }

  it("rejects when the caller is neither the hirer nor the artist", async () => {
    vi.mocked(prisma.solicitacaoContratacao.findUnique).mockResolvedValue(
      pendingRequestForArtist() as never,
    );

    await expect(
      hiringRequestService.cancel(OTHER_USER_ID, REQUEST_ID),
    ).rejects.toThrow("Solicitação de contratação não encontrada.");

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects once the request is already settled (declined/canceled)", async () => {
    vi.mocked(prisma.solicitacaoContratacao.findUnique).mockResolvedValue(
      pendingRequestForArtist({
        status: StatusSolicitacao.RECUSADA,
      }) as never,
    );

    await expect(
      hiringRequestService.cancel(HIRER_ID, REQUEST_ID),
    ).rejects.toThrow("Essa solicitação não pode mais ser cancelada.");

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("lets the hirer cancel a pending request", async () => {
    vi.mocked(prisma.solicitacaoContratacao.findUnique).mockResolvedValue(
      pendingRequestForArtist() as never,
    );
    const transactionClient = mockTransaction();

    await hiringRequestService.cancel(HIRER_ID, REQUEST_ID);

    expect(transactionClient.solicitacaoContratacao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: REQUEST_ID },
        data: { status: StatusSolicitacao.CANCELADA },
      }),
    );
    expect(transactionClient.notificacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ usuarioId: ARTIST_OWNER_ID }),
      }),
    );
  });

  it("lets either side cancel an already-accepted booking, notifying the other side", async () => {
    vi.mocked(prisma.solicitacaoContratacao.findUnique).mockResolvedValue(
      pendingRequestForArtist({ status: StatusSolicitacao.ACEITA }) as never,
    );
    const transactionClient = mockTransaction();

    await hiringRequestService.cancel(ARTIST_OWNER_ID, REQUEST_ID);

    expect(transactionClient.solicitacaoContratacao.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: StatusSolicitacao.CANCELADA } }),
    );
    expect(transactionClient.agendaArtista.deleteMany).toHaveBeenCalledWith({
      where: { solicitacaoId: REQUEST_ID },
    });
    expect(transactionClient.notificacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ usuarioId: HIRER_ID }),
      }),
    );
  });
});
