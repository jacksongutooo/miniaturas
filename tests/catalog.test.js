import test from 'node:test';
import assert from 'node:assert/strict';

import { getProducts, searchProducts, filterByCategory, getRelatedProducts, getProduct } from '../src/products/catalog.js';
import { pickUpsellProducts } from '../src/products/upsell.js';

const all = getProducts();
const reg = (productId) => ({ productId, qty: 1, bump: false });

test('busca por nome ignora acento e maiúsculas', () => {
  const names = (q) => searchProducts(q).map((p) => p.name);
  assert.ok(names('São').includes('São Bento'));
  assert.ok(names('sao').includes('São Jorge'));
  assert.ok(names('SAO').includes('São Miguel Arcanjo'));
  assert.deepEqual(names('fatima'), ['Nossa Senhora de Fátima']);
  assert.deepEqual(names('xyzzy'), []);
  assert.deepEqual(names('   '), []);
});

test('busca com vários termos exige todos', () => {
  assert.deepEqual(searchProducts('sao bento').map((p) => p.slug), ['sao-bento']);
  assert.ok(searchProducts('nossa senhora').length >= 3);
});

test('categorias', () => {
  assert.equal(filterByCategory('todos').length, all.length);
  assert.ok(filterByCategory('santos').every((p) => p.category === 'Santos'));
  const best = filterByCategory('mais-vendidos');
  assert.ok(best.length > 0 && best.every((p) => p.bestSeller));
  assert.deepEqual(
    best.map((p) => p.sales),
    [...best.map((p) => p.sales)].sort((a, b) => b - a),
  );
});

test('oferta: nunca sugere o que já está no carrinho', () => {
  const cart = [reg(1), reg(2), reg(3)];
  const picks = pickUpsellProducts(cart, all, 4);
  assert.equal(picks.length, 4);
  for (const p of picks) assert.ok(![1, 2, 3].includes(p.id), `sugeriu ${p.name} que já está no carrinho`);
});

test('oferta: ignora esgotados e inclui complementares', () => {
  const picks = pickUpsellProducts([reg(1)], all, 3);
  assert.ok(picks.every((p) => p.stock > 0));
  // Aparecida (1) lista Fátima (6) e Graças (9) como complementares.
  const ids = picks.map((p) => p.id);
  assert.ok(ids.includes(6) || ids.includes(9));
});

test('oferta: tudo no carrinho → sem sugestões', () => {
  const picks = pickUpsellProducts(all.map((p) => reg(p.id)), all, 3);
  assert.deepEqual(picks, []);
});

test('oferta: respeita o item promocional já adicionado', () => {
  const picks = pickUpsellProducts([reg(1), { productId: 6, qty: 1, bump: true }], all, 3);
  assert.ok(picks.every((p) => p.id !== 6 && p.id !== 1));
});

test('relacionados não incluem o próprio produto', () => {
  const rel = getRelatedProducts(getProduct(1), 4);
  assert.equal(rel.length, 4);
  assert.ok(rel.every((p) => p.id !== 1));
});
