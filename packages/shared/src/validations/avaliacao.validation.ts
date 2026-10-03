import { z } from "zod";

export const createAvaliacaoSchema = z.object({
  body: z.object({
    solicitacaoId: z.string().uuid("ID da solicitação inválido."),

    nota: z
      .number()
      .int("A nota deve ser um número inteiro.")
      .min(1, "A nota mínima é 1.")
      .max(5, "A nota máxima é 5."),

    comentario: z
      .string()
      .trim()
      .max(1000, "O comentário deve possuir no máximo 1000 caracteres.")
      .optional(),
  }),
});

export const listAvaliacoesQuerySchema = z.object({
  query: z.object({
    artistaId: z.string().uuid("ID do artista inválido."),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export type CreateAvaliacaoBody = z.infer<typeof createAvaliacaoSchema>["body"];
export type ListAvaliacoesQuery = z.infer<
  typeof listAvaliacoesQuerySchema
>["query"];
