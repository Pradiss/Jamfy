import { z } from "zod";

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da notificação inválido."),
  }),
});

export const listNotificationsQuerySchema = z.object({
  query: z.object({
    apenasNaoLidas: z
      .enum(["true", "false"])
      .optional()
      .transform((value) =>
        value === undefined ? undefined : value === "true",
      ),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type NotificationParams = z.infer<typeof notificationIdSchema>["params"];

export type ListNotificationsQuery = z.infer<
  typeof listNotificationsQuerySchema
>["query"];
