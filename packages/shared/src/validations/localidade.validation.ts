import { z } from "zod";
import { UF_SIGLAS } from "../constants/estados-brasil.js";

export const listCidadesQuerySchema = z.object({
  query: z.object({
    uf: z.enum(UF_SIGLAS, { message: "UF inválida." }),
  }),
});

export type ListCidadesQuery = z.infer<typeof listCidadesQuerySchema>["query"];
