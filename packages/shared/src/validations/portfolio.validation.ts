import { z } from "zod";

const portfolioTypeSchema = z.enum(
  ["FOTO", "VIDEO", "AUDIO", "YOUTUBE", "OUTRO"],
  {
    message: "Tipo de portfólio inválido.",
  },
);

export const createPortfolioSchema = z.object({
  body: z.object({
    titulo: z
      .string()
      .trim()
      .max(160, "O título deve possuir no máximo 160 caracteres.")
      .optional(),

    descricao: z
      .string()
      .trim()
      .max(5000, "A descrição deve possuir no máximo 5000 caracteres.")
      .optional(),

    arquivoUrl: z
      .string()
      .trim()
      .url("Informe uma URL válida para o arquivo."),

    miniaturaUrl: z
      .string()
      .trim()
      .url("Informe uma URL válida para a miniatura.")
      .optional(),

    tipo: portfolioTypeSchema,

    destaque: z.boolean().optional(),

    ordem: z
      .number()
      .int("A ordem deve ser um número inteiro.")
      .min(0, "A ordem não pode ser negativa.")
      .optional(),
  }),
});

export const updatePortfolioSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do portfólio inválido."),
  }),

  body: z
    .object({
      titulo: z
        .string()
        .trim()
        .max(160, "O título deve possuir no máximo 160 caracteres.")
        .optional(),

      descricao: z
        .string()
        .trim()
        .max(5000, "A descrição deve possuir no máximo 5000 caracteres.")
        .optional(),

      arquivoUrl: z
        .string()
        .trim()
        .url("Informe uma URL válida para o arquivo.")
        .optional(),

      miniaturaUrl: z
        .string()
        .trim()
        .url("Informe uma URL válida para a miniatura.")
        .optional(),

      tipo: portfolioTypeSchema.optional(),

      destaque: z.boolean().optional(),

      ordem: z
        .number()
        .int("A ordem deve ser um número inteiro.")
        .min(0, "A ordem não pode ser negativa.")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe pelo menos um campo para atualizar.",
    }),
});

export const portfolioIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do portfólio inválido."),
  }),
});

export type CreatePortfolioBody = z.infer<
  typeof createPortfolioSchema
>["body"];

export type UpdatePortfolioBody = z.infer<
  typeof updatePortfolioSchema
>["body"];

export type PortfolioParams = z.infer<
  typeof portfolioIdSchema
>["params"];