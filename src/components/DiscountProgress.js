/**
 * BARRA DE PROGRESSO DO DESCONTO  (1 → 2 → 3 → 4 → 5+  /  5% 10% 15% 20%)
 * Os dados vêm de utils/discount.js (derivados de storeConfig.discountRules).
 */

import { html } from '../utils/html.js';
import { getDiscountProgress } from '../utils/discount.js';
import { storeConfig } from '../config/store.js';

export function discountProgress(totals, { compact = false } = {}) {
  const p = getDiscountProgress(totals.regularCount, storeConfig.discountRules, totals.savings);
  if (p.nodes.length === 0) return html``;

  return html`<div class="progress${compact ? ' progress--compact' : ''}" style="--fill:${p.fill}">
    <div class="progress__msg" aria-live="polite">
      ${p.title ? html`<p class="progress__title">${p.title}</p>` : ''}
      ${p.hint ? html`<p class="progress__hint">${p.hint}</p>` : ''}
    </div>
    <div class="steps" role="img" aria-label="${totals.regularCount} miniaturas no carrinho, desconto atual de ${p.percent}%">
      <div class="steps__track"><div class="steps__fill"></div></div>
      <ol class="steps__list">
        ${p.nodes.map(
          (n) => html`<li class="step${n.reached ? ' is-reached' : ''}">
            <span class="step__dot">${n.at}${n.plus ? '+' : ''}</span>
            <span class="step__label">${n.label}</span>
          </li>`,
        )}
      </ol>
    </div>
    ${totals.bumpCount > 0
      ? html`<p class="progress__note">A miniatura promocional não entra na contagem do desconto.</p>`
      : ''}
  </div>`;
}
