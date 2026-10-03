import { z } from "zod";

const conteudoSchema = z
  .string()
  .trim()
  .min(2, "A mensagem deve possuir no mínimo 2 caracteres.")
  .max(2000, "A mensagem deve possuir no máximo 2000 caracteres.");

export const startConversaSchema = z.object({
  body: z.object({
    anuncioId: z.string().uuid("ID do anúncio inválido."),
    conteudo: conteudoSchema,
  }),
});

export const conversaIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da conversa inválido."),
  }),
});

export const sendMensagemSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da conversa inválido."),
  }),
  body: z.object({
    conteudo: conteudoSchema,
  }),
});

export type StartConversaBody = z.infer<typeof startConversaSchema>["body"];
export type ConversaParams = z.infer<typeof conversaIdSchema>["params"];
export type SendMensagemBody = z.infer<typeof sendMensagemSchema>["body"];
