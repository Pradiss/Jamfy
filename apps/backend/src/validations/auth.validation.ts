import { z } from "zod";
import { TipoUsuario } from "../../generated/prisma/client.js";

const birthDateSchema = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isNaN(Date.parse(value)),
    "Invalid birth date.",
  );

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Name must have at least 3 characters."),

    email: z
      .string()
      .trim()
      .email("Invalid email."),

    password: z
      .string()
      .min(8, "Password must have at least 8 characters."),

    phone: z
      .string()
      .trim()
      .min(10, "Invalid phone number."),

    whatsapp: z
      .string()
      .trim()
      .min(10, "Invalid WhatsApp number.")
      .optional(),

    photoUrl: z
      .string()
      .url("Invalid photo URL.")
      .optional(),

    birthDate: z
      .preprocess(
        (value) => (typeof value === "string" ? value.trim() : value),
        birthDateSchema,
      )
      .optional(),

    type: z.enum([
      TipoUsuario.MUSICO,
      TipoUsuario.BANDA,
      TipoUsuario.CONTRATANTE,
    ]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email."),

    password: z
      .string()
      .min(1, "Password is required."),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Name must have at least 3 characters.")
        .optional(),

      email: z
        .string()
        .trim()
        .email("Invalid email.")
        .optional(),

      phone: z
        .string()
        .trim()
        .min(10, "Invalid phone number.")
        .optional(),

      whatsapp: z
        .string()
        .trim()
        .min(10, "Invalid WhatsApp number.")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe pelo menos um campo para atualizar.",
    }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email."),
  }),
});
