import { prisma } from "../config/prisma.js";
import {
  TipoArtista,
  TipoUsuario,
} from "../../generated/prisma/client.js";



import type {
  CreateArtistProfileInput,
  UpdateArtistProfileInput,
} from "../validations/artist-profile.validation.js";

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
      data: {
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