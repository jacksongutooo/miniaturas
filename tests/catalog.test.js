import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { getProducts, getCategories, searchProducts, filterByCategory, getRelatedProducts, getProduct } from '../src/products/catalog.js';
import { pickUpsellProducts } from '../src/products/upsell.js';
import { reviews } from '../src/products/data/reviews.js';

const all = getProducts();
const reg = (productId) => ({ productId, qty: 1, bump: false });
// Modelos que a oferta de R$ 12,90 pode sugerir (em estoque e não marcados como provisórios).
const eligible = all.filter((p) => p.upsellEligible !== false && p.stock > 0);
const publicFile = (path) => fileURLToPath(new URL(`../public${path}`, import.meta.url));

test('catálogo: slugs e ids únicos, categorias existentes', () => {
  assert.equal(new Set(all.map((p) => p.slug)).size, all.length);
  assert.equal(new Set(all.map((p) => p.id)).size, all.length);
  const matches = new Set(getCategories().filter((c) => c.type === 'category').map((c) => c.match));
  for (const p of all) assert.ok(matches.has(p.category), `${p.name}: categoria "${p.category}" não existe em categories.js`);
});

test('toda foto citada em products.js existe em public/', () => {
  for (const p of all) {
    assert.ok(p.images.length >= 1 && p.images.length <= 6, `${p.name}: use de 1 a 6 fotos`);
    for (const img of p.images) assert.ok(existsSync(publicFile(img)), `${p.name}: arquivo ausente ${img}`);
  }
});

test('toda avaliação aponta para um produto que existe', () => {
  const slugs = new Set(all.map((p) => p.slug));
  for (const r of reviews) assert.ok(slugs.has(r.product), `avaliação ${r.id} ligada a "${r.product}", que não existe`);
});

test('os modelos reais vêm primeiro na vitrine', () => {
  const featured = filterByCategory('todos').filter((p) => p.featured);
  assert.ok(featured.length >= 1);
  const firstIds = filterByCategory('todos').slice(0, featured.length).map((p) => p.id);
  assert.deepEqual(firstIds, featured.map((p) => p.id));
});

test('busca por nome ignora acento e maiúsculas', () => {
  const names = (q) => searchProducts(q).map((p) => p.name);
  assert.ok(names('São').includes('São Bento'));
  assert.ok(names('sao').includes('São Jorge'));
  assert.ok(names('SAO').includes('São Miguel Arcanjo'));
  assert.ok(names('sao').includes('São José Sentado'));
  assert.deepEqual(names('fatima'), ['Nossa Senhora de Fátima']);
  assert.ok(names('espirito').includes('Divino Espírito Santo'));
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
  assert.deepEqual(filterByCategory('natal').map((p) => p.slug), ['boneco-de-neve-articulado']);
  assert.deepEqual(filterByCategory('espirito-santo').map((p) => p.slug), ['divino-espirito-santo']);
  const best = filterByCategory('mais-vendidos');
  assert.ok(best.length > 0 && best.every((p) => p.bestSeller));
  assert.deepEqual(
    best.map((p) => p.sales),
    [...best.map((p) => p.sales)].sort((a, b) => b - a),
  );
});

test('oferta: nunca sugere o que já está no carrinho', () => {
  const inCart = eligible.slice(0, 2);
  const picks = pickUpsellProducts(inCart.map((p) => reg(p.id)), all, 3);
  assert.equal(picks.length, 3);
  for (const p of picks) assert.ok(!inCart.some((c) => c.id === p.id), `sugeriu ${p.name}, que já está no carrinho`);
});

test('oferta: só modelos em estoque e elegíveis; prioriza complementares', () => {
  const base = eligible[0];
  const picks = pickUpsellProducts([reg(base.id)], all, 3);
  assert.ok(picks.length > 0);
  assert.ok(picks.every((p) => p.stock > 0 && p.upsellEligible !== false), 'sugeriu esgotado ou provisório');
  assert.ok(base.related.some((id) => picks.some((p) => p.id === id)), 'nenhum complementar entre as sugestões');
});

test('oferta: modelo esgotado nunca é sugerido, mesmo sendo complementar', () => {
  const base = eligible[0];
  const soldOutId = base.related.find((id) => eligible.some((p) => p.id === id));
  const catalog = all.map((p) => (p.id === soldOutId ? { ...p, stock: 0 } : p));
  const picks = pickUpsellProducts([reg(base.id)], catalog, 4);
  assert.ok(picks.every((p) => p.id !== soldOutId));
});

test('oferta: tudo no carrinho → sem sugestões', () => {
  assert.deepEqual(pickUpsellProducts(all.map((p) => reg(p.id)), all, 3), []);
});

test('oferta: respeita o item promocional já adicionado', () => {
  const [a, b] = eligible;
  const picks = pickUpsellProducts([reg(a.id), { productId: b.id, qty: 1, bump: true }], all, 3);
  assert.ok(picks.every((p) => p.id !== a.id && p.id !== b.id));
});

test('relacionados não incluem o próprio produto', () => {
  const rel = getRelatedProducts(getProduct(1), 4);
  assert.equal(rel.length, 4);
  assert.ok(rel.every((p) => p.id !== 1));
});
