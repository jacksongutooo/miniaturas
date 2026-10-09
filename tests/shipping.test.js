import test from 'node:test';
import assert from 'node:assert/strict';

import { storeConfig } from '../src/config/store.js';
import { computeTotals, qualifiesForFreeShipping, freeShippingUnlockedByBump, shippingUnits } from '../src/utils/pricing.js';
import { getFreeShippingStatus, describeShippingPolicy } from '../src/utils/freeShipping.js';
import { getShippingOptions, estimateCartShipping, cartGrandTotal, getShippingPolicyText } from '../src/services/shipping.js';
import { money } from '../src/utils/format.js';
import { getProduct } from './fixtures.js';

const opts = { getProduct, rules: storeConfig.discountRules, upsellPrice: storeConfig.upsellPrice };
const totalsOf = (lines) => computeTotals(lines, opts);
const reg = (productId, qty = 1) => ({ productId, qty, bump: false });
const bump = (productId) => ({ productId, qty: 1, bump: true });
const brl = (cents) => money(cents).replace(/\s/g, ' ');
const fs = storeConfig.shipping.freeShipping;

test('config: grátis a partir da 2ª unidade; 1 unidade = R$ 5,90 pelo Correios Mini', () => {
  assert.equal(fs.enabled, true);
  assert.equal(fs.minUnits, 2);
  assert.equal(storeConfig.shipping.options.length, 1);
  assert.equal(storeConfig.shipping.options[0].price, 5.9);
  assert.match(storeConfig.shipping.options[0].name, /Correios Mini/);
});

test('1 miniatura: frete fixo de R$ 5,90', async () => {
  const t = totalsOf([reg(1)]);
  assert.equal(qualifiesForFreeShipping(t, fs), false);
  assert.deepEqual(estimateCartShipping(t), { cents: 590, free: false });
  assert.equal(brl(cartGrandTotal(t)), 'R$ 23,80'); // 17,90 + 5,90

  const options = await getShippingOptions({ cep: '01001000', totals: t, items: t.lines });
  assert.equal(options.length, 1);
  assert.equal(options[0].id, 'correios-mini');
  assert.equal(options[0].price, 590);
  assert.ok(!options[0].free);
});

test('2 miniaturas (modelos diferentes ou o mesmo): frete grátis', async () => {
  for (const lines of [[reg(1), reg(2)], [reg(1, 2)]]) {
    const t = totalsOf(lines);
    assert.equal(qualifiesForFreeShipping(t, fs), true);
    assert.deepEqual(estimateCartShipping(t), { cents: 0, free: true });
    const options = await getShippingOptions({ cep: '01001000', totals: t, items: t.lines });
    assert.equal(options[0].price, 0);
    assert.equal(options[0].free, true);
  }
  const t = totalsOf([reg(1, 2)]);
  assert.equal(cartGrandTotal(t), t.total); // frete grátis: total = produtos
});

test('muitas unidades continuam com frete grátis', () => {
  assert.equal(qualifiesForFreeShipping(totalsOf([reg(1, 5), reg(2, 3)]), fs), true);
});

test('carrinho vazio: sem frete', () => {
  const t = totalsOf([]);
  assert.equal(qualifiesForFreeShipping(t, fs), false);
  assert.equal(estimateCartShipping(t), null);
});

test('a miniatura promocional conta como unidade para o frete (countPromoUnits)', () => {
  const t = totalsOf([reg(1), bump(2)]); // 1 regular + 1 promocional = 2 miniaturas enviadas
  assert.equal(shippingUnits(t, fs), 2);
  assert.equal(qualifiesForFreeShipping(t, fs), true);
  // ...mas o desconto progressivo continua ignorando a promocional
  assert.equal(t.discountPercent, 0);

  const onlyRegular = { ...fs, countPromoUnits: false };
  assert.equal(shippingUnits(t, onlyRegular), 1);
  assert.equal(qualifiesForFreeShipping(t, onlyRegular), false);
});

test('um conjunto (R$ 43,90) conta como 1 unidade: paga o frete, a menos que um valor mínimo libere', () => {
  const t = totalsOf([reg(9)]);
  assert.equal(shippingUnits(t, fs), 1);
  assert.equal(qualifiesForFreeShipping(t, fs), false);
  assert.deepEqual(estimateCartShipping(t), { cents: 590, free: false });
  assert.equal(qualifiesForFreeShipping(t, { ...fs, minOrderValue: 40 }), true); // se um dia quiser liberar por valor
});

test('regras alternativas: por valor, desligado', () => {
  const one = totalsOf([reg(1)]); // R$ 17,90
  assert.equal(qualifiesForFreeShipping(one, { enabled: true, minUnits: null, minOrderValue: 17.9 }), true);
  assert.equal(qualifiesForFreeShipping(one, { enabled: true, minUnits: null, minOrderValue: 18 }), false);
  assert.equal(qualifiesForFreeShipping(one, { enabled: true, minUnits: 2, minOrderValue: 17 }), true); // por valor OU quantidade
  assert.equal(qualifiesForFreeShipping(totalsOf([reg(1, 9)]), { enabled: false, minUnits: 2 }), false);
  assert.equal(qualifiesForFreeShipping(one, undefined), false);
});

test('a oferta de R$ 12,90 libera o frete grátis quando falta 1 unidade', () => {
  const bumpCents = Math.round(storeConfig.upsellPrice * 100);
  assert.equal(freeShippingUnlockedByBump(totalsOf([reg(1)]), fs, bumpCents), true);
  assert.equal(freeShippingUnlockedByBump(totalsOf([reg(1, 2)]), fs, bumpCents), false); // já tem
  assert.equal(freeShippingUnlockedByBump(totalsOf([reg(1)]), { ...fs, countPromoUnits: false }, bumpCents), false);
});

test('mensagens do carrinho', () => {
  assert.equal(getFreeShippingStatus(totalsOf([reg(1)]), fs).text, 'Frete grátis a partir de 2 miniaturas — falta +1');
  assert.equal(getFreeShippingStatus(totalsOf([reg(1)]), fs).missing, 1);
  assert.equal(getFreeShippingStatus(totalsOf([reg(1, 2)]), fs).text, 'Frete grátis desbloqueado 🎉');
  assert.equal(getFreeShippingStatus(totalsOf([reg(1)]), { ...fs, minUnits: 4 }).text, 'Frete grátis a partir de 4 miniaturas — faltam +3');
  assert.equal(getFreeShippingStatus(totalsOf([reg(1)]), { enabled: false }).enabled, false);
});

test('texto da política (página do produto e seção de envio)', () => {
  const policy = getShippingPolicyText();
  assert.equal(policy.headline, 'Frete grátis a partir de 2 miniaturas');
  assert.equal(policy.detail.replace(/\s/g, ' '), 'Com 1 miniatura, frete fixo de R$ 5,90 (Correios Mini)');

  const noFree = describeShippingPolicy({ ...storeConfig.shipping, freeShipping: { enabled: false } }, 590);
  assert.equal(noFree.headline, '');
  assert.match(noFree.detail, /^Frete fixo de R\$/);
  assert.equal(describeShippingPolicy(storeConfig.shipping, null).detail, ''); // depende do CEP
});
