/**
 * AVALIAÇÕES DE CLIENTES (estilo marketplace)
 * Nota média, distribuição por estrelas, filtros (Todas / Com foto / Mais recentes) e cards.
 * A lista exibida vem de src/products/data/reviews.js. Quando existem os números oficiais do
 * anúncio (`stats`, de products.js), nota e total vêm deles — a lista é só uma amostra.
 * Sem avaliações, a seção mostra um aviso (e nunca avaliações de outro modelo).
 */

import { content } from '../config/content.js';
import { html } from '../utils/html.js';
import { formatDate, plural } from '../utils/format.js';
import { getProductBySlug } from '../products/catalog.js';
import { hrefFor } from '../app/router.js';
import { img, stars, formatRating } from './primitives.js';

const PAGE_SIZE = 4;

export function summarize(list) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  list.forEach((r) => {
    const n = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[n] += 1;
    sum += r.rating;
  });
  return { total: list.length, average: list.length ? sum / list.length : 0, distribution };
}

function reviewCard(review) {
  const product = getProductBySlug(review.product);
  const photos = review.photos ?? [];
  return html`<article class="review">
    <header class="review__head">
      <span class="review__avatar" aria-hidden="true">${review.name.slice(0, 1).toUpperCase()}</span>
      <div class="review__who">
        <strong>${review.name}</strong>
        <span class="review__meta">${stars(review.rating, { size: 'sm' })} <time datetime="${review.date}">${formatDate(review.date)}</time></span>
      </div>
    </header>
    <p class="review__text">${review.text}</p>
    ${product || review.variant
      ? html`<p class="review__product">${product ? html`Modelo: <a href="${hrefFor.product(product.slug)}">${product.name}</a>` : ''}${review.variant ? html`${product ? ' · ' : ''}${review.variant}` : ''}</p>`
      : ''}
    ${photos.length
      ? html`<ul class="review__photos">
          ${photos.map(
            (src, i) => html`<li>
              <button type="button" data-action="open-lightbox" data-group="review-${review.id}" data-src="${src}" data-alt="Foto enviada por ${review.name}" aria-label="Ampliar foto ${i + 1} enviada por ${review.name}">
                ${img({ src, alt: `Foto enviada por ${review.name}`, width: 160, height: 160 })}
              </button>
            </li>`,
          )}
        </ul>`
      : ''}
  </article>`;
}

/**
 * @param {{ list: Array, stats?: {average:number,total:number,distribution:object|null}|null, note?: string, id?: string }} props
 *   stats: números oficiais do anúncio; note: de onde eles vêm (ex.: "Avaliações do anúncio no TikTok Shop")
 */
export function reviewsSection({ list, stats = null, note = '', id = 'avaliacoes' }) {
  const t = content.reviews;
  const sample = summarize(list);
  const total = stats ? stats.total : sample.total;
  const average = stats ? stats.average : sample.average;
  const distribution = stats ? stats.distribution : sample.distribution;
  const hasPhoto = list.some((r) => r.photos?.length);

  if (!total) {
    return html`<section class="section" id="${id}" data-reviews aria-labelledby="${id}-title">
      <div class="container">
        <h2 class="section__title" id="${id}-title">${t.title}</h2>
        <p class="muted">${t.none}</p>
      </div>
    </section>`;
  }

  return html`<section class="section" id="${id}" data-reviews aria-labelledby="${id}-title">
    <div class="container">
      <h2 class="section__title" id="${id}-title">${t.title}</h2>

      <div class="reviews">
        <div class="reviews__summary">
          <div class="reviews__score">
            <span class="reviews__avg">${total ? formatRating(average) : '—'}</span>
            <div>
              ${stars(average, { size: 'lg' })}
              <p class="reviews__count">${plural(total, 'avaliação', 'avaliações')}</p>
            </div>
          </div>
          ${distribution
            ? html`<ul class="bars" aria-label="Distribuição das notas">
                ${[5, 4, 3, 2, 1].map(
                  (n) => html`<li class="bars__row">
                    <span class="bars__label">${n} ${n === 1 ? 'estrela' : 'estrelas'}</span>
                    <span class="bars__track"><span class="bars__fill" style="width:${((distribution[n] / total) * 100).toFixed(1)}%"></span></span>
                    <span class="bars__value">${distribution[n]}</span>
                  </li>`,
                )}
              </ul>`
            : ''}
          ${note ? html`<p class="reviews__note">${note}</p>` : ''}
        </div>

        <div class="reviews__main">
          <div class="filters" role="group" aria-label="Filtrar avaliações">
            <button type="button" class="filter is-active" data-review-filter="all" aria-pressed="true">${t.filters.all}</button>
            ${hasPhoto ? html`<button type="button" class="filter" data-review-filter="photo" aria-pressed="false">${t.filters.photo}</button>` : ''}
            <button type="button" class="filter" data-review-filter="recent" aria-pressed="false">${t.filters.recent}</button>
          </div>
          <div class="reviews__list" data-reviews-list aria-live="polite"></div>
          <button type="button" class="btn btn--ghost btn--block reviews__more" data-reviews-more hidden>${t.showMore}</button>
          ${list.length < total
            ? html`<p class="reviews__note reviews__shown">${t.shown.replace('{n}', list.length).replace('{total}', plural(total, 'avaliação', 'avaliações'))}</p>`
            : ''}
        </div>
      </div>
    </div>
  </section>`;
}

/** Liga filtros e "ver mais". Recebe a mesma lista usada em reviewsSection(). */
export function mountReviews(root, list) {
  const section = root.querySelector('[data-reviews]');
  if (!section) return;
  const listEl = section.querySelector('[data-reviews-list]');
  const more = section.querySelector('[data-reviews-more]');
  if (!listEl || !more) return; // seção sem avaliações
  let filter = 'all';
  let visible = PAGE_SIZE;

  function currentList() {
    if (filter === 'photo') return list.filter((r) => r.photos?.length);
    if (filter === 'recent') return [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return list;
  }

  function render() {
    const items = currentList();
    listEl.innerHTML = items.length
      ? String(html`${items.slice(0, visible).map(reviewCard)}`)
      : String(html`<p class="muted">${content.reviews.empty}</p>`);
    more.hidden = items.length <= visible;
  }

  section.querySelectorAll('[data-review-filter]').forEach((btn) =>
    btn.addEventListener('click', () => {
      filter = btn.dataset.reviewFilter;
      visible = PAGE_SIZE;
      section.querySelectorAll('[data-review-filter]').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      render();
    }),
  );
  more.addEventListener('click', () => {
    visible += PAGE_SIZE;
    render();
  });

  render();
}
