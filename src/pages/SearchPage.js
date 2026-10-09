import { searchProducts } from '../products/catalog.js';
import { listPage } from './ProductsListPage.js';

export default function SearchPage({ query = '' }) {
  const q = query.trim();
  const list = q ? searchProducts(q) : [];
  return listPage({
    title: q ? `Busca: ${q}` : 'Busca',
    heading: q ? `Resultados para “${q}”` : 'Busca',
    list,
    emptyTitle: 'Nenhuma miniatura encontrada',
    emptyText: 'Confira a digitação ou veja todas as miniaturas disponíveis.',
  });
}
