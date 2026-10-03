import { z } from "zod";

const tipoDenunciaSchema = z.enum(["SOLICITACAO", "ANUNCIO", "USUARIO"], {
  message: "Tipo de denúncia inválido.",
});

const motivoDenunciaSchema = z.enum(
  ["GOLPE", "CONTEUDO_INAPROPRIADO", "SPAM", "INFORMACAO_FALSA", "OUTRO"],
  { message: "Motivo de denúncia inválido." },
);

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

export type CreateDenunciaBody = z.infer<typeof createDenunciaSchema>["body"];
