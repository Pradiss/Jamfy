import { z } from "zod";
import { UF_SIGLAS } from "../constants/estados-brasil.js";

const optionalUrl = z
  .string()
  .trim()
  .url("Invalid URL.")
  .optional()
  .nullable();

export const createArtistProfileSchema = z.object({
  artisticName: z
    .string()
    .trim()
    .min(2, "Artistic name must have at least 2 characters.")
    .max(100, "Artistic name must have at most 100 characters."),

  biography: z
    .string()
    .trim()
    .max(1000, "Biography must have at most 1000 characters.")
    .optional(),

  experience: z
    .string()
    .trim()
    .max(500, "Experience must have at most 500 characters.")
    .optional(),

  fee: z
    .number()
    .nonnegative("Fee cannot be negative.")
    .optional(),

  coverPhotoUrl: optionalUrl,

  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(100),

  state: z.enum(UF_SIGLAS, { message: "Invalid state." }),

  country: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .default("Brasil"),

  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  spotifyUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  websiteUrl: optionalUrl,

  acceptsTravel: z.boolean().default(false),
  available: z.boolean().default(true),
});

export const updateArtistProfileSchema =
  createArtistProfileSchema.partial();

export type CreateArtistProfileInput = z.infer<
  typeof createArtistProfileSchema
>;

export type UpdateArtistProfileInput = z.infer<
  typeof updateArtistProfileSchema
>;

const optionalBooleanFlag = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === "true"));

export const listArtistProfilesQuerySchema = z.object({
  tipo: z.enum(["MUSICO", "BANDA"]).optional(),

  cidade: z.string().trim().min(1).optional(),
  estado: z.enum(UF_SIGLAS, { message: "UF inválida." }).optional(),

  generoId: z.string().uuid("Invalid genre ID.").optional(),
  instrumentoId: z.string().uuid("Invalid instrument ID.").optional(),

  disponivel: optionalBooleanFlag,

  busca: z.string().trim().min(1).optional(),

  precoMin: z.coerce.number().nonnegative().optional(),
  precoMax: z.coerce.number().nonnegative().optional(),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListArtistProfilesQuery = z.infer<
  typeof listArtistProfilesQuerySchema
>;