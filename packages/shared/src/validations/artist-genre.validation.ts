import { z } from "zod";

export const saveArtistGenresSchema = z.object({
  body: z.object({
    genres: z
      .array(
        z.object({
          genreId: z
            .string()
            .uuid("O gênero musical informado deve possuir um UUID válido."),
        }),
      )
      .min(1, "Informe pelo menos um gênero musical."),
  }),
});