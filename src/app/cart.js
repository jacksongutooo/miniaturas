/**
 * ESTADO DO CARRINHO
 * ----------------------------------------------------------------------------
 * Cada linha: { productId, qty, bump }
 *   bump: false → miniatura regular (conta para o desconto progressivo)
 *   bump: true  → miniatura promocional da oferta (preço fixo, fora do desconto)
 *
 * Persistido em localStorage: o carrinho sobrevive a recarregar a página e é
 * sincronizado entre abas. Guardamos só ids e quantidades — preços e descontos
 * são sempre recalculados com a config atual (assim, mudar um preço em
 * config/store.js vale também para carrinhos já salvos). Um "resumo" (quantidade,
 * desconto, promocional, total) também é gravado junto, para leitura externa.
 */

import { storeConfig } from '../config/store.js';
import { getProduct } from '../products/catalog.js';
import { isUpsellEligible } from '../products/upsell.js';
import { getMaxQty } from '../services/inventory.js';
import { track } from '../services/analytics.js';
import { computeTotals } from '../utils/pricing.js';
import { createEmitter } from '../utils/emitter.js';
import { local } from '../utils/storage.js';

const STORAGE_KEY = 'cart';
const VERSION = 1;

const emitter = createEmitter();
export const subscribe = emitter.subscribe;

export const lineKey = (line) => `${line.bump ? 'b' : 'r'}:${line.productId}`;

/** Aplica todas as regras de consistência ao carrinho. */
function normalize(list) {
  const seen = new Set();
  let lines = [];

  for (const raw of Array.isArray(list) ? list : []) {
    const product = getProduct(raw?.productId);
    if (!product) continue;
    const bump = Boolean(raw.bump);
    const key = `${bump ? 'b' : 'r'}:${product.id}`;
    if (seen.has(key)) continue;
    if (bump && !isUpsellEligible(product)) continue; // p.ex. conjunto mais caro: nunca a R$ 12,90
    const max = bump ? 1 : getMaxQty(product);
    const qty = Math.min(Math.max(1, Math.floor(Number(raw.qty) || 1)), bump ? 1 : max);
    if (max <= 0) continue; // esgotado
    seen.add(key);
    lines.push({ productId: product.id, qty, bump });
  }

  // A oferta só vale com pelo menos 1 miniatura regular no carrinho.
  if (!lines.some((l) => !l.bump)) lines = [];

  // Limite de promocionais por pedido.
  let bumps = 0;
  lines = lines.filter((l) => {
    if (!l.bump) return true;
    bumps += l.qty;
    return bumps <= storeConfig.upsellLimit;
  });

  // Regulares primeiro, promocionais depois (ordem de exibição).
  return [...lines.filter((l) => !l.bump), ...lines.filter((l) => l.bump)];
}

function compute(lines) {
  return computeTotals(lines, {
    getProduct,
    rules: storeConfig.discountRules,
    upsellPrice: storeConfig.upsellPrice,
  });
}

function load() {
  const saved = local.read(STORAGE_KEY);
  return saved?.version === VERSION ? normalize(saved.items) : [];
}

let lines = load();
let totals = compute(lines);

function commit(next) {
  lines = normalize(next);
  totals = compute(lines);
  local.write(STORAGE_KEY, {
    version: VERSION,
    items: lines,
    summary: {
      itemCount: totals.itemCount,
      regularCount: totals.regularCount,
      discountPercent: totals.discountPercent,
      discount: totals.discount / 100,
      promoItems: lines.filter((l) => l.bump).map((l) => l.productId),
      promoTotal: totals.bumpTotal / 100,
      total: totals.total / 100,
    },
    savedAt: new Date().toISOString(),
  });
  emitter.emit(getState());
}

// Sincroniza com outras abas abertas da loja.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === `${storeConfig.storageKey}:${STORAGE_KEY}`) {
      lines = load();
      totals = compute(lines);
      emitter.emit(getState());
    }
  });
}

export function getState() {
  return { lines, totals };
}

/** Quantidade regular de um modelo no carrinho. */
export const qtyOf = (productId) => lines.find((l) => !l.bump && l.productId === productId)?.qty ?? 0;
/** O modelo está no carrinho (regular ou promocional)? */
export const hasProduct = (productId) => lines.some((l) => l.productId === productId);
export const bumpUnits = () => lines.filter((l) => l.bump).reduce((n, l) => n + l.qty, 0);
export const canAddBump = () => bumpUnits() < storeConfig.upsellLimit && totals.regularCount > 0;

const trackItem = (product, quantity, price = product.price) => ({
  id: product.id,
  name: product.name,
  price,
  quantity,
});

/** Adiciona miniatura(s) regular(es). Retorna { ok, added, reason? } */
export function add(productId, qty = 1) {
  const product = getProduct(productId);
  if (!product) return { ok: false, added: 0, reason: 'unknown' };
  const max = getMaxQty(product);
  if (max <= 0) return { ok: false, added: 0, reason: 'soldout' };

  const current = qtyOf(productId);
  const added = Math.min(Math.max(1, qty), max - current);
  if (added <= 0) return { ok: false, added: 0, reason: 'max' };

  const next = lines.some((l) => !l.bump && l.productId === productId)
    ? lines.map((l) => (!l.bump && l.productId === productId ? { ...l, qty: l.qty + added } : l))
    : [...lines, { productId, qty: added, bump: false }];
  commit(next);

  track('AddToCart', { value: (product.price * added), items: [trackItem(product, added)] });
  return { ok: true, added, reason: added < qty ? 'capped' : undefined };
}

/** Adiciona a miniatura promocional (oferta de R$ 12,90). */
export function addBump(productId) {
  const product = getProduct(productId);
  if (!product) return { ok: false, reason: 'unknown' };
  if (getMaxQty(product) <= 0) return { ok: false, reason: 'soldout' };
  if (!isUpsellEligible(product)) return { ok: false, reason: 'ineligible' };
  if (totals.regularCount === 0) return { ok: false, reason: 'no-regular' };
  if (bumpUnits() >= storeConfig.upsellLimit) return { ok: false, reason: 'limit' };
  if (hasProduct(productId)) return { ok: false, reason: 'in-cart' };

  commit([...lines, { productId, qty: 1, bump: true }]);
  track('AddToCart', {
    value: storeConfig.upsellPrice,
    orderBump: true,
    items: [trackItem(product, 1, storeConfig.upsellPrice)],
  });
  return { ok: true };
}

function findByKey(key) {
  return lines.find((l) => lineKey(l) === key);
}

export function setQty(key, qty) {
  const line = findByKey(key);
  if (!line || line.bump) return;
  if (qty <= 0) return remove(key);
  commit(lines.map((l) => (l === line ? { ...l, qty } : l))); // normalize aplica o teto de estoque
}

export const increment = (key) => setQty(key, (findByKey(key)?.qty ?? 0) + 1);
export const decrement = (key) => setQty(key, Math.max(1, (findByKey(key)?.qty ?? 1) - 1));

export function remove(key) {
  commit(lines.filter((l) => lineKey(l) !== key));
}

export function clear() {
  commit([]);
}

/** Recoloca linhas guardadas (ex.: "Desfazer" depois de limpar o carrinho); as regras de consistência valem de novo. */
export function restore(list) {
  commit(list);
}

/** Linhas prontas para exibir: junta produto + preços calculados. */
export function getDetailedLines() {
  return totals.lines.map((l) => ({ ...l, product: getProduct(l.productId) }));
}
