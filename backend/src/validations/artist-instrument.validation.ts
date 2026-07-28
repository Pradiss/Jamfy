import { z } from "zod";

const artistInstrumentItemSchema = z.object({
  instrumentId: z
    .string()
    .uuid("O ID do instrumento deve ser um UUID válido."),

  primary: z.boolean().optional().default(false),
});

export const saveArtistInstrumentsSchema = z
  .object({
    body: z.object({
      instruments: z
        .array(artistInstrumentItemSchema)
        .min(1, "Informe pelo menos um instrumento."),
    }),
  })
  .superRefine((data, context) => {
    const instrumentIds = data.body.instruments.map(
      (instrument) => instrument.instrumentId,
    );

    const uniqueInstrumentIds = new Set(instrumentIds);

    if (uniqueInstrumentIds.size !== instrumentIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "instruments"],
        message: "Não é permitido informar instrumentos repetidos.",
      });
    }

    const primaryInstruments = data.body.instruments.filter(
      (instrument) => instrument.primary,
    );

    if (primaryInstruments.length > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "instruments"],
        message: "Apenas um instrumento pode ser definido como principal.",
      });
    }
  });

export const removeArtistInstrumentSchema = z.object({
  params: z.object({
    instrumentId: z
      .string()
      .uuid("O ID do instrumento deve ser um UUID válido."),
  }),
});

export type SaveArtistInstrumentsInput = z.infer<
  typeof saveArtistInstrumentsSchema
>["body"];

export type RemoveArtistInstrumentInput = z.infer<
  typeof removeArtistInstrumentSchema
>["params"];