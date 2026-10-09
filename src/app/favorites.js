/**
 * FAVORITOS — salvos no navegador (localStorage). Não exige cadastro.
 */

import { local } from '../utils/storage.js';
import { createEmitter } from '../utils/emitter.js';

const emitter = createEmitter();
export const subscribe = emitter.subscribe;

let ids = new Set((local.read('favorites', []) ?? []).map(Number));

const persist = () => {
  local.write('favorites', [...ids]);
  emitter.emit([...ids]);
};

export const isFavorite = (id) => ids.has(Number(id));
export const getFavoriteIds = () => [...ids];
export const count = () => ids.size;

/** Alterna e retorna o novo estado (true = favorito). */
export function toggle(id) {
  id = Number(id);
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  persist();
  return ids.has(id);
}
