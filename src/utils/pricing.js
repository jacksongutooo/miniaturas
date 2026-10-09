/**
 * CÁLCULO DE PREÇOS E DESCONTO PROGRESSIVO  (funções puras, sem DOM)
 * ----------------------------------------------------------------------------
 * Todos os valores aqui são em CENTAVOS (inteiros) para evitar erros de
 * arredondamento de ponto flutuante.
 *
 * Regras:
 *  • O desconto progressivo é calculado pela quantidade de miniaturas REGULARES.
 *  • A miniatura promocional ("order bump", bump: true) NÃO entra na contagem
 *    e NÃO recebe desconto: ela é somada ao total pelo preço fixo da oferta.
 *
 * Exemplo: 3 regulares (3 × 17,90 = 53,70) → 10% → 48,33 · + 1 promocional 12,90 = 61,23.
 */

import { toCents } from './format.js';

/** { 2: 5, 3: 10 } → [{ at: 2, percent: 5 }, { at: 3, percent: 10 }] (ordenado, sem valores inválidos). */
export function tiersFromRules(rules) {
  return Object.entries(rules ?? {})
    .map(([at, percent]) => ({ at: Number(at), percent: Number(percent) }))
    .filter((t) => Number.isFinite(t.at) && t.at > 0 && Number.isFinite(t.percent) && t.percent > 0)
    .sort((a, b) => a.at - b.at);
}

/** Percentual de desconto para uma quantidade de miniaturas regulares. */
export function discountPercentFor(count, rules) {
  let percent = 0;
  for (const tier of tiersFromRules(rules)) if (count >= tier.at) percent = tier.percent;
  return percent;
}

/** Próximo degrau ainda não alcançado (ou null se já está no máximo). */
export function nextTierFor(count, rules) {
  return tiersFromRules(rules).find((tier) => tier.at > count) ?? null;
}

/**
 * Calcula todos os totais do carrinho.
 *
 * @param {Array<{productId:number, qty:number, bump?:boolean}>} lines
 * @param {{ getProduct:(id:number)=>object|undefined, rules:object, upsellPrice:number }} opts
 */
export function computeTotals(lines, { getProduct, rules, upsellPrice }) {
  const bumpUnitCents = toCents(upsellPrice);
  const detailed = [];

  let regularCount = 0;
  let bumpCount = 0;
  let subtotal = 0; // regulares, preço cheio
  let bumpTotal = 0; // promocionais, preço da oferta
  let bumpListTotal = 0; // promocionais, preço cheio (só para calcular a economia)

  for (const line of lines) {
    const product = getProduct(line.productId);
    const qty = Math.max(0, Math.floor(Number(line.qty) || 0));
    if (!product || qty === 0) continue;

    const listPrice = toCents(product.price);
    const bump = Boolean(line.bump);
    const unitPrice = bump ? bumpUnitCents : listPrice;

    if (bump) {
      bumpCount += qty;
      bumpTotal += unitPrice * qty;
      bumpListTotal += listPrice * qty;
    } else {
      regularCount += qty;
      subtotal += listPrice * qty;
    }

    detailed.push({
      key: `${bump ? 'b' : 'r'}:${product.id}`,
      productId: product.id,
      qty,
      bump,
      unitPrice,
      listPrice,
      lineTotal: unitPrice * qty,
    });
  }

  const discountPercent = discountPercentFor(regularCount, rules);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const bumpSavings = bumpListTotal - bumpTotal;

  return {
    lines: detailed,
    regularCount,
    bumpCount,
    itemCount: regularCount + bumpCount,
    subtotal,
    discountPercent,
    discount,
    bumpTotal,
    bumpListTotal,
    bumpSavings,
    /** Tudo o que o cliente economiza (desconto progressivo + oferta). */
    savings: discount + bumpSavings,
    /** Total dos produtos, sem frete. */
    total: subtotal - discount + bumpTotal,
  };
}

// ── Frete grátis ─────────────────────────────────────────────────────────────
// Política em storeConfig.shipping.freeShipping (ex.: grátis a partir de 2 unidades).

/** Quantas unidades contam para o frete grátis (a promocional entra se countPromoUnits). */
export function shippingUnits(totals, freeShipping) {
  return totals.regularCount + (freeShipping?.countPromoUnits ? totals.bumpCount : 0);
}

/**
 * O pedido tem frete grátis? Libera por quantidade (minUnits) e/ou por valor (minOrderValue).
 * @param {{regularCount:number, bumpCount:number, total:number}} totals  resultado de computeTotals (centavos)
 */
export function qualifiesForFreeShipping(totals, freeShipping) {
  if (!freeShipping?.enabled || totals.itemCount === 0) return false;
  const byUnits = freeShipping.minUnits != null && shippingUnits(totals, freeShipping) >= freeShipping.minUnits;
  const byValue = freeShipping.minOrderValue != null && totals.total >= toCents(freeShipping.minOrderValue);
  return byUnits || byValue;
}

/** Quantas miniaturas faltam para o frete grátis por quantidade (0 se já tem ou se não se aplica). */
export function unitsMissingForFreeShipping(totals, freeShipping) {
  if (!freeShipping?.enabled || freeShipping.minUnits == null) return 0;
  return Math.max(0, freeShipping.minUnits - shippingUnits(totals, freeShipping));
}

/** Adicionar UMA miniatura promocional faria o pedido ganhar frete grátis? (usado na etapa da oferta) */
export function freeShippingUnlockedByBump(totals, freeShipping, bumpUnitCents) {
  if (qualifiesForFreeShipping(totals, freeShipping)) return false;
  const next = {
    ...totals,
    bumpCount: totals.bumpCount + 1,
    itemCount: totals.itemCount + 1,
    total: totals.total + bumpUnitCents,
  };
  return qualifiesForFreeShipping(next, freeShipping);
}
