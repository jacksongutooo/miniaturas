/**
 * Faixas do desconto progressivo em formato de "chips": 2 un. → 5% OFF ...
 * Geradas de storeConfig.discountRules (mudou a regra, mudou aqui).
 */

import { html } from '../utils/html.js';
import { storeConfig } from '../config/store.js';
import { tiersFromRules } from '../utils/pricing.js';

export function tiersStrip() {
  const tiers = tiersFromRules(storeConfig.discountRules);
  return html`<ul class="tiers" aria-label="Descontos progressivos">
    ${tiers.map(
      (t, i) => html`<li class="tiers__item${i === tiers.length - 1 ? ' tiers__item--max' : ''}">
        <span class="tiers__qty">${t.at}${i === tiers.length - 1 ? '+' : ''} un.</span>
        <strong class="tiers__pct">${t.percent}% OFF</strong>
      </li>`,
    )}
  </ul>`;
}
