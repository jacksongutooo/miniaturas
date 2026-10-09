import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeDistribution, productReviewStats, overallReviewStats } from '../src/products/reviewStats.js';

test('sem reviewsCount não há nota (nada é inventado)', () => {
  assert.equal(productReviewStats({ slug: 'a' }), null);
  assert.equal(productReviewStats({ slug: 'a', rating: 4.9 }), null); // nota sem total
  assert.equal(productReviewStats({ slug: 'a', rating: 4.9, reviewsCount: 0 }), null);
  assert.equal(productReviewStats({ slug: 'a', reviewsCount: 12 }), null); // total sem nota
  assert.equal(productReviewStats(undefined), null);
});

test('nota e total vêm do anúncio', () => {
  assert.deepEqual(productReviewStats({ slug: 'a', rating: 4.2, reviewsCount: 10 }), { average: 4.2, total: 10, distribution: null });
});

test('a distribuição por estrelas só vale se somar exatamente o total', () => {
  assert.deepEqual(normalizeDistribution({ 5: 7, 4: 2, 1: 1 }, 10), { 5: 7, 4: 2, 3: 0, 2: 0, 1: 1 });
  assert.equal(normalizeDistribution({ 5: 7, 4: 2 }, 10), null); // falta 1: as barras mentiriam
  assert.equal(normalizeDistribution({ 5: 7, 4: 2, 3: 2 }, 10), null); // passa do total
  assert.equal(normalizeDistribution({ 5: -1, 4: 11 }, 10), null);
  assert.equal(normalizeDistribution({ 5: 1.5, 4: 8.5 }, 10), null);
  assert.equal(normalizeDistribution(undefined, 10), null);
});

test('nota geral: média ponderada; variações do mesmo anúncio contam uma vez só', () => {
  const a = { slug: 'a', rating: 4, reviewsCount: 10 };
  const b = { slug: 'b', rating: 5, reviewsCount: 30, ratingListing: 'santos' };
  const c = { slug: 'c', rating: 5, reviewsCount: 30, ratingListing: 'santos' }; // mesmo anúncio do "b"
  const semNota = { slug: 'd' };
  const overall = overallReviewStats([a, b, c, semNota]);
  assert.equal(overall.total, 40);
  assert.equal(overall.average, (4 * 10 + 5 * 30) / 40);
  assert.equal(overall.distribution, null);
});

test('nota geral: a distribuição só aparece se todos os anúncios tiverem a sua', () => {
  const x = { slug: 'x', rating: 5, reviewsCount: 3, ratingBreakdown: { 5: 3 } };
  const y = { slug: 'y', rating: 4, reviewsCount: 2, ratingBreakdown: { 4: 1, 3: 1 } };
  assert.deepEqual(overallReviewStats([x, y]).distribution, { 5: 3, 4: 1, 3: 1, 2: 0, 1: 0 });
  assert.equal(overallReviewStats([x, { slug: 'z', rating: 4, reviewsCount: 2 }]).distribution, null);
});

test('nota geral: sem nenhum anúncio avaliado, não existe', () => {
  assert.equal(overallReviewStats([]), null);
  assert.equal(overallReviewStats([{ slug: 'a' }, { slug: 'b', rating: 4 }]), null);
});
