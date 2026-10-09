import { getProducts } from '../products/catalog.js';
import { getFavoriteIds } from '../app/favorites.js';
import { listPage } from './ProductsListPage.js';

export default function FavoritesPage() {
  const ids = new Set(getFavoriteIds());
  return listPage({
    title: 'Favoritos',
    heading: 'Seus favoritos',
    list: getProducts().filter((p) => ids.has(p.id)),
    emptyTitle: 'Você ainda não tem favoritos',
    emptyText: 'Toque no coração de uma miniatura para salvá-la aqui. Os favoritos ficam salvos neste aparelho.',
  });
}
