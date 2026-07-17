import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

type RequestSchemaData = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export function validate(schema: ZodType) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as RequestSchemaData;

      if (data.body !== undefined) {
        req.body = data.body;
      }

      if (data.params !== undefined) {
        req.params = data.params as Request["params"];
      }

      if (data.query !== undefined) {
        req.query = data.query as Request["query"];
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error.",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };
}
