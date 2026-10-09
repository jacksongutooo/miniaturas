/**
 * BARRA FIXA DO CARRINHO (celular) — "3 itens • 10% OFF  [Ver carrinho]"
 * Aparece quando há produtos; no desktop fica oculta (o carrinho está no cabeçalho).
 */

import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { money, plural } from '../utils/format.js';
import { nextTierFor } from '../utils/pricing.js';
import { storeConfig } from '../config/store.js';
import * as cart from '../app/cart.js';

export function mountCartBar(container) {
  const el = document.createElement('div');
  el.className = 'cartbar';
  el.id = 'cartbar';
  el.hidden = true;
  container.appendChild(el);

  const render = ({ totals }) => {
    const has = totals.itemCount > 0;
    el.hidden = !has;
    document.body.classList.toggle('has-cartbar', has);
    if (!has) return;

    const next = nextTierFor(totals.regularCount, storeConfig.discountRules);
    const headline =
      totals.discountPercent > 0
        ? html`${plural(totals.itemCount, 'item', 'itens')} • <span class="cartbar__off">${totals.discountPercent}% OFF</span>`
        : html`${plural(totals.itemCount, 'item', 'itens')}`;
    const sub =
      totals.discountPercent === 0 && next
        ? `Leve +${next.at - totals.regularCount} e ganhe ${next.percent}% OFF`
        : `Total ${money(totals.total)}`;

    el.innerHTML = String(html`
      <button type="button" class="cartbar__info" data-action="open-cart" aria-label="Abrir carrinho: ${plural(totals.itemCount, 'item', 'itens')}">
        <span class="cartbar__icon">${icon('cart', { size: 22 })}</span>
        <span class="cartbar__text">
          <strong>${headline}</strong>
          <small>${sub}</small>
        </span>
      </button>
      <button type="button" class="btn btn--primary cartbar__cta" data-action="open-cart">Ver carrinho</button>
    `);
  };

  render(cart.getState());
  cart.subscribe(render);
}
