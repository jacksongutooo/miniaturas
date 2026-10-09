/**
 * PÁGINA INICIAL — compra em poucos segundos:
 *   hero compacto → catálogo → destaques → avaliações → clientes → presente → envio → confiança
 */

import { html } from '../utils/html.js';
import { reviews } from '../products/data/reviews.js';
import * as cart from '../app/cart.js';
import * as favorites from '../app/favorites.js';
import { heroSection, catalogSection, mountCatalog } from '../components/Catalog.js';
import { syncCards, syncFavorites } from '../components/ProductCard.js';
import { highlightsSection, customerGallerySection, giftSection, packagingSection, trustSection } from '../components/Sections.js';
import { reviewsSection, mountReviews } from '../components/Reviews.js';

// Fica salvo entre visitas à vitrine (ao voltar de um produto, o filtro continua).
let activeCategory = 'todos';

export default function HomePage() {
  const markup = html`
    ${heroSection()}
    ${catalogSection(activeCategory)}
    ${highlightsSection()}
    ${reviewsSection({ list: reviews })}
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
