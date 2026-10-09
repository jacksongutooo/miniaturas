/**
 * Layout reutilizado por Busca e Favoritos: título, contagem, grade e estado vazio.
 */

import { html } from '../utils/html.js';
import { plural } from '../utils/format.js';
import { hrefFor } from '../app/router.js';
import * as cart from '../app/cart.js';
import * as favorites from '../app/favorites.js';
import { productGrid, syncCards, syncFavorites } from '../components/ProductCard.js';
import { trustSection } from '../components/Sections.js';

export function listPage({ title, heading, list, emptyTitle, emptyText }) {
  return {
    title,
    html: html`<section class="section section--catalog">
        <div class="container">
          <nav class="breadcrumb" aria-label="Você está em"><a href="${hrefFor.home()}">Início</a><span aria-hidden="true">/</span><span>${heading}</span></nav>
          <div class="section__head section__head--row">
            <h1 class="section__title">${heading}</h1>
            <p class="section__count">${plural(list.length, 'miniatura', 'miniaturas')}</p>
          </div>
          ${list.length
            ? productGrid(list)
            : html`<div class="empty-state">
                <p class="empty-state__title">${emptyTitle}</p>
                <p class="muted">${emptyText}</p>
                <a class="btn btn--primary" href="${hrefFor.home()}">Ver todas as miniaturas</a>
              </div>`}
        </div>
      </section>
      ${trustSection()}`,
    mount(root) {
      const offCart = cart.subscribe(() => syncCards(root));
      const offFav = favorites.subscribe(() => syncFavorites(root));
      return () => {
        offCart();
        offFav();
      };
    },
  };
}
