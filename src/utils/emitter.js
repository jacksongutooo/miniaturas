/** Observável mínimo: subscribe(fn) devolve a função para cancelar. */
export function createEmitter() {
  const listeners = new Set();
  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    emit(...args) {
      listeners.forEach((fn) => fn(...args));
    },
  };
}
