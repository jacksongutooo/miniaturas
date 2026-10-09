import test from 'node:test';
import assert from 'node:assert/strict';

import { storeConfig } from '../src/config/store.js';
import { computeTotals, discountPercentFor, nextTierFor } from '../src/utils/pricing.js';
import { getDiscountProgress } from '../src/utils/discount.js';
import { money } from '../src/utils/format.js';
import { getProduct } from './fixtures.js';

const opts = {
  getProduct,
  rules: storeConfig.discountRules,
  upsellPrice: storeConfig.upsellPrice,
};
const reg = (productId, qty = 1) => ({ productId, qty, bump: false });
const bump = (productId) => ({ productId, qty: 1, bump: true });
// "R$ 17,90" usa espaço não separável; normaliza para comparar.
const brl = (cents) => money(cents).replace(/\s/g, ' ');

test('faixas de desconto (regras do briefing)', () => {
  assert.equal(discountPercentFor(0, opts.rules), 0);
  assert.equal(discountPercentFor(1, opts.rules), 0);
  assert.equal(discountPercentFor(2, opts.rules), 5);
  assert.equal(discountPercentFor(3, opts.rules), 10);
  assert.equal(discountPercentFor(4, opts.rules), 15);
  assert.equal(discountPercentFor(5, opts.rules), 20);
  assert.equal(discountPercentFor(12, opts.rules), 20);
  assert.deepEqual(nextTierFor(3, opts.rules), { at: 4, percent: 15 });
  assert.equal(nextTierFor(5, opts.rules), null);
});

test('1 miniatura: sem desconto', () => {
  const t = computeTotals([reg(1)], opts);
  assert.equal(t.subtotal, 1790);
  assert.equal(t.discount, 0);
  assert.equal(t.total, 1790);
});

test('modelos diferentes se combinam: 3 itens = 10% OFF', () => {
  // 3 modelos diferentes, 1 de cada
  const t = computeTotals([reg(2), reg(1), reg(3)], opts);
  assert.equal(t.regularCount, 3);
  assert.equal(t.discountPercent, 10);
  assert.equal(t.subtotal, 5370);
  assert.equal(t.discount, 537);
  assert.equal(t.total, 4833);
});

test('exemplo do resumo: 4 × 17,90 = 71,60 · 15% = -10,74 · total 60,86', () => {
  const t = computeTotals([reg(1), reg(2), reg(3), reg(4)], opts);
  assert.equal(brl(t.subtotal), 'R$ 71,60');
  assert.equal(t.discountPercent, 15);
  assert.equal(brl(t.discount), 'R$ 10,74');
  assert.equal(brl(t.total), 'R$ 60,86');
});

test('5 ou mais: 20% OFF', () => {
  const t = computeTotals([reg(1, 2), reg(2, 2), reg(3, 2)], opts);
  assert.equal(t.regularCount, 6);
  assert.equal(t.discountPercent, 20);
  assert.equal(t.subtotal, 10740);
  assert.equal(t.total, 8592);
});

test('oferta de R$ 12,90 NÃO conta no desconto nem recebe desconto (exemplo do briefing)', () => {
  // 3 normais: 53,70 → 10% → 48,33 · + promocional 12,90 = 61,23
  const t = computeTotals([reg(1), reg(2), reg(3), bump(4)], opts);
  assert.equal(t.regularCount, 3);
  assert.equal(t.bumpCount, 1);
  assert.equal(t.itemCount, 4);
  assert.equal(t.discountPercent, 10, 'não pode virar 15%');
  assert.equal(brl(t.subtotal), 'R$ 53,70');
  assert.equal(brl(t.discount), 'R$ 5,37');
  assert.equal(brl(t.bumpTotal), 'R$ 12,90');
  assert.equal(brl(t.total), 'R$ 61,23');
  // Economia = desconto progressivo (5,37) + oferta (17,90 − 12,90 = 5,00)
  assert.equal(brl(t.savings), 'R$ 10,37');
});

test('promocional sozinho com 1 regular não gera desconto', () => {
  const t = computeTotals([reg(1), bump(2)], opts);
  assert.equal(t.discountPercent, 0);
  assert.equal(brl(t.total), 'R$ 30,80');
});

test('mudar as regras na config muda o cálculo', () => {
  const t = computeTotals([reg(1, 2)], { ...opts, rules: { 2: 50 } });
  assert.equal(t.discountPercent, 50);
  assert.equal(t.total, 1790);
});

test('mensagens da barra de progresso', () => {
  const p = (n, savings = 0) => getDiscountProgress(n, opts.rules, savings);

  assert.equal(p(0).hint, 'Adicione 2 miniaturas e ganhe 5% OFF.');
  assert.equal(p(1).hint, 'Adicione +1 miniatura e ganhe 5% OFF.');

  assert.equal(p(2).title, 'Você desbloqueou 5% OFF 🎉');
  assert.equal(p(2).hint, 'Adicione +1 miniatura e ganhe 10% OFF.');

  assert.equal(p(3, 537).title.replace(/\s/g, ' '), 'Você já economizou R$ 5,37.');
  assert.equal(p(3).hint, 'Adicione só mais 1 para desbloquear 15% OFF.');

  assert.equal(p(4, 1074).hint, 'Falta apenas 1 para chegar ao desconto máximo de 20%.');

  assert.equal(p(5, 1790).title, 'Você desbloqueou nosso maior desconto: 20% OFF 🎉');
  assert.equal(p(9, 1790).isMax, true);
});

test('nós da barra: 1 → 2 → 3 → 4 → 5+ com 5% 10% 15% 20%', () => {
  const nodes = getDiscountProgress(3, opts.rules).nodes;
  assert.deepEqual(
    nodes.map((n) => [n.at, n.label, n.plus]),
    [
      [1, '', false],
      [2, '5%', false],
      [3, '10%', false],
      [4, '15%', false],
      [5, '20%', true],
    ],
  );
  assert.deepEqual(
    nodes.map((n) => n.reached),
    [true, true, true, false, false],
  );
  assert.equal(getDiscountProgress(0, opts.rules).fill, 0);
  assert.equal(getDiscountProgress(3, opts.rules).fill, 0.5);
  assert.equal(getDiscountProgress(5, opts.rules).fill, 1);
});

test('conjunto de R$ 43,90 + miniaturas: o desconto vale sobre o subtotal, contando 1 unidade por item', () => {
  // 17,90 + 43,90 = 61,80 · 2 unidades → 5% = 3,09 · total 58,71
  const two = computeTotals([reg(1), reg(9)], opts);
  assert.equal(brl(two.subtotal), 'R$ 61,80');
  assert.equal(two.regularCount, 2);
  assert.equal(two.discountPercent, 5);
  assert.equal(brl(two.discount), 'R$ 3,09');
  assert.equal(brl(two.total), 'R$ 58,71');

  // 17,90 + 17,90 + 43,90 = 79,70 · 3 unidades → 10% = 7,97 · total 71,73
  const three = computeTotals([reg(1), reg(2), reg(9)], opts);
  assert.equal(brl(three.subtotal), 'R$ 79,70');
  assert.equal(three.discountPercent, 10);
  assert.equal(brl(three.total), 'R$ 71,73');
});

test('o conjunto sozinho não recebe desconto e a oferta de R$ 12,90 segue valendo só o preço fixo', () => {
  const alone = computeTotals([reg(9)], opts);
  assert.equal(alone.discountPercent, 0);
  assert.equal(brl(alone.total), 'R$ 43,90');

  const withBump = computeTotals([reg(9), bump(1)], opts);
  assert.equal(withBump.discountPercent, 0);
  assert.equal(brl(withBump.total), 'R$ 56,80'); // 43,90 + 12,90
});
