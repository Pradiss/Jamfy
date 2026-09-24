export function requireParam(
  value: string | string[] | undefined,
  message: string,
): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(message);
  }

  return value;
}
