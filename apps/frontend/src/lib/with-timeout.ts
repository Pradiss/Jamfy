// Wraps a promise that has no abort/timeout option of its own (e.g. a
// Supabase SDK call) so it rejects instead of hanging forever when the
// upstream service is slow or unreachable.
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Tempo de resposta esgotado.")),
      timeoutMs,
    );

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
