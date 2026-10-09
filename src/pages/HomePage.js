/**
 * PÁGINA INICIAL — compra em poucos segundos:
 *   catálogo (logo no topo) → destaques → avaliações → clientes → presente → envio → confiança
 */

import { html } from '../utils/html.js';
import { reviews } from '../products/data/reviews.js';
import { getProducts } from '../products/catalog.js';
import { overallReviewStats } from '../products/reviewStats.js';
import { content } from '../config/content.js';
import * as cart from '../app/cart.js';
import * as favorites from '../app/favorites.js';
import { catalogSection, mountCatalog } from '../components/Catalog.js';
import { syncCards, syncFavorites } from '../components/ProductCard.js';
import { highlightsSection, customerGallerySection, giftSection, packagingSection, trustSection } from '../components/Sections.js';
import { reviewsSection, mountReviews } from '../components/Reviews.js';

// Fica salvo entre visitas à vitrine (ao voltar de um produto, o filtro continua).
let activeCategory = 'todos';

export default function HomePage() {
  // Nota geral = média dos anúncios com avaliações reais; sem nenhuma avaliação, a seção nem aparece.
  const overall = overallReviewStats(getProducts());
  const markup = html`
    ${catalogSection(activeCategory)}
    ${highlightsSection()}
    ${reviews.length || overall ? reviewsSection({ list: reviews, stats: overall, note: content.reviews.source }) : ''}
    ${customerGallerySection()}
    ${giftSection()}
    ${packagingSection()}
    ${trustSection()}
  `;

  return {
    title: '',
    html: markup,
    mount(root) {
      mountCatalog(root, {
        getCategory: () => activeCategory,
        setCategory: (id) => (activeCategory = id),
      });
      mountReviews(root, reviews);
      const offCart = cart.subscribe(() => syncCards(root));
      const offFav = favorites.subscribe(() => syncFavorites(root));
      return () => {
        offCart();
        offFav();
      };
    },
  };
}
