import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { storeConfig } from '../src/config/store.js';
import { getProductBySlug } from '../src/products/catalog.js';
import { money } from '../src/utils/format.js';

// O carrinho grava no localStorage; aqui usamos um armazenamento falso na memória.
const memory = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => memory.set(k, String(v)),
    removeItem: (k) => memory.delete(k),
  },
  addEventListener() {},
};
const CART_KEY = `${storeConfig.storageKey}:cart`;

const cart = await import('../src/app/cart.js');
const idOf = (slug) => getProductBySlug(slug).id;
const brl = (cents) => money(cents).replace(/\s/g, ' ');

beforeEach(() => cart.clear());

test('oferta de R$ 12,90: uma miniatura padrão entra pelo preço da oferta', () => {
  cart.add(idOf('jesus-sentado'));
  const result = cart.addBump(idOf('maria-sentada'));
  assert.deepEqual(result, { ok: true });
  const t = cart.getState().totals;
  assert.equal(t.bumpCount, 1);
  assert.equal(brl(t.total), 'R$ 30,80'); // 17,90 + 12,90
});

test('oferta de R$ 12,90: o conjunto da Sagrada Família (R$ 43,90) é recusado', () => {
  cart.add(idOf('jesus-sentado'));
  const result = cart.addBump(idOf('sagrada-familia'));
  assert.deepEqual(result, { ok: false, reason: 'ineligible' });
  const t = cart.getState().totals;
  assert.equal(t.bumpCount, 0);
  assert.equal(brl(t.total), 'R$ 17,90');
});

test('o conjunto continua podendo ser comprado normalmente, pelo preço cheio', () => {
  cart.add(idOf('sagrada-familia'));
  const t = cart.getState().totals;
  assert.equal(t.regularCount, 1);
  assert.equal(brl(t.total), 'R$ 43,90');
});

test('oferta: limite de 1 por pedido, sem repetir item do carrinho e só com um regular', () => {
  assert.deepEqual(cart.addBump(idOf('maria-sentada')), { ok: false, reason: 'no-regular' });
  cart.add(idOf('jesus-sentado'));
  assert.deepEqual(cart.addBump(idOf('jesus-sentado')), { ok: false, reason: 'in-cart' });
  assert.deepEqual(cart.addBump(idOf('maria-sentada')), { ok: true });
  assert.deepEqual(cart.addBump(idOf('sao-jose-sentado')), { ok: false, reason: 'limit' });
});

test('carrinho salvo com o conjunto como "promocional" é corrigido ao carregar', async () => {
  memory.set(
    CART_KEY,
    JSON.stringify({
      version: 1,
      items: [
        { productId: idOf('jesus-sentado'), qty: 1, bump: false },
        { productId: idOf('sagrada-familia'), qty: 1, bump: true },
      ],
    }),
  );
  const fresh = await import('../src/app/cart.js?carrinho-salvo');
  assert.deepEqual(
    fresh.getState().lines.map((l) => [l.productId, l.bump]),
    [[idOf('jesus-sentado'), false]],
  );
  assert.equal(brl(fresh.getState().totals.total), 'R$ 17,90');
});

test('limpar e desfazer: restore devolve os mesmos itens, a promocional e o total', () => {
  cart.add(idOf('jesus-sentado'), 2);
  cart.add(idOf('maria-sentada'));
  cart.addBump(idOf('sao-jose-sentado'));
  const before = cart.getState();
  const snapshot = before.lines.map((l) => ({ productId: l.productId, qty: l.qty, bump: l.bump }));

  cart.clear();
  assert.equal(cart.getState().lines.length, 0);
  assert.equal(cart.getState().totals.itemCount, 0);

  cart.restore(snapshot);
  const after = cart.getState();
  assert.deepEqual(after.lines, before.lines);
  assert.equal(after.totals.total, before.totals.total);
  assert.equal(after.totals.bumpCount, 1);
  assert.equal(brl(after.totals.total), 'R$ 61,23'); // 3 × 17,90 = 53,70 − 10% = 48,33, mais a promocional de 12,90
});

test('restore respeita as regras: promocional sem miniatura regular é descartada', () => {
  cart.restore([{ productId: idOf('maria-sentada'), qty: 1, bump: true }]);
  assert.equal(cart.getState().lines.length, 0);
});
