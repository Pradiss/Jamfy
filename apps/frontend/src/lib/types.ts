export type TipoUsuario = "MUSICO" | "BANDA" | "CONTRATANTE" | "ADMIN";
export type TipoArtista = "MUSICO" | "BANDA";

export type ArtistProfileSummary = {
  id: string;
  usuarioId: string;
  tipo: TipoArtista;
  nomeArtistico: string;
  slug: string;
  fotoCapaUrl: string | null;
  cidade: string;
  estado: string;
  pais: string;
  cache: string | null;
  aceitaViagem: boolean;
  disponivel: boolean;
  verificado: boolean;
  avaliacao: string | null;
  quantidadeAvaliacoes: number;
  visualizacoes: number;
  usuario: { fotoUrl: string | null };
  artistaFuncaos: { funcao: { nome: string } }[];
  instrumentos: { instrumento: { nome: string } }[];
  generos: { genero: { nome: string } }[];
};

export type ArtistProfileDetail = Omit<
  ArtistProfileSummary,
  "instrumentos" | "generos" | "artistaFuncaos" | "usuario"
> & {
  biografia: string | null;
  experiencia: string | null;
  criadoEm: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  tiktokUrl: string | null;
  siteUrl: string | null;
  usuario: {
    nome: string;
    fotoUrl: string | null;
  };
  instrumentos: {
    principal: boolean;
    instrumento: { id: string; nome: string };
  }[];
  generos: {
    principal: boolean;
    genero: { id: string; nome: string };
  }[];
  artistaFuncaos: {
    principal: boolean;
    funcao: { id: string; nome: string };
  }[];
  portfolio: {
    id: string;
    titulo: string | null;
    descricao: string | null;
    arquivoUrl: string;
    miniaturaUrl: string | null;
    tipo: "FOTO" | "VIDEO" | "AUDIO" | "YOUTUBE" | "OUTRO";
    destaque: boolean;
  }[];
  integrantes: {
    id: string;
    nome: string;
    funcao: string | null;
    outraFuncao: string | null;
    instrumento: string | null;
    instagramUrl: string | null;
    fotoUrl: string | null;
  }[];
};

export type MyArtistProfile = {
  id: string;
  tipo: TipoArtista;
  nomeArtistico: string;
  slug: string;
  biografia: string | null;
  experiencia: string | null;
  cache: string | null;
  fotoCapaUrl: string | null;
  cidade: string;
  estado: string;
  pais: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  tiktokUrl: string | null;
  siteUrl: string | null;
  aceitaViagem: boolean;
  disponivel: boolean;
  verificado: boolean;
  visualizacoes: number;
  avaliacao: string | null;
  quantidadeAvaliacoes: number;
};

export type ArtistProfileListResponse = {
  artistas: ArtistProfileSummary[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
};

export type AuthenticatedUser = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string | null;
  fotoUrl: string | null;
  tipo: TipoUsuario;
  ativo: boolean;
  perfilArtista: { id: string; slug: string; nomeArtistico: string } | null;
  perfilContratante: { id: string } | null;
};

export type StatusAgenda =
  | "DISPONIVEL"
  | "INDISPONIVEL"
  | "PENDENTE"
  | "RESERVADO";

export type OrigemAgenda = "ARTISTA" | "CONTRATACAO" | "ADMIN";

export type PublicAgendaEntry = {
  id: string;
  dataInicio: string;
  dataFim: string;
  diaInteiro: boolean;
  status: StatusAgenda;
};

export type AgendaEntry = PublicAgendaEntry & {
  origem: OrigemAgenda;
  titulo: string | null;
  observacao: string | null;
  solicitacaoId: string | null;
};

export type TipoEvento =
  | "SHOW"
  | "CASAMENTO"
  | "FORMATURA"
  | "ANIVERSARIO"
  | "BAR"
  | "RESTAURANTE"
  | "CORPORATIVO"
  | "RELIGIOSO"
  | "FESTIVAL"
  | "EVENTO_PUBLICO"
  | "EVENTO_PRIVADO"
  | "OUTRO";

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  SHOW: "Show",
  CASAMENTO: "Casamento",
  FORMATURA: "Formatura",
  ANIVERSARIO: "Aniversário",
  BAR: "Bar",
  RESTAURANTE: "Restaurante",
  CORPORATIVO: "Corporativo",
  RELIGIOSO: "Religioso",
  FESTIVAL: "Festival",
  EVENTO_PUBLICO: "Evento público",
  EVENTO_PRIVADO: "Evento privado",
  OUTRO: "Outro",
};

export type StatusSolicitacao = "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA";

export const STATUS_SOLICITACAO_LABELS: Record<StatusSolicitacao, string> = {
  PENDENTE: "Pendente",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
};

export type HiringRequestArtistSummary = {
  id: string;
  nomeArtistico: string;
  slug: string;
  fotoCapaUrl: string | null;
  usuarioId: string;
  // Only populated once the request is ACEITA.
  telefone: string | null;
  whatsapp: string | null;
};

export type HiringRequestContratanteSummary = {
  id: string;
  nome: string;
  // Only populated once the request is ACEITA.
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
};

export type HiringRequest = {
  id: string;
  descricao: string;
  tipoEvento: TipoEvento | null;
  dataEvento: string | null;
  nomeLocal: string | null;
  cidade: string;
  estado: string;
  endereco: string | null;
  orcamento: string | null;
  status: StatusSolicitacao;
  criadoEm: string;
  artista?: HiringRequestArtistSummary;
  contratante?: HiringRequestContratanteSummary;
};

export type TipoNotificacao =
  | "SOLICITACAO_CRIADA"
  | "SOLICITACAO_ACEITA"
  | "SOLICITACAO_RECUSADA"
  | "SOLICITACAO_CANCELADA";

export type Notification = {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
  solicitacaoId: string | null;
};

export type NotificationListResponse = {
  notificacoes: Notification[];
  naoLidas: number;
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
};
