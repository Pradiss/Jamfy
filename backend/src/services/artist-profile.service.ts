import { prisma } from "../config/prisma.js";
import {
  TipoArtista,
  TipoUsuario,
} from "../generated/prisma/client.js";

interface CreateArtistProfileData {
  artisticName: string;
  biography?: string;
  experience?: string;
  fee?: number;

  coverPhotoUrl?: string;

  city: string;
  state: string;
  country?: string;

  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;

  acceptsTravel?: boolean;
  available?: boolean;
}

interface UpdateArtistProfileData {
  artisticName?: string;
  biography?: string | null;
  experience?: string | null;
  fee?: number | null;

  coverPhotoUrl?: string | null;

  city?: string;
  state?: string;
  country?: string;

  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  spotifyUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;

  acceptsTravel?: boolean;
  available?: boolean;
}

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

  private async generateSlug(artisticName: string) {
    const slugBase = this.createSlug(artisticName);

    const existingProfile = await prisma.perfilArtista.findUnique({
      where: {
        slug: slugBase,
      },
    });

    if (!existingProfile) {
      return slugBase;
    }

    return `${slugBase}-${Date.now()}`;
  }

  async create(userId: string, data: CreateArtistProfileData) {
    const user = await prisma.usuario.findUnique({
      where: {
        id: userId,
      },
      include: {
        perfilArtista: true,
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

    const artisticName = data.artisticName.trim();
    const city = data.city.trim();
    const state = data.state.trim();

    if (!artisticName || !city || !state) {
      throw new Error(
        "Artistic name, city and state are required.",
      );
    }

    if (data.fee !== undefined && data.fee < 0) {
      throw new Error("Fee cannot be negative.");
    }

    const artistType =
      user.tipo === TipoUsuario.BANDA
        ? TipoArtista.BANDA
        : TipoArtista.MUSICO;

    const slug = await this.generateSlug(artisticName);

    return prisma.perfilArtista.create({
      data: {
        tipo: artistType,
        nomeArtistico: artisticName,
        slug,

        biografia: data.biography?.trim() || null,
        experiencia: data.experience?.trim() || null,
        cache: data.fee,

        fotoCapaUrl: data.coverPhotoUrl?.trim() || null,

        cidade: city,
        estado: state,
        pais: data.country?.trim() || "Brasil",

        instagramUrl: data.instagramUrl?.trim() || null,
        facebookUrl: data.facebookUrl?.trim() || null,
        youtubeUrl: data.youtubeUrl?.trim() || null,
        spotifyUrl: data.spotifyUrl?.trim() || null,
        tiktokUrl: data.tiktokUrl?.trim() || null,
        siteUrl: data.websiteUrl?.trim() || null,

        aceitaViagem: data.acceptsTravel ?? false,
        disponivel: data.available ?? true,

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
        instrumentos: {
          include: {
            instrumento: true,
          },
        },
        generos: {
          include: {
            genero: true,
          },
        },
        integrantes: true,
        portfolio: true,
      },
    });

    if (!profile) {
      throw new Error("Artist profile not found.");
    }

    return profile;
  }

  async update(
    userId: string,
    data: UpdateArtistProfileData,
  ) {
    const profile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
    });

    if (!profile) {
      throw new Error("Artist profile not found.");
    }

    if (
      data.fee !== undefined &&
      data.fee !== null &&
      data.fee < 0
    ) {
      throw new Error("Fee cannot be negative.");
    }

    let slug = profile.slug;

    if (data.artisticName !== undefined) {
      data.artisticName = data.artisticName.trim();

      if (!data.artisticName) {
        throw new Error("Artistic name cannot be empty.");
      }

      if (data.artisticName !== profile.nomeArtistico) {
        slug = await this.generateSlug(data.artisticName);
      }
    }

    return prisma.perfilArtista.update({
      where: {
        usuarioId: userId,
      },
      data: {
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
      },
    });
  }
}

export const artistProfileService =
  new ArtistProfileService();

export type {
  CreateArtistProfileData,
  UpdateArtistProfileData,
};