/**
 * HERO COMPACTO + CATÁLOGO (chips de categoria + grade de produtos)
 */

import { storeConfig } from '../config/store.js';
import { content } from '../config/content.js';
import { html } from '../utils/html.js';
import { moneyFromReais, plural } from '../utils/format.js';
import { filterByCategory, getCategories } from '../products/catalog.js';
import { productGrid } from './ProductCard.js';
import { tiersStrip } from './Tiers.js';

/** Área inicial compacta: preço, promoção progressiva e botão. Sem banner gigante. */
export function heroSection() {
  const h = content.hero;
  const [before, after = ''] = h.title.split('{price}');
  return html`<section class="hero" aria-labelledby="hero-title">
    <div class="container">
      <div class="hero__card">
        <div class="hero__copy">
          <h1 class="hero__title" id="hero-title">${before}<span class="hero__price">${moneyFromReais(storeConfig.productPrice)}</span>${after}</h1>
          <p class="hero__text">${h.text}</p>
          <button type="button" class="btn btn--primary hero__cta" data-action="scroll-to" data-target="catalogo">${h.cta}</button>
        </div>
        <div class="hero__promo">
          ${tiersStrip()}
          <p class="hero__note">${h.note}</p>
        </div>
      </div>
    </div>
  </section>`;
}

export function categoryChips(activeId) {
  return html`<div class="chips" role="group" aria-label="Categorias">
    ${getCategories().map(
      (c) => html`<button type="button" class="chip${c.id === activeId ? ' is-active' : ''}" data-category="${c.id}" aria-pressed="${c.id === activeId}">${c.label}</button>`,
    )}
  </div>`;
}

export function catalogSection(activeId) {
  const list = filterByCategory(activeId);
  return html`<section class="section section--catalog" id="catalogo" aria-labelledby="catalog-title">
    <div class="container">
      <div class="section__head section__head--row">
        <h2 class="section__title" id="catalog-title">${content.catalog.title}</h2>
        <p class="section__count" data-catalog-count>${plural(list.length, 'miniatura', 'miniaturas')}</p>
      </div>
      <div class="chips-wrap">${categoryChips(activeId)}</div>
      <div data-catalog-grid>${list.length ? productGrid(list) : html`<p class="muted">${content.catalog.empty}</p>`}</div>
    </div>
  </section>`;
}

/** Liga os chips: troca só a grade, sem recriar a página. */
export function mountCatalog(root, { getCategory, setCategory, onRender }) {
  const section = root.querySelector('#catalogo');
  if (!section) return;
  const grid = section.querySelector('[data-catalog-grid]');
  const count = section.querySelector('[data-catalog-count]');

  section.querySelector('.chips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-category]');
    if (!chip) return;
    setCategory(chip.dataset.category);
    section.querySelectorAll('.chip').forEach((c) => {
      const active = c === chip;
      c.classList.toggle('is-active', active);
      c.setAttribute('aria-pressed', String(active));
    });
    const list = filterByCategory(getCategory());
    grid.innerHTML = String(list.length ? productGrid(list) : html`<p class="muted">${content.catalog.empty}</p>`);
    count.textContent = plural(list.length, 'miniatura', 'miniaturas');
    onRender?.(grid);
  });
}
