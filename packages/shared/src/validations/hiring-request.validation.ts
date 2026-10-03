import { z } from "zod";
import { UF_SIGLAS } from "../constants/estados-brasil.js";

const eventTypeSchema = z.enum(
  [
    "SHOW",
    "CASAMENTO",
    "FORMATURA",
    "ANIVERSARIO",
    "BAR",
    "RESTAURANTE",
    "CORPORATIVO",
    "RELIGIOSO",
    "FESTIVAL",
    "EVENTO_PUBLICO",
    "EVENTO_PRIVADO",
    "OUTRO",
  ],
  {
    message: "Tipo de evento inválido.",
  },
);

export const createHiringRequestSchema = z.object({
  body: z.object({
    artistaId: z.string().uuid("ID do artista inválido."),

    descricao: z
      .string()
      .trim()
      .min(10, "A descrição deve possuir no mínimo 10 caracteres.")
      .max(5000, "A descrição deve possuir no máximo 5000 caracteres."),

    tipoEvento: eventTypeSchema.optional(),

    dataEvento: z.coerce.date().optional(),

    nomeLocal: z
      .string()
      .trim()
      .max(160, "O nome do local deve possuir no máximo 160 caracteres.")
      .optional(),

    cidade: z
      .string()
      .trim()
      .min(2, "A cidade é obrigatória.")
      .max(120, "A cidade deve possuir no máximo 120 caracteres."),

    estado: z.enum(UF_SIGLAS, { message: "Informe uma UF válida." }),

    endereco: z
      .string()
      .trim()
      .max(255, "O endereço deve possuir no máximo 255 caracteres.")
      .optional(),

    orcamento: z
      .number()
      .nonnegative("O orçamento não pode ser negativo.")
      .optional(),

    // How the show itself is structured — e.g. 2 sets of 1h30 with a 20min
    // break between them, instead of one fixed block.
    numeroSets: z
      .number()
      .int()
      .min(1, "É preciso ao menos 1 set.")
      .max(6, "No máximo 6 sets.")
      .default(1),

    duracaoSetMinutos: z
      .number()
      .int()
      .min(15, "O set deve durar ao menos 15 minutos.")
      .max(240, "O set deve durar no máximo 4 horas.")
      .default(120),

    intervaloMinutos: z
      .number()
      .int()
      .min(0, "O intervalo não pode ser negativo.")
      .max(120, "O intervalo deve durar no máximo 2 horas.")
      .default(0),
  }),
});

export const hiringRequestIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da solicitação inválido."),
  }),
});

export type CreateHiringRequestBody = z.infer<
  typeof createHiringRequestSchema
>["body"];

export type HiringRequestParams = z.infer<
  typeof hiringRequestIdSchema
>["params"];
