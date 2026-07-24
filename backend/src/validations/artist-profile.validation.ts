import { z } from "zod";

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

  state: z
    .string()
    .trim()
    .min(2, "State is required.")
    .max(50),

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