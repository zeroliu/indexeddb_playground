export function nextFrame<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        resolve(callback());
      }, 0);
    });
  });
}
