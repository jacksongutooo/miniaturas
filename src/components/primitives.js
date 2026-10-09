/**
 * Peças pequenas reutilizadas em vários lugares: imagem, estrelas, stepper de quantidade.
 */

import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';

/** <img> com lazy loading (a menos que `eager`), tamanho reservado e decodificação assíncrona. */
export function img({ src, alt = '', eager = false, width, height, className = '', priority = false }) {
  return html`<img
    class="${className}"
    src="${src}"
    alt="${alt}"
    ${width ? html`width="${width}"` : ''}
    ${height ? html`height="${height}"` : ''}
    loading="${eager ? 'eager' : 'lazy'}"
    decoding="async"
    ${priority ? html`fetchpriority="high"` : ''}
  />`;
}

/** "4,9" */
export const formatRating = (rating) => Number(rating).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Linha de 5 estrelas preenchidas proporcionalmente à nota. */
export function stars(rating, { size = 'md' } = {}) {
  const pct = Math.max(0, Math.min(100, (Number(rating) / 5) * 100));
  return html`<span class="stars stars--${size}" style="--p:${pct.toFixed(1)}%" role="img" aria-label="Nota ${formatRating(rating)} de 5">★★★★★</span>`;
}

/** ★ 4,9 (123) — versão compacta para cards. */
export function ratingCompact(product) {
  return html`<span class="rating" aria-label="Nota ${formatRating(product.rating)} de 5, ${product.reviewsCount} avaliações">
    ${icon('star', { size: 14, class: 'rating__star' })}
    <strong>${formatRating(product.rating)}</strong>
    <span class="rating__count">(${product.reviewsCount})</span>
  </span>`;
}

/**
 * Seletor de quantidade ligado a uma linha do carrinho.
 * `removeAtMin`: no mínimo, "−" remove o item (usado nos cards).
 */
export function cartStepper({ key, qty, max = 99, removeAtMin = false, label = '' }) {
  const atMin = qty <= 1 && !removeAtMin;
  return html`<div class="stepper" role="group" aria-label="Quantidade${label ? ` de ${label}` : ''}">
    <button type="button" class="stepper__btn" data-action="cart-dec" data-key="${key}" ${removeAtMin ? html`data-remove-at-min="1"` : ''} aria-label="Diminuir quantidade" ${atMin ? 'disabled' : ''}>
      ${icon(qty <= 1 && removeAtMin ? 'trash' : 'minus', { size: 16 })}
    </button>
    <span class="stepper__qty" aria-live="polite">${qty}</span>
    <button type="button" class="stepper__btn" data-action="cart-inc" data-key="${key}" aria-label="Aumentar quantidade" ${qty >= max ? 'disabled' : ''}>
      ${icon('plus', { size: 16 })}
    </button>
  </div>`;
}
