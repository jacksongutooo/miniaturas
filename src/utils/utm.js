/**
 * Guarda os parâmetros de campanha (utm_*, fbclid, gclid...) da primeira visita da sessão
 * para anexar ao pedido no checkout (atribuição de vendas).
 */

import { session } from './storage.js';

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck', 'fbclid', 'gclid', 'ttclid'];

export function captureUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const found = {};
    KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) found[k] = v.slice(0, 200);
    });
    if (Object.keys(found).length > 0) session.write('utm', { ...session.read('utm', {}), ...found });
  } catch {
    /* ignorado */
  }
}

export const getUtm = () => session.read('utm', {});
