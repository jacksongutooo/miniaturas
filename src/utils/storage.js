/**
 * Acesso seguro ao localStorage/sessionStorage.
 * (Em abas privativas ou com o armazenamento bloqueado, o navegador lança erro —
 * aqui isso é ignorado e o site continua funcionando, só sem persistência.)
 */

import { storeConfig } from '../config/store.js';

const prefix = (key) => `${storeConfig.storageKey}:${key}`;

function make(getStore) {
  return {
    read(key, fallback = null) {
      try {
        const raw = getStore().getItem(prefix(key));
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      try {
        getStore().setItem(prefix(key), JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        getStore().removeItem(prefix(key));
      } catch {
        /* ignorado */
      }
    },
  };
}

/** Persiste entre visitas (carrinho, favoritos). */
export const local = make(() => window.localStorage);
/** Dura só enquanto a aba está aberta (dados do checkout, último pedido). */
export const session = make(() => window.sessionStorage);
