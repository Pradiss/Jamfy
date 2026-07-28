import { z } from "zod";

export const createGenreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome do genero deve ter pelo menos 2 caracteres")
    .max(80, "O nome do genero deve ter no máximo 80 caracteres"),

  active: z.boolean().optional().default(true),
});

export const updateGenreSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome do genero deve ter pelo menos 2 caracteres")
      .max(80, "O nome do genero deve ter no máximo 80 caracteres")
      .optional(),

    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe pelo menos um campo para atualização",
  });

export type CreateGenreInput = z.infer<
  typeof createGenreSchema
>;

export type UpdateGenreInput = z.infer<
  typeof updateGenreSchema
>;