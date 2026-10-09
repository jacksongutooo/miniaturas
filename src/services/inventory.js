/**
 * ESTOQUE
 * ----------------------------------------------------------------------------
 * Hoje o estoque vem do campo "stock" de cada produto (products.js).
 * TODO: quando existir um backend de estoque, troque a implementação de
 * getStock() (ex.: fetch('/api/estoque')) e mantenha o resto do código como está —
 * catálogo, carrinho e sugestões da oferta já passam por aqui.
 */

import { storeConfig } from '../config/store.js';

/** Unidades disponíveis de um produto. */
export function getStock(product) {
  return Math.max(0, Number(product?.stock ?? 0));
}

export const isInStock = (product) => getStock(product) > 0;

/** Máximo que o cliente pode ter no carrinho deste modelo. */
export function getMaxQty(product) {
  return Math.min(getStock(product), storeConfig.maxQtyPerItem);
}

/** "Restam 4 unidades" quando o estoque está baixo; senão null. */
export function lowStockLabel(product) {
  const stock = getStock(product);
  if (stock <= 0 || stock > storeConfig.lowStockThreshold) return null;
  return stock === 1 ? 'Resta apenas 1 unidade' : `Restam apenas ${stock} unidades`;
}
