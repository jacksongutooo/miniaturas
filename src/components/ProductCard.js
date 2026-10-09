import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { moneyFromReais } from '../utils/format.js';
import { hrefFor } from '../app/router.js';
import { qtyOf } from '../app/cart.js';
import { getProduct } from '../products/catalog.js';
import { isFavorite } from '../app/favorites.js';
import { getMaxQty, isInStock } from '../services/inventory.js';
import { img, ratingCompact, cartStepper } from './primitives.js';

/** Área de ação do card: botão "Adicionar" ou seletor de quantidade (quando já está no carrinho). */
export function cardActions(product) {
  if (!isInStock(product)) {
    return html`<button type="button" class="btn btn--block btn--sm" disabled>Esgotado</button>`;
  }
  const qty = qtyOf(product.id);
  if (qty > 0) {
    return cartStepper({ key: `r:${product.id}`, qty, max: getMaxQty(product), removeAtMin: true, label: product.name });
  }
  return html`<button type="button" class="btn btn--primary btn--block btn--sm" data-action="add-to-cart" data-id="${product.id}" aria-label="Adicionar ${product.name} ao carrinho">
    ${icon('plus', { size: 16 })} Adicionar
  </button>`;
}

/** Card de produto estilo marketplace. `eager`: imagem acima da dobra (sem lazy). */
export function productCard(product, { eager = false } = {}) {
  const soldOut = !isInStock(product);
  const fav = isFavorite(product.id);
  const href = hrefFor.product(product.slug);

  return html`<article class="card${soldOut ? ' is-soldout' : ''}" data-product-id="${product.id}">
    <a class="card__media" href="${href}" tabindex="-1" aria-hidden="true">
      ${img({ src: product.images[0], alt: '', eager, width: 600, height: 600 })}
      ${soldOut ? html`<span class="badge badge--dark">Esgotado</span>` : product.bestSeller ? html`<span class="badge">Mais vendido</span>` : ''}
    </a>
    <button type="button" class="fav${fav ? ' is-active' : ''}" data-action="toggle-favorite" data-id="${product.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remover' : 'Adicionar'} ${product.name} ${fav ? 'dos' : 'aos'} favoritos">
      ${icon(fav ? 'heartFilled' : 'heart', { size: 18 })}
    </button>
    <div class="card__body">
      <h3 class="card__title"><a href="${href}">${product.name}</a></h3>
      ${ratingCompact(product)}
      <p class="card__price">${moneyFromReais(product.price)}</p>
      <div class="card__actions" data-card-actions="${product.id}" data-qty="${qtyOf(product.id)}">${cardActions(product)}</div>
    </div>
  </article>`;
}

/** Grade de produtos. As 4 primeiras imagens carregam já (primeira dobra). */
export function productGrid(list, { eagerCount = 4 } = {}) {
  return html`<div class="grid">${list.map((p, i) => productCard(p, { eager: i < eagerCount }))}</div>`;
}

/**
 * Mantém os botões dos cards e os corações em sincronia com o carrinho/favoritos
 * sem recriar o grid inteiro (evita piscar as imagens).
 */
export function syncCards(root = document) {
  root.querySelectorAll('[data-card-actions]').forEach((el) => {
    const product = getProduct(el.dataset.cardActions);
    if (!product) return;
    const qty = qtyOf(product.id);
    if (el.dataset.qty === String(qty)) return;
    el.dataset.qty = String(qty);
    const focused = document.activeElement;
    const refocus = el.contains(focused) ? focused.dataset.action : null;
    el.innerHTML = String(cardActions(product));
    if (refocus) el.querySelector(`[data-action="${refocus}"]`)?.focus({ preventScroll: true });
  });
}

export function syncFavorites(root = document) {
  root.querySelectorAll('.fav[data-id]').forEach((btn) => {
    const product = getProduct(btn.dataset.id);
    if (!product) return;
    const fav = isFavorite(product.id);
    if (btn.classList.contains('is-active') === fav) return;
    btn.classList.toggle('is-active', fav);
    btn.setAttribute('aria-pressed', String(fav));
    btn.setAttribute('aria-label', `${fav ? 'Remover' : 'Adicionar'} ${product.name} ${fav ? 'dos' : 'aos'} favoritos`);
    btn.innerHTML = String(icon(fav ? 'heartFilled' : 'heart', { size: 18 }));
  });
}
