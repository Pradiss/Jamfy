import { prisma } from "../config/prisma.js";
import { supabaseAdmin, supabaseAuth } from "../config/supabase.js";
import { TipoUsuario } from "../../generated/prisma/client.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp?: string;
  photoUrl?: string;
  birthDate?: string;
  type: TipoUsuario;
}

interface LoginInput {
  email: string;
  password: string;
}

class AuthService {
  async register(data: RegisterInput) {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();

    const whatsapp = data.whatsapp?.trim() || null;
    const photoUrl = data.photoUrl?.trim() || null;

    const birthDate = data.birthDate
      ? this.parseBirthDate(data.birthDate)
      : null;

    const existingUser = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("Email already registered.");
    }

    const { data: authData, error: authError } = await supabaseAuth.auth.signUp(
      {
        email,
        password: data.password,
        options: {
          data: {
            name,
            userType: data.type,
          },
        },
      },
    );

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Could not create user in Supabase Auth.");
    }

    try {
      const user = await prisma.usuario.create({
        data: {
          id: authData.user.id,
          nome: name,
          email,
          telefone: phone,
          whatsapp,
          fotoUrl: photoUrl,
          dataNascimento: birthDate,
          tipo: data.type,
        },
      });

      return {
        user,
        accessToken: authData.session?.access_token ?? null,
        refreshToken: authData.session?.refresh_token ?? null,
        expiresAt: authData.session?.expires_at ?? null,
        requireEmailConfirmation: authData.session === null,
      };
    } catch (error) {
      const { error: rollbackError } =
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      if (rollbackError) {
        console.error(
          "Failed to rollback Supabase user:",
          rollbackError.message,
        );
      }

      console.error("Database registration error:", error);

      throw new Error("Could not complete user registration.");
    }
  }

  async login(data: LoginInput) {
    const email = data.email.trim().toLowerCase();

    const { data: authData, error: authError } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password: data.password,
      });

    if (authError) {
      throw new Error("Invalid email or password.");
    }

    if (!authData.user || !authData.session) {
      throw new Error("Could not create user session.");
    }

    const user = await prisma.usuario.findUnique({
      where: {
        id: authData.user.id,
      },
      include: {
        perfilArtista: true,
        perfilContratante: true,
      },
    });

    if (!user) {
      throw new Error("User profile not found.");
    }

    if (!user.ativo) {
      throw new Error("User account is disabled.");
    }

    return {
      user,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in,
      expiresAt: authData.session.expires_at,
    };
  }

  async getAuthenticatedUser(accessToken: string) {
    const { data: authData, error: authError } =
      await supabaseAuth.auth.getUser(accessToken);

    if (authError || !authData.user) {
      throw new Error("Invalid or expired access token.");
    }

    const user = await prisma.usuario.findUnique({
      where: {
        id: authData.user.id,
      },
      include: {
        perfilArtista: true,
        perfilContratante: true,
      },
    });

    if (!user) {
      throw new Error("User profile not found.");
    }

    if (!user.ativo) {
      throw new Error("User account is disabled.");
    }

    return user;
  }

  private parseBirthDate(value: string) {
    const normalizedValue = value.trim();

    const date = /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)
      ? new Date(`${normalizedValue}T12:00:00.000Z`)
      : new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid birth date.");
    }

    if (date > new Date()) {
      throw new Error("Birth date cannot be in the future.");
    }

    return date;
  }

  async refreshSession(refreshToken: string){
    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if(error || !data.session){
      throw new Error("Invalid or expired refresh token.")

    };

    return{
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
    };
  }
}

export const authService = new AuthService();
