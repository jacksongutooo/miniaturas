/**
 * SUGESTÕES DA OFERTA ANTES DO CHECKOUT ("Antes de finalizar...")
 * ----------------------------------------------------------------------------
 * Regras:
 *  • NUNCA sugere um modelo que já está no carrinho (regular ou promocional).
 *  • Só sugere modelos em estoque.
 *  • Prioridade: complementares ("related" do produto) → mais vendidos → destaques.
 *  • Evita mostrar vários modelos da mesma categoria quando há alternativas.
 */

import { isInStock } from '../services/inventory.js';

/**
 * @param {Array<{productId:number}>} cartLines  itens do carrinho
 * @param {Array<object>} products               catálogo
 * @param {number} count                         quantas sugestões (3 ou 4)
 */
export function pickUpsellProducts(cartLines, products, count = 3) {
  const inCart = new Set(cartLines.map((l) => l.productId));
  const cartProducts = products.filter((p) => inCart.has(p.id));
  const maxSales = Math.max(1, ...products.map((p) => p.sales ?? 0));

  const candidates = products
    .filter((p) => !inCart.has(p.id) && isInStock(p) && p.upsellEligible !== false)
    .map((p) => {
      // Quantos itens do carrinho listam este modelo como complementar (ou o contrário).
      const relatedHits = cartProducts.filter(
        (c) => (c.related ?? []).includes(p.id) || (p.related ?? []).includes(c.id),
      ).length;
      const score =
        Math.min(relatedHits, 3) * 40 + // complementares
        (p.bestSeller ? 20 : 0) + // mais vendidos
        ((p.sales ?? 0) / maxSales) * 20 + // popularidade
        (p.featured ? 5 : 0);
      return { product: p, score };
    });

  // Seleção gulosa com leve penalidade para categorias repetidas.
  const picked = [];
  const usedCategories = new Map();
  while (picked.length < count && candidates.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    candidates.forEach((c, i) => {
      const adjusted = c.score - (usedCategories.get(c.product.category) ?? 0) * 12 - c.product.id * 0.001;
      if (adjusted > bestScore) {
        bestScore = adjusted;
        bestIndex = i;
      }
    });
    const [chosen] = candidates.splice(bestIndex, 1);
    picked.push(chosen.product);
    usedCategories.set(chosen.product.category, (usedCategories.get(chosen.product.category) ?? 0) + 1);
  }
  return picked;
}
