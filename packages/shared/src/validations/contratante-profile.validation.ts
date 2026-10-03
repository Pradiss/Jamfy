import { z } from "zod";
import { UF_SIGLAS } from "../constants/estados-brasil.js";

export const upsertContratanteProfileSchema = z.object({
  body: z.object({
    nomeResponsavel: z
      .string()
      .trim()
      .max(120, "O nome do responsável deve possuir no máximo 120 caracteres.")
      .optional(),

    nomeEmpresa: z
      .string()
      .trim()
      .max(160, "O nome da empresa deve possuir no máximo 160 caracteres.")
      .optional(),

    cidade: z
      .string()
      .trim()
      .max(120, "A cidade deve possuir no máximo 120 caracteres.")
      .optional(),

    estado: z.enum(UF_SIGLAS, { message: "UF inválida." }).optional(),
  }),
});

export type UpsertContratanteProfileBody = z.infer<
  typeof upsertContratanteProfileSchema
>["body"];
