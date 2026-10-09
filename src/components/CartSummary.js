/**
 * Linhas do resumo de valores — reutilizado no carrinho e no checkout.
 *
 *   Subtotal            R$ 71,60
 *   Desconto 15%       -R$ 10,74
 *   Miniatura promocional R$ 12,90
 *   Frete               R$ 5,90  ou  Grátis (a partir de 2 miniaturas)
 *   Economia            R$ 15,74
 *   Total               R$ 73,76
 */

import { html } from '../utils/html.js';
import { money } from '../utils/format.js';

/**
 * @param {object} totals  resultado de computeTotals (centavos)
 * @param {{ shipping?: {label:string, cents:number|null, free?:boolean}|null, showShipping?: boolean, showTotal?: boolean }} opts
 */
export function summaryRows(totals, { shipping = null, showShipping = false, showTotal = true } = {}) {
  const shippingCents = shipping?.cents ?? 0;
  const grand = totals.total + shippingCents;

  return html`<dl class="summary">
    <div class="summary__row"><dt>Subtotal</dt><dd>${money(totals.subtotal)}</dd></div>
    ${totals.discountPercent > 0
      ? html`<div class="summary__row summary__row--discount"><dt>Desconto progressivo (${totals.discountPercent}%)</dt><dd>−${money(totals.discount)}</dd></div>`
      : ''}
    ${totals.bumpCount > 0
      ? html`<div class="summary__row"><dt>Miniatura promocional</dt><dd>${money(totals.bumpTotal)}</dd></div>`
      : ''}
    ${showShipping
      ? html`<div class="summary__row${shipping?.free ? ' summary__row--free' : ''}"><dt>Frete</dt><dd>${shipping ? (shipping.free ? 'Grátis' : money(shipping.cents)) : html`<span class="muted">A calcular</span>`}</dd></div>`
      : ''}
    ${totals.savings > 0
      ? html`<div class="summary__row summary__row--savings"><dt>Economia</dt><dd>${money(totals.savings)}</dd></div>`
      : ''}
    ${showTotal ? html`<div class="summary__row summary__row--total"><dt>Total</dt><dd>${money(grand)}</dd></div>` : ''}
  </dl>`;
}
