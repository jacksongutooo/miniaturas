/**
 * PÁGINA DO PRODUTO
 * Galeria (4–6 fotos, zoom), nome, preço, avaliação, quantidade, descrição,
 * ficha técnica, modelos relacionados e avaliações. No celular, a barra fixa
 * inferior mantém "Adicionar ao carrinho" sempre à mão.
 */

import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { moneyFromReais, plural } from '../utils/format.js';
import { getProductBySlug, getRelatedProducts } from '../products/catalog.js';
import { reviews } from '../products/data/reviews.js';
import { productReviewStats } from '../products/reviewStats.js';
import { getMaxQty, isInStock, lowStockLabel } from '../services/inventory.js';
import { track } from '../services/analytics.js';
import { getShippingPolicyText } from '../services/shipping.js';
import * as cart from '../app/cart.js';
import * as favorites from '../app/favorites.js';
import { hrefFor } from '../app/router.js';
import { addToCart } from '../app/shopping.js';
import { galleryMarkup, mountGallery } from '../components/Gallery.js';
import { stars, formatRating } from '../components/primitives.js';
import { tiersStrip } from '../components/Tiers.js';
import { productGrid, syncCards, syncFavorites } from '../components/ProductCard.js';
import { reviewsSection, mountReviews } from '../components/Reviews.js';
import { trustSection } from '../components/Sections.js';
import NotFoundPage from './NotFoundPage.js';

/** Campos da ficha técnica — troque os rótulos aqui; os valores ficam em products.js. */
const SPECS = [
  ['height', 'Altura'],
  ['width', 'Largura'],
  ['material', 'Material'],
  ['weight', 'Peso'],
  ['finish', 'Acabamento'],
];

export default function ProductPage({ slug }) {
  const product = getProductBySlug(slug);
  if (!product) return NotFoundPage();

  const inStock = isInStock(product);
  const low = lowStockLabel(product);
  const max = getMaxQty(product);
  const fav = favorites.isFavorite(product.id);
  const related = getRelatedProducts(product, 4);
  const specs = SPECS.filter(([key]) => product[key]);

  // Só avaliações DESTE modelo (nunca de outro). Sem avaliações reais, não mostra nota.
  const reviewList = reviews.filter((r) => r.product === product.slug);
  const reviewStats = productReviewStats(product);

  const addLabel = inStock ? 'Adicionar ao carrinho' : 'Esgotado';
  const shippingPolicy = getShippingPolicyText();

  const markup = html`<div class="container pdp-wrap">
      <nav class="breadcrumb" aria-label="Você está em">
        <a href="${hrefFor.home()}">Início</a><span aria-hidden="true">/</span>
        <span>${product.category}</span><span aria-hidden="true">/</span>
        <span aria-current="page">${product.name}</span>
      </nav>

      <article class="pdp">
        <div class="pdp__gallery">${galleryMarkup(product)}</div>

        <div class="pdp__info">
          <div class="pdp__titlebar">
            <h1 class="pdp__title">${product.name}</h1>
            <button type="button" class="fav fav--static${fav ? ' is-active' : ''}" data-action="toggle-favorite" data-id="${product.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
              ${icon(fav ? 'heartFilled' : 'heart', { size: 20 })}
            </button>
          </div>

          ${reviewStats
            ? html`<a class="pdp__rating" href="#avaliacoes" data-action="scroll-to" data-target="avaliacoes" aria-label="Nota ${formatRating(reviewStats.average)} de 5, ${reviewStats.total} avaliações. Ver avaliações">
                ${stars(reviewStats.average)}
                <strong>${formatRating(reviewStats.average)}</strong>
                <span class="muted">(${plural(reviewStats.total, 'avaliação', 'avaliações')})</span>
              </a>`
            : ''}

          <p class="pdp__price">${moneyFromReais(product.price)}</p>

          ${shippingPolicy.headline || shippingPolicy.detail
            ? html`<div class="pdp__ship">
                ${icon('truck', { size: 22 })}
                <p>
                  ${shippingPolicy.headline ? html`<strong>${shippingPolicy.headline}</strong>` : ''}
                  ${shippingPolicy.detail ? html`<span>${shippingPolicy.detail}</span>` : ''}
                </p>
              </div>`
            : ''}

          <div class="pdp__promo">
            <p class="pdp__promo-title">${icon('percent', { size: 16 })} Leve mais e economize — você pode combinar modelos diferentes</p>
            ${tiersStrip()}
          </div>

          ${inStock
            ? html`<div class="pdp__buy">
                <div class="qty" role="group" aria-label="Quantidade">
                  <button type="button" class="stepper__btn" data-qty-dec aria-label="Diminuir quantidade" disabled>${icon('minus', { size: 16 })}</button>
                  <span class="stepper__qty" data-qty-value aria-live="polite">1</span>
                  <button type="button" class="stepper__btn" data-qty-inc aria-label="Aumentar quantidade" ${max <= 1 ? 'disabled' : ''}>${icon('plus', { size: 16 })}</button>
                </div>
                <button type="button" class="btn btn--primary btn--lg pdp__add" data-pdp-add>${icon('cart', { size: 20 })} ${addLabel}</button>
              </div>`
            : html`<button type="button" class="btn btn--lg btn--block" disabled>Esgotado</button>`}
          ${low ? html`<p class="pdp__stock">${icon('info', { size: 16 })} ${low}</p>` : ''}

          <section class="pdp__section" aria-labelledby="desc-title">
            <h2 class="pdp__h2" id="desc-title">Descrição</h2>
            <p>${product.description}</p>
          </section>

          ${specs.length
            ? html`<section class="pdp__section" aria-labelledby="specs-title">
                <h2 class="pdp__h2" id="specs-title">Ficha técnica</h2>
                <dl class="specs">
                  ${specs.map(([key, label]) => html`<div class="specs__row"><dt>${label}</dt><dd>${product[key]}</dd></div>`)}
                </dl>
              </section>`
            : ''}
        </div>
      </article>
    </div>

    <section class="section" aria-labelledby="related-title">
      <div class="container">
        <h2 class="section__title" id="related-title">Combine com outros modelos</h2>
        ${productGrid(related, { eagerCount: 0 })}
      </div>
    </section>

    ${reviewsSection({ list: reviewList, stats: reviewStats, note: product.ratingSource ?? '' })}
    ${trustSection()}

    ${inStock
      ? html`<div class="buybar" data-buybar>
          <button type="button" class="buybar__cart icon-btn" data-action="open-cart" aria-label="Abrir carrinho">
            ${icon('cart', { size: 24 })}<span class="icon-btn__badge" data-buybar-count hidden>0</span>
          </button>
          <button type="button" class="btn btn--primary btn--lg buybar__add" data-pdp-add>${addLabel} • ${moneyFromReais(product.price)}</button>
        </div>`
      : ''}`;

  return {
    title: product.name,
    html: markup,
    mount(root) {
      let qty = 1;
      const qtyValue = root.querySelector('[data-qty-value]');
      const dec = root.querySelector('[data-qty-dec]');
      const inc = root.querySelector('[data-qty-inc]');
      const count = root.querySelector('[data-buybar-count]');

      const renderQty = () => {
        if (!qtyValue) return;
        qtyValue.textContent = String(qty);
        dec.disabled = qty <= 1;
        inc.disabled = qty >= max;
      };
      dec?.addEventListener('click', () => {
        qty = Math.max(1, qty - 1);
        renderQty();
      });
      inc?.addEventListener('click', () => {
        qty = Math.min(max, qty + 1);
        renderQty();
      });

      root.querySelectorAll('[data-pdp-add]').forEach((btn) =>
        btn.addEventListener('click', () => {
          addToCart(product.id, qty);
          qty = 1;
          renderQty();
        }),
      );

      const renderBadge = ({ totals }) => {
        if (!count) return;
        count.textContent = totals.itemCount > 99 ? '99+' : String(totals.itemCount);
        count.hidden = totals.itemCount === 0;
      };
      renderBadge(cart.getState());

      const cleanups = [
        mountGallery(root),
        cart.subscribe((state) => {
          renderBadge(state);
          syncCards(root);
        }),
        favorites.subscribe(() => syncFavorites(root)),
      ];
      mountReviews(root, reviewList);

      track('ViewContent', {
        value: product.price,
        items: [{ id: product.id, name: product.name, price: product.price, quantity: 1 }],
      });

      return () => cleanups.forEach((fn) => fn?.());
    },
  };
}
