import { z } from "zod";

const funcaoIntegranteSchema = z.enum(
  [
    "VOCAL",
    "GUITARRA",
    "VIOLAO",
    "BAIXO",
    "BATERIA",
    "TECLADO",
    "PERCUSSAO",
    "SAXOFONE",
    "TROMPETE",
    "ACORDEON",
    "VIOLINO",
    "DJ",
    "PRODUTOR",
    "OUTRO",
  ],
  {
    message: "Função de integrante inválida.",
  },
);

export const createBandMemberSchema = z.object({
  body: z.object({
    nome: z
      .string()
      .trim()
      .min(2, "O nome deve possuir no mínimo 2 caracteres.")
      .max(120, "O nome deve possuir no máximo 120 caracteres."),

    funcao: funcaoIntegranteSchema.optional(),

    outraFuncao: z
      .string()
      .trim()
      .max(80, "A função deve possuir no máximo 80 caracteres.")
      .optional(),

    instrumento: z
      .string()
      .trim()
      .max(80, "O instrumento deve possuir no máximo 80 caracteres.")
      .optional(),

    telefone: z
      .string()
      .trim()
      .max(20, "O telefone deve possuir no máximo 20 caracteres.")
      .optional(),

    instagramUrl: z
      .string()
      .trim()
      .url("Informe uma URL válida para o Instagram.")
      .optional(),

    fotoUrl: z
      .string()
      .trim()
      .url("Informe uma URL válida para a foto.")
      .optional(),

    ativo: z.boolean().optional(),
  }),
});

export const updateBandMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do integrante inválido."),
  }),

  body: z
    .object({
      nome: z
        .string()
        .trim()
        .min(2, "O nome deve possuir no mínimo 2 caracteres.")
        .max(120, "O nome deve possuir no máximo 120 caracteres.")
        .optional(),

      funcao: funcaoIntegranteSchema.optional(),

      outraFuncao: z
        .string()
        .trim()
        .max(80, "A função deve possuir no máximo 80 caracteres.")
        .optional(),

      instrumento: z
        .string()
        .trim()
        .max(80, "O instrumento deve possuir no máximo 80 caracteres.")
        .optional(),

      telefone: z
        .string()
        .trim()
        .max(20, "O telefone deve possuir no máximo 20 caracteres.")
        .optional(),

      instagramUrl: z
        .string()
        .trim()
        .url("Informe uma URL válida para o Instagram.")
        .optional(),

      fotoUrl: z
        .string()
        .trim()
        .url("Informe uma URL válida para a foto.")
        .optional(),

      ativo: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe pelo menos um campo para atualizar.",
    }),
});

export const bandMemberIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do integrante inválido."),
  }),
});

export type CreateBandMemberBody = z.infer<
  typeof createBandMemberSchema
>["body"];

export type UpdateBandMemberBody = z.infer<
  typeof updateBandMemberSchema
>["body"];

export type BandMemberParams = z.infer<typeof bandMemberIdSchema>["params"];
