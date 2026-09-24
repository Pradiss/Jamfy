type WithoutUndefined<T extends object> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

export function withoutUndefined<T extends object>(
  input: T,
): WithoutUndefined<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as WithoutUndefined<T>;
}
