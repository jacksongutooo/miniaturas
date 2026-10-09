/**
 * CONSULTAS AO CATÁLOGO (busca, categorias, relacionados)
 * Os dados ficam em ./data/products.js — este arquivo só lê.
 */

import { products } from './data/products.js';
import { categories } from './data/categories.js';
import { normalizeText } from '../utils/format.js';
import { isInStock } from '../services/inventory.js';

const byId = new Map(products.map((p) => [p.id, p]));
const bySlug = new Map(products.map((p) => [p.slug, p]));

export const getProducts = () => products;
export const getProduct = (id) => byId.get(Number(id));
export const getProductBySlug = (slug) => bySlug.get(slug);
export const getCategories = () => categories;
export const getCategory = (id) => categories.find((c) => c.id === id) ?? categories[0];

/** Destaques primeiro, mantendo a ordem do cadastro dentro de cada grupo. */
function defaultOrder(list) {
  return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
}

/** Produtos de uma categoria (id de categories.js). */
export function filterByCategory(categoryId) {
  const cat = getCategory(categoryId);
  if (cat.type === 'bestseller') {
    return products.filter((p) => p.bestSeller).sort((a, b) => b.sales - a.sales);
  }
  if (cat.type === 'category') return defaultOrder(products.filter((p) => p.category === cat.match));
  return defaultOrder(products);
}

/**
 * Busca pelo nome (sem acento e sem diferenciar maiúsculas): "sao" encontra "São Bento".
 * Todos os termos digitados precisam aparecer. Também considera a categoria, com menos peso.
 */
export function searchProducts(query, { limit = Infinity } = {}) {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored = [];
  for (const product of products) {
    const name = normalizeText(product.name);
    const words = name.split(/\s+/);
    const category = normalizeText(product.category);
    let score = 0;
    let matchesAll = true;

    for (const token of tokens) {
      if (words.some((w) => w.startsWith(token))) score += name.startsWith(token) ? 4 : 3;
      else if (name.includes(token)) score += 2;
      else if (category.includes(token)) score += 1;
      else {
        matchesAll = false;
        break;
      }
    }
    if (matchesAll) scored.push({ product, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || b.product.sales - a.product.sales)
    .slice(0, limit)
    .map((s) => s.product);
}

/** Modelos relacionados à página de um produto (para aumentar o carrinho). */
export function getRelatedProducts(product, count = 4) {
  const picked = [];
  const add = (p) => {
    if (p && p.id !== product.id && !picked.includes(p)) picked.push(p);
  };
  (product.related ?? []).forEach((id) => add(byId.get(id)));
  products.filter((p) => p.category === product.category).forEach(add);
  [...products].sort((a, b) => b.sales - a.sales).forEach(add);
  // Esgotados vão para o fim.
  return picked.sort((a, b) => Number(isInStock(b)) - Number(isInStock(a))).slice(0, count);
}
