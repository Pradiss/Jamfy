import { z } from "zod";

// RESERVADO is also allowed here — it's how an artist marks a day as
// booked when the deal was closed off-platform (a show arranged outside
// Jamfy), distinct from INDISPONIVEL (just not working that day).
const manualAgendaStatusSchema = z.enum(
  ["DISPONIVEL", "INDISPONIVEL", "RESERVADO"],
  {
    message: "Status inválido.",
  },
);

export const createAgendaEntrySchema = z.object({
  body: z
    .object({
      dataInicio: z.coerce.date(),
      dataFim: z.coerce.date(),
      diaInteiro: z.boolean().optional(),
      status: manualAgendaStatusSchema,

      titulo: z
        .string()
        .trim()
        .max(120, "O título deve possuir no máximo 120 caracteres.")
        .optional(),

      observacao: z
        .string()
        .trim()
        .max(2000, "A observação deve possuir no máximo 2000 caracteres.")
        .optional(),
    })
    .refine((data) => data.dataFim > data.dataInicio, {
      message: "A data final deve ser posterior à data inicial.",
      path: ["dataFim"],
    }),
});

export const updateAgendaEntrySchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do período de agenda inválido."),
  }),

  body: z
    .object({
      dataInicio: z.coerce.date().optional(),
      dataFim: z.coerce.date().optional(),
      diaInteiro: z.boolean().optional(),
      status: manualAgendaStatusSchema.optional(),

      titulo: z
        .string()
        .trim()
        .max(120, "O título deve possuir no máximo 120 caracteres.")
        .optional(),

      observacao: z
        .string()
        .trim()
        .max(2000, "A observação deve possuir no máximo 2000 caracteres.")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe pelo menos um campo para atualizar.",
    })
    .refine(
      (data) =>
        !data.dataInicio || !data.dataFim || data.dataFim > data.dataInicio,
      {
        message: "A data final deve ser posterior à data inicial.",
        path: ["dataFim"],
      },
    ),
});

export const agendaIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID do período de agenda inválido."),
  }),
});

export const agendaQuerySchema = z.object({
  query: z.object({
    de: z.coerce.date().optional(),
    ate: z.coerce.date().optional(),
  }),
});

export const publicAgendaParamsSchema = z.object({
  params: z.object({
    artistaId: z.string().uuid("ID do artista inválido."),
  }),
  query: z.object({
    de: z.coerce.date().optional(),
    ate: z.coerce.date().optional(),
  }),
});

export type CreateAgendaEntryBody = z.infer<
  typeof createAgendaEntrySchema
>["body"];

export type UpdateAgendaEntryBody = z.infer<
  typeof updateAgendaEntrySchema
>["body"];

export type AgendaParams = z.infer<typeof agendaIdSchema>["params"];

export type AgendaQuery = z.infer<typeof agendaQuerySchema>["query"];

export type PublicAgendaParams = z.infer<
  typeof publicAgendaParamsSchema
>["params"];
