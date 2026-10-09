import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { storeConfig } from '../src/config/store.js';
import {
  getProducts,
  getCategories,
  getVisibleCategories,
  searchProducts,
  filterByCategory,
  getRelatedProducts,
  getProduct,
  getProductBySlug,
} from '../src/products/catalog.js';
import { pickUpsellProducts, isUpsellEligible } from '../src/products/upsell.js';
import { reviews } from '../src/products/data/reviews.js';

const all = getProducts();
const reg = (productId) => ({ productId, qty: 1, bump: false });
const bySlug = (slug) => getProductBySlug(slug);
// Modelos que a oferta de R$ 12,90 pode sugerir (o conjunto de R$ 43,90 fica de fora).
const eligible = all.filter(isUpsellEligible);
const publicFile = (path) => fileURLToPath(new URL(`../public${path}`, import.meta.url));

test('catálogo: slugs e ids únicos, categorias existentes', () => {
  assert.ok(all.length >= 1);
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

test('modelos relacionados existem e não apontam para si mesmos', () => {
  const ids = new Set(all.map((p) => p.id));
  for (const p of all) {
    for (const id of p.related ?? []) {
      assert.ok(ids.has(id), `${p.name}: relacionado ${id} não existe`);
      assert.notEqual(id, p.id, `${p.name}: relacionado a si mesmo`);
    }
  }
});

test('preços: o padrão da config, exceto os conjuntos com preço próprio', () => {
  const ownPrice = { 'sagrada-familia': 43.9 };
  for (const p of all) assert.equal(p.price, ownPrice[p.slug] ?? storeConfig.productPrice, `${p.name}: preço inesperado`);
  assert.equal(bySlug('sagrada-familia').price, 43.9);
});

test('vitrine: destaques primeiro, na ordem do cadastro', () => {
  const featured = all.filter((p) => p.featured);
  assert.ok(featured.length >= 1);
  const shown = filterByCategory('todos');
  assert.deepEqual(shown.slice(0, featured.length).map((p) => p.id), featured.map((p) => p.id));
  assert.equal(shown.length, all.length);
});

test('busca por nome ignora acento e maiúsculas', () => {
  const names = (q) => searchProducts(q).map((p) => p.name);
  assert.deepEqual(names('São'), ['São José Sentado']);
  assert.deepEqual(names('sao'), ['São José Sentado']);
  assert.deepEqual(names('SAO'), ['São José Sentado']);
  assert.deepEqual(names('espirito'), ['Divino Espírito Santo']);
  assert.deepEqual(names('JESUS'), ['Jesus Sentado']);
  assert.equal(names('sentad').length, 3); // Jesus, Maria e São José sentados
  assert.deepEqual(names('natal'), ['Boneco de Neve Articulado']); // pela categoria, com menos peso
  assert.deepEqual(names('xyzzy'), []);
  assert.deepEqual(names('   '), []);
});

test('busca com vários termos exige todos', () => {
  assert.deepEqual(searchProducts('jose sentado').map((p) => p.slug), ['sao-jose-sentado']);
  assert.deepEqual(searchProducts('boneco neve').map((p) => p.slug), ['boneco-de-neve-articulado']);
  assert.deepEqual(searchProducts('maria jesus'), []);
});

test('categorias', () => {
  assert.equal(filterByCategory('todos').length, all.length);
  assert.deepEqual(filterByCategory('santos').map((p) => p.slug), ['sao-jose-sentado']);
  assert.deepEqual(filterByCategory('nossa-senhora').map((p) => p.slug), ['maria-sentada']);
  assert.deepEqual(filterByCategory('jesus').map((p) => p.slug), ['jesus-sentado']);
  assert.deepEqual(filterByCategory('familia').map((p) => p.slug), ['sagrada-familia']);
  assert.deepEqual(filterByCategory('natal').map((p) => p.slug), ['boneco-de-neve-articulado']);
  assert.deepEqual(filterByCategory('espirito-santo').map((p) => p.slug), ['divino-espirito-santo']);
  const best = filterByCategory('mais-vendidos');
  assert.ok(best.length > 0 && best.every((p) => p.bestSeller));
  assert.deepEqual(
    best.map((p) => p.sales),
    [...best.map((p) => p.sales)].sort((a, b) => b - a),
  );
});

test('chips: só aparecem categorias com produtos ("Todos" sempre fica)', () => {
  const visible = getVisibleCategories();
  assert.equal(visible[0].id, 'todos');
  for (const c of visible) assert.ok(c.type === 'all' || filterByCategory(c.id).length > 0, `chip vazio: ${c.label}`);
  for (const c of getCategories()) {
    if (filterByCategory(c.id).length > 0) assert.ok(visible.some((v) => v.id === c.id), `faltou o chip ${c.label}`);
  }
});

test('oferta: o conjunto de R$ 43,90 nunca é elegível; as miniaturas padrão são', () => {
  const sagrada = bySlug('sagrada-familia');
  assert.equal(isUpsellEligible(sagrada), false);
  assert.ok(!eligible.includes(sagrada));
  for (const p of all.filter((x) => x.slug !== 'sagrada-familia')) assert.ok(isUpsellEligible(p), `${p.name} deveria ser elegível`);
});

test('oferta: critérios de elegibilidade (estoque, preço, marcação)', () => {
  const base = { id: 99, stock: 5, price: storeConfig.productPrice };
  assert.equal(isUpsellEligible(base), true);
  assert.equal(isUpsellEligible({ ...base, stock: 0 }), false); // esgotado
  assert.equal(isUpsellEligible({ ...base, upsellEligible: false }), false); // marcado pelo dono
  assert.equal(isUpsellEligible({ ...base, price: 43.9 }), false); // mais caro que a miniatura padrão
  assert.equal(isUpsellEligible({ ...base, price: storeConfig.upsellPrice }), false); // não seria desconto
  assert.equal(isUpsellEligible({ ...base, price: 14.9 }), true); // mais barato, ainda acima da oferta
  assert.equal(isUpsellEligible(undefined), false);
});

test('oferta: nunca sugere o que já está no carrinho', () => {
  const inCart = eligible.slice(0, 2);
  const picks = pickUpsellProducts(inCart.map((p) => reg(p.id)), all, 3);
  assert.equal(picks.length, 3);
  for (const p of picks) assert.ok(!inCart.some((c) => c.id === p.id), `sugeriu ${p.name}, que já está no carrinho`);
});

test('oferta: só modelos elegíveis (nunca o conjunto); prioriza complementares', () => {
  const base = bySlug('jesus-sentado');
  const picks = pickUpsellProducts([reg(base.id)], all, 4);
  assert.ok(picks.length > 0);
  assert.ok(picks.every(isUpsellEligible), 'sugeriu modelo não elegível');
  assert.ok(picks.every((p) => p.slug !== 'sagrada-familia'), 'sugeriu o conjunto a R$ 12,90');
  assert.ok(base.related.some((id) => picks.some((p) => p.id === id)), 'nenhum complementar entre as sugestões');
});

test('oferta: modelo esgotado nunca é sugerido, mesmo sendo complementar', () => {
  const base = bySlug('jesus-sentado');
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
  const jesus = bySlug('jesus-sentado');
  const rel = getRelatedProducts(getProduct(jesus.id), 4);
  assert.equal(rel.length, 4);
  assert.ok(rel.every((p) => p.id !== jesus.id));
});
