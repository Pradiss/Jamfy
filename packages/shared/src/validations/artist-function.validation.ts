import { z } from "zod";

const artistFunctionItemSchema = z.object({
  functionId: z
    .string()
    .uuid("O ID da função artística é inválido."),

  primary: z
    .boolean()
    .default(false),
});

export const saveArtistFunctionsSchema = z
  .object({
    body: z.object({
      functions: z
        .array(artistFunctionItemSchema)
        .min(1, "Selecione pelo menos uma função artística.")
        .max(10, "Você pode selecionar no máximo 10 funções artísticas."),
    }),
  })
  .superRefine((data, context) => {
    const functions = data.body.functions;

    
    const uniqueFunctionIds = new Set(
      functions.map((item) => item.functionId),
    );

    if (uniqueFunctionIds.size !== functions.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "functions"],
        message: "Não é permitido selecionar funções artísticas duplicadas.",
      });
    }

  
    const primaryFunctions = functions.filter(
      (item) => item.primary,
    );

    if (primaryFunctions.length > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "functions"],
        message: "Apenas uma função artística pode ser marcada como principal.",
      });
    }
  });

export const removeArtistFunctionSchema = z.object({
  params: z.object({
    functionId: z
      .string()
      .uuid("O ID da função artística é inválido."),
  }),
});

export type SaveArtistFunctionsInput = z.infer<
  typeof saveArtistFunctionsSchema
>["body"];

export type RemoveArtistFunctionParams = z.infer<
  typeof removeArtistFunctionSchema
>["params"];