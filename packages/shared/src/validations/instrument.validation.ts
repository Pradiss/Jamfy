import { z } from "zod";

export const createInstrumentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome do instrumento deve ter pelo menos 2 caracteres")
    .max(80, "O nome do instrumento deve ter no máximo 80 caracteres"),

  active: z.boolean().optional().default(true),
});

export const updateInstrumentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome do instrumento deve ter pelo menos 2 caracteres")
      .max(80, "O nome do instrumento deve ter no máximo 80 caracteres")
      .optional(),

    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe pelo menos um campo para atualização",
  });

export type CreateInstrumentInput = z.infer<
  typeof createInstrumentSchema
>;

export type UpdateInstrumentInput = z.infer<
  typeof updateInstrumentSchema
>;