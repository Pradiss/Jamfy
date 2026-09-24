import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";
import {
  TipoArtista,
  TipoUsuario,
} from "../../generated/prisma/client.js";



import type {
  CreateArtistProfileInput,
  UpdateArtistProfileInput,
  ListArtistProfilesQuery,
} from "@jamfy/shared";

const publicArtistSummarySelect = {
  id: true,
  usuarioId: true,
  tipo: true,
  nomeArtistico: true,
  slug: true,
  fotoCapaUrl: true,
  cidade: true,
  estado: true,
  pais: true,
  cache: true,
  aceitaViagem: true,
  disponivel: true,
  verificado: true,
  avaliacao: true,
  quantidadeAvaliacoes: true,
  visualizacoes: true,
  usuario: {
    select: {
      fotoUrl: true,
    },
  },
  artistaFuncaos: {
    where: { principal: true },
    take: 1,
    select: {
      funcao: {
        select: { nome: true },
      },
    },
  },
  instrumentos: {
    where: { principal: true },
    take: 1,
    select: {
      instrumento: {
        select: { nome: true },
      },
    },
  },
  generos: {
    where: { principal: true },
    take: 1,
    select: {
      genero: {
        select: { nome: true },
      },
    },
  },
} as const;

class ArtistProfileService {
  private createSlug(name: string) {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  private async generateUniqueSlug(name: string) {
    const slugBase = this.createSlug(name);

    const existingProfile = await prisma.perfilArtista.findUnique({
      where: {
        slug: slugBase,
      },
      select: {
        id: true,
      },
    });

    if (!existingProfile) {
      return slugBase;
    }

    return `${slugBase}-${Date.now()}`;
  }

  async create(userId: string, data: CreateArtistProfileInput) {
    const user = await prisma.usuario.findUnique({
      where: {
        id: userId,
      },
      select: {
        tipo: true,
        ativo: true,
        perfilArtista: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.ativo) {
      throw new Error("User is inactive.");
    }

    if (
      user.tipo !== TipoUsuario.MUSICO &&
      user.tipo !== TipoUsuario.BANDA
    ) {
      throw new Error("User cannot create an artist profile.");
    }

    if (user.perfilArtista) {
      throw new Error("Artist profile already exists.");
    }

    const artistType =
      user.tipo === TipoUsuario.BANDA
        ? TipoArtista.BANDA
        : TipoArtista.MUSICO;

    const slug = await this.generateUniqueSlug(data.artisticName);

    return prisma.perfilArtista.create({
      data: withoutUndefined({
        tipo: artistType,
        nomeArtistico: data.artisticName,
        slug,

        biografia: data.biography,
        experiencia: data.experience,
        cache: data.fee,

        fotoCapaUrl: data.coverPhotoUrl,

        cidade: data.city,
        estado: data.state,
        pais: data.country,

        instagramUrl: data.instagramUrl,
        facebookUrl: data.facebookUrl,
        youtubeUrl: data.youtubeUrl,
        spotifyUrl: data.spotifyUrl,
        tiktokUrl: data.tiktokUrl,
        siteUrl: data.websiteUrl,

        aceitaViagem: data.acceptsTravel,
        disponivel: data.available,

        usuarioId: userId,
      }),
    });
  }

  async list({
    tipo,
    cidade,
    estado,
    generoId,
    instrumentoId,
    disponivel,
    busca,
    precoMin,
    precoMax,
    page,
    limit,
  }: ListArtistProfilesQuery) {
    const cacheFilter =
      precoMin !== undefined || precoMax !== undefined
        ? withoutUndefined({ gte: precoMin, lte: precoMax })
        : undefined;

    const where = withoutUndefined({
      tipo,
      disponivel,
      cidade: cidade
        ? { equals: cidade, mode: "insensitive" as const }
        : undefined,
      estado: estado?.toUpperCase(),
      nomeArtistico: busca
        ? { contains: busca, mode: "insensitive" as const }
        : undefined,
      cache: cacheFilter,
      instrumentos: instrumentoId
        ? { some: { instrumentoId } }
        : undefined,
      generos: generoId ? { some: { generoId } } : undefined,
    });

    const [items, total] = await Promise.all([
      prisma.perfilArtista.findMany({
        where,
        select: publicArtistSummarySelect,
        orderBy: [
          { verificado: "desc" },
          { avaliacao: "desc" },
          { visualizacoes: "desc" },
          { criadoEm: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.perfilArtista.count({ where }),
    ]);

    return {
      artistas: items,
      paginacao: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async findBySlug(slug: string) {
    const profile = await prisma.perfilArtista.findUnique({
      where: {
        slug,
      },
      select: {
        ...publicArtistSummarySelect,
        biografia: true,
        experiencia: true,
        criadoEm: true,
        instagramUrl: true,
        facebookUrl: true,
        youtubeUrl: true,
        spotifyUrl: true,
        tiktokUrl: true,
        siteUrl: true,
        usuario: {
          select: {
            nome: true,
            fotoUrl: true,
          },
        },
        instrumentos: {
          select: {
            principal: true,
            instrumento: {
              select: { id: true, nome: true },
            },
          },
        },
        generos: {
          select: {
            principal: true,
            genero: {
              select: { id: true, nome: true },
            },
          },
        },
        artistaFuncaos: {
          select: {
            principal: true,
            funcao: {
              select: { id: true, nome: true },
            },
          },
        },
        portfolio: {
          orderBy: [{ destaque: "desc" }, { ordem: "asc" }],
        },
        integrantes: {
          where: {
            ativo: true,
          },
          orderBy: {
            criadoEm: "asc",
          },
          select: {
            id: true,
            nome: true,
            funcao: true,
            outraFuncao: true,
            instrumento: true,
            instagramUrl: true,
            fotoUrl: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Artist profile not found.");
    }

    prisma.perfilArtista
      .update({
        where: { slug },
        data: { visualizacoes: { increment: 1 } },
      })
      .catch((error) => {
        console.error("Failed to update artist view count:", error);
      });

    return profile;
  }

  async findMe(userId: string) {
    const profile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            whatsapp: true,
            fotoUrl: true,
            tipo: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Artist profile not found.");
    }

    return profile;
  }

  async update(
    userId: string,
    data: UpdateArtistProfileInput,
  ) {
    const profile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      select: {
        nomeArtistico: true,
        slug: true,
      },
    });

    if (!profile) {
      throw new Error("Artist profile not found.");
    }

    let slug = profile.slug;

    if (
      data.artisticName &&
      data.artisticName !== profile.nomeArtistico
    ) {
      slug = await this.generateUniqueSlug(data.artisticName);
    }

    return prisma.perfilArtista.update({
      where: {
        usuarioId: userId,
      },
      data: withoutUndefined({
        nomeArtistico: data.artisticName,
        slug,

        biografia: data.biography,
        experiencia: data.experience,
        cache: data.fee,

        fotoCapaUrl: data.coverPhotoUrl,

        cidade: data.city,
        estado: data.state,
        pais: data.country,

        instagramUrl: data.instagramUrl,
        facebookUrl: data.facebookUrl,
        youtubeUrl: data.youtubeUrl,
        spotifyUrl: data.spotifyUrl,
        tiktokUrl: data.tiktokUrl,
        siteUrl: data.websiteUrl,

        aceitaViagem: data.acceptsTravel,
        disponivel: data.available,
      }),
    });
  }
}

export const artistProfileService =
  new ArtistProfileService();