/**
 * AVISOS DO FRETE GRÁTIS no carrinho e na etapa da oferta.
 * A regra vem de storeConfig.shipping.freeShipping (ex.: grátis a partir de 2 miniaturas).
 */

import { storeConfig } from '../config/store.js';
import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { money, toCents } from '../utils/format.js';
import { freeShippingUnlockedByBump } from '../utils/pricing.js';
import { getFreeShippingStatus } from '../utils/freeShipping.js';
import { estimateCartShipping } from '../services/shipping.js';

function chip(text, { on = false } = {}) {
  return html`<p class="ship-chip${on ? ' is-on' : ''}">${icon('truck', { size: 16 })}<span>${text}</span></p>`;
}

/** "Frete grátis a partir de 2 miniaturas — falta +1"  /  "Frete grátis desbloqueado 🎉" */
export function freeShippingChip(totals) {
  const status = getFreeShippingStatus(totals, storeConfig.shipping.freeShipping);
  if (!status.enabled || !status.text) return html``;
  return chip(status.text, { on: status.qualifies });
}

/**
 * Topo da etapa "Antes de finalizar...": se o pedido ainda não tem frete grátis e a miniatura
 * da oferta o libera, destaca isso (a promocional conta como unidade — ver countPromoUnits).
 */
export function offerShippingNotice(totals) {
  const fs = storeConfig.shipping.freeShipping;
  const status = getFreeShippingStatus(totals, fs);
  if (!status.enabled) return html``;
  if (status.qualifies) return chip(status.text, { on: true });

  if (freeShippingUnlockedByBump(totals, fs, toCents(storeConfig.upsellPrice))) {
    const estimate = estimateCartShipping(totals);
    const saving = estimate && !estimate.free ? ` (você economiza ${money(estimate.cents)})` : '';
    return chip(`Adicione uma miniatura da oferta e ganhe frete grátis${saving}.`);
  }
  return html``;
}
