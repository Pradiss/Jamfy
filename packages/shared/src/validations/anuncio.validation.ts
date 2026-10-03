import { z } from "zod";
import { UF_SIGLAS } from "../constants/estados-brasil.js";

const tipoAnuncioSchema = z.enum(["VENDA", "COMPRA", "ALUGUEL"], {
  message: "Tipo de anúncio inválido.",
});

const statusAnuncioSchema = z.enum(["ATIVO", "CONCLUIDO", "INATIVO"], {
  message: "Status de anúncio inválido.",
});

export const createAnuncioSchema = z.object({
  body: z.object({
    tipo: tipoAnuncioSchema,

    titulo: z
      .string()
      .trim()
      .min(3, "O título deve possuir no mínimo 3 caracteres.")
      .max(160, "O título deve possuir no máximo 160 caracteres."),

    descricao: z
      .string()
      .trim()
      .min(10, "A descrição deve possuir no mínimo 10 caracteres.")
      .max(3000, "A descrição deve possuir no máximo 3000 caracteres."),

    categoria: z
      .string()
      .trim()
      .min(2, "Informe a categoria do anúncio.")
      .max(80, "A categoria deve possuir no máximo 80 caracteres."),

    preco: z
      .number()
      .nonnegative("O preço não pode ser negativo.")
      .optional(),

    cidade: z
      .string()
      .trim()
      .min(2, "A cidade é obrigatória.")
      .max(120, "A cidade deve possuir no máximo 120 caracteres."),

    estado: z.enum(UF_SIGLAS, { message: "Informe uma UF válida." }),

    fotos: z
      .array(z.string().trim().url("Informe uma URL válida para a foto."))
      .max(8, "Você pode enviar no máximo 8 fotos.")
      .optional()
      .default([]),
  }),
});

export const updateAnuncioSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do anúncio inválido."),
  }),

  body: z
    .object({
      tipo: tipoAnuncioSchema.optional(),

      titulo: z
        .string()
        .trim()
        .min(3, "O título deve possuir no mínimo 3 caracteres.")
        .max(160, "O título deve possuir no máximo 160 caracteres.")
        .optional(),

      descricao: z
        .string()
        .trim()
        .min(10, "A descrição deve possuir no mínimo 10 caracteres.")
        .max(3000, "A descrição deve possuir no máximo 3000 caracteres.")
        .optional(),

      categoria: z
        .string()
        .trim()
        .min(2, "Informe a categoria do anúncio.")
        .max(80, "A categoria deve possuir no máximo 80 caracteres.")
        .optional(),

      preco: z
        .number()
        .nonnegative("O preço não pode ser negativo.")
        .optional(),

      cidade: z
        .string()
        .trim()
        .min(2, "A cidade é obrigatória.")
        .max(120, "A cidade deve possuir no máximo 120 caracteres.")
        .optional(),

      estado: z.enum(UF_SIGLAS, { message: "Informe uma UF válida." }).optional(),

      fotos: z
        .array(z.string().trim().url("Informe uma URL válida para a foto."))
        .max(8, "Você pode enviar no máximo 8 fotos.")
        .optional(),

      status: statusAnuncioSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe pelo menos um campo para atualizar.",
    }),
});

export const anuncioIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do anúncio inválido."),
  }),
});

export const listAnunciosQuerySchema = z.object({
  query: z.object({
    tipo: tipoAnuncioSchema.optional(),
    categoria: z.string().trim().min(1).optional(),
    cidade: z.string().trim().min(1).optional(),
    estado: z.enum(UF_SIGLAS, { message: "Informe uma UF válida." }).optional(),
    busca: z.string().trim().min(1).optional(),
    precoMin: z.coerce.number().nonnegative().optional(),
    precoMax: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type CreateAnuncioBody = z.infer<typeof createAnuncioSchema>["body"];
export type UpdateAnuncioBody = z.infer<typeof updateAnuncioSchema>["body"];
export type AnuncioIdParams = z.infer<typeof anuncioIdSchema>["params"];
export type ListAnunciosQuery = z.infer<typeof listAnunciosQuerySchema>["query"];
