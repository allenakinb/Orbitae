/** Bound session/data requests: a network stall must never leave an endless spinner. */
export async function withDeadline<T>(operation: PromiseLike<T>, milliseconds = 20000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Session loading timed out")), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
