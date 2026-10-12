import { z } from "zod";

const tipoDenunciaSchema = z.enum(["SOLICITACAO", "ANUNCIO", "USUARIO"], {
  message: "Tipo de denúncia inválido.",
});

const motivoDenunciaSchema = z.enum(
  ["GOLPE", "CONTEUDO_INAPROPRIADO", "SPAM", "INFORMACAO_FALSA", "OUTRO"],
  { message: "Motivo de denúncia inválido." },
);

const statusDenunciaSchema = z.enum(["PENDENTE", "EM_ANALISE", "RESOLVIDA"], {
  message: "Status de denúncia inválido.",
});

export const createDenunciaSchema = z.object({
  body: z.object({
    tipo: tipoDenunciaSchema,
    motivo: motivoDenunciaSchema,
    referenciaId: z.string().uuid("ID de referência inválido."),

    descricao: z
      .string()
      .trim()
      .max(1000, "A descrição deve possuir no máximo 1000 caracteres.")
      .optional(),
  }),
});

export const listDenunciasQuerySchema = z.object({
  query: z.object({
    status: statusDenunciaSchema.optional(),
    tipo: tipoDenunciaSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const updateDenunciaStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de denúncia inválido."),
  }),
  body: z.object({
    status: statusDenunciaSchema,
  }),
});

export type CreateDenunciaBody = z.infer<typeof createDenunciaSchema>["body"];
export type ListDenunciasQuery = z.infer<
  typeof listDenunciasQuerySchema
>["query"];
export type UpdateDenunciaStatusBody = z.infer<
  typeof updateDenunciaStatusSchema
>["body"];
