/**
 * CATEGORIAS DO CATÁLOGO
 * ----------------------------------------------------------------------------
 * TODO: ajustar as categorias definitivas.
 *
 * type:
 *   'all'        → mostra tudo
 *   'bestseller' → produtos com bestSeller: true, ordenados por "sales"
 *   'category'   → produtos cujo "category" é igual a "match"
 *
 * Para criar uma categoria nova: adicione uma linha aqui e use o mesmo texto
 * no campo "category" dos produtos (products.js).
 */
export const categories = [
  { id: 'todos', label: 'Todos', type: 'all' },
  { id: 'mais-vendidos', label: 'Mais vendidos', type: 'bestseller' },
  { id: 'santos', label: 'Santos', type: 'category', match: 'Santos' },
  { id: 'nossa-senhora', label: 'Nossa Senhora', type: 'category', match: 'Nossa Senhora' },
  { id: 'jesus', label: 'Jesus', type: 'category', match: 'Jesus' },
  { id: 'familia', label: 'Família', type: 'category', match: 'Família' },
  { id: 'espirito-santo', label: 'Espírito Santo', type: 'category', match: 'Espírito Santo' },
  { id: 'natal', label: 'Natal', type: 'category', match: 'Natal' },
];

export default categories;
