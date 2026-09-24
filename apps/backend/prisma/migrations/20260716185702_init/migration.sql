-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('MUSICO', 'BANDA', 'CONTRATANTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoArtista" AS ENUM ('MUSICO', 'BANDA');

-- CreateEnum
CREATE TYPE "TipoPortfolio" AS ENUM ('FOTO', 'VIDEO', 'AUDIO', 'YOUTUBE', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "fotoUrl" TEXT,
    "tipo" "TipoUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilArtista" (
    "id" TEXT NOT NULL,
    "tipo" "TipoArtista" NOT NULL,
    "nomeArtistico" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "biografia" TEXT,
    "fotoPerfilUrl" TEXT,
    "fotoCapaUrl" TEXT,
    "telefoneContato" TEXT,
    "whatsappContato" TEXT,
    "emailContato" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Brasil',
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "spotifyUrl" TEXT,
    "tiktokUrl" TEXT,
    "siteUrl" TEXT,
    "aceitaViagem" BOOLEAN NOT NULL DEFAULT false,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "PerfilArtista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilContratante" (
    "id" TEXT NOT NULL,
    "nomeResponsavel" TEXT,
    "nomeEmpresa" TEXT,
    "telefoneContato" TEXT,
    "whatsappContato" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "PerfilContratante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrumento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Instrumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistaInstrumento" (
    "artistaId" TEXT NOT NULL,
    "instrumentoId" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArtistaInstrumento_pkey" PRIMARY KEY ("artistaId","instrumentoId")
);

-- CreateTable
CREATE TABLE "GeneroMusical" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GeneroMusical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistaGenero" (
    "artistaId" TEXT NOT NULL,
    "generoId" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArtistaGenero_pkey" PRIMARY KEY ("artistaId","generoId")
);

-- CreateTable
CREATE TABLE "IntegranteBanda" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT,
    "instrumento" TEXT,
    "telefone" TEXT,
    "instagramUrl" TEXT,
    "fotoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "bandaId" TEXT NOT NULL,

    CONSTRAINT "IntegranteBanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT,
    "descricao" TEXT,
    "arquivoUrl" TEXT NOT NULL,
    "miniaturaUrl" TEXT,
    "tipo" "TipoPortfolio" NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "artistaId" TEXT NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoContratacao" (
    "id" TEXT NOT NULL,
    "nomeContratante" TEXT,
    "telefoneContato" TEXT,
    "whatsappContato" TEXT,
    "descricao" TEXT NOT NULL,
    "tipoEvento" TEXT,
    "dataEvento" TIMESTAMP(3),
    "horarioEvento" TEXT,
    "nomeLocal" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "endereco" TEXT,
    "orcamento" DECIMAL(10,2),
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "contratanteId" TEXT NOT NULL,
    "artistaId" TEXT NOT NULL,

    CONSTRAINT "SolicitacaoContratacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_tipo_idx" ON "Usuario"("tipo");

-- CreateIndex
CREATE INDEX "Usuario_ativo_idx" ON "Usuario"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilArtista_slug_key" ON "PerfilArtista"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilArtista_usuarioId_key" ON "PerfilArtista"("usuarioId");

-- CreateIndex
CREATE INDEX "PerfilArtista_tipo_idx" ON "PerfilArtista"("tipo");

-- CreateIndex
CREATE INDEX "PerfilArtista_cidade_estado_idx" ON "PerfilArtista"("cidade", "estado");

-- CreateIndex
CREATE INDEX "PerfilArtista_disponivel_idx" ON "PerfilArtista"("disponivel");

-- CreateIndex
CREATE INDEX "PerfilArtista_nomeArtistico_idx" ON "PerfilArtista"("nomeArtistico");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilContratante_usuarioId_key" ON "PerfilContratante"("usuarioId");

-- CreateIndex
CREATE INDEX "PerfilContratante_cidade_estado_idx" ON "PerfilContratante"("cidade", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Instrumento_nome_key" ON "Instrumento"("nome");

-- CreateIndex
CREATE INDEX "ArtistaInstrumento_instrumentoId_idx" ON "ArtistaInstrumento"("instrumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneroMusical_nome_key" ON "GeneroMusical"("nome");

-- CreateIndex
CREATE INDEX "ArtistaGenero_generoId_idx" ON "ArtistaGenero"("generoId");

-- CreateIndex
CREATE INDEX "IntegranteBanda_bandaId_idx" ON "IntegranteBanda"("bandaId");

-- CreateIndex
CREATE INDEX "IntegranteBanda_ativo_idx" ON "IntegranteBanda"("ativo");

-- CreateIndex
CREATE INDEX "Portfolio_artistaId_idx" ON "Portfolio"("artistaId");

-- CreateIndex
CREATE INDEX "Portfolio_tipo_idx" ON "Portfolio"("tipo");

-- CreateIndex
CREATE INDEX "Portfolio_destaque_idx" ON "Portfolio"("destaque");

-- CreateIndex
CREATE INDEX "SolicitacaoContratacao_contratanteId_idx" ON "SolicitacaoContratacao"("contratanteId");

-- CreateIndex
CREATE INDEX "SolicitacaoContratacao_artistaId_idx" ON "SolicitacaoContratacao"("artistaId");

-- CreateIndex
CREATE INDEX "SolicitacaoContratacao_status_idx" ON "SolicitacaoContratacao"("status");

-- CreateIndex
CREATE INDEX "SolicitacaoContratacao_dataEvento_idx" ON "SolicitacaoContratacao"("dataEvento");

-- CreateIndex
CREATE INDEX "SolicitacaoContratacao_cidade_estado_idx" ON "SolicitacaoContratacao"("cidade", "estado");

-- AddForeignKey
ALTER TABLE "PerfilArtista" ADD CONSTRAINT "PerfilArtista_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilContratante" ADD CONSTRAINT "PerfilContratante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistaInstrumento" ADD CONSTRAINT "ArtistaInstrumento_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "PerfilArtista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistaInstrumento" ADD CONSTRAINT "ArtistaInstrumento_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "Instrumento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistaGenero" ADD CONSTRAINT "ArtistaGenero_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "PerfilArtista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistaGenero" ADD CONSTRAINT "ArtistaGenero_generoId_fkey" FOREIGN KEY ("generoId") REFERENCES "GeneroMusical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegranteBanda" ADD CONSTRAINT "IntegranteBanda_bandaId_fkey" FOREIGN KEY ("bandaId") REFERENCES "PerfilArtista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "PerfilArtista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContratacao" ADD CONSTRAINT "SolicitacaoContratacao_contratanteId_fkey" FOREIGN KEY ("contratanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContratacao" ADD CONSTRAINT "SolicitacaoContratacao_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "PerfilArtista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
