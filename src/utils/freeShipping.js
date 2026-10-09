/**
 * MENSAGENS DO FRETE GRÁTIS  (funções puras, sem DOM)
 * ----------------------------------------------------------------------------
 * Tudo é derivado de storeConfig.shipping (freeShipping + tabela de opções): mudar a
 * regra na config muda os textos do carrinho, da página do produto e da seção de envio.
 */

import { money, toCents } from './format.js';
import { qualifiesForFreeShipping, unitsMissingForFreeShipping } from './pricing.js';

/**
 * Estado do frete grátis para o carrinho (aviso no carrinho).
 * @param {object} totals        resultado de computeTotals
 * @param {object} freeShipping  storeConfig.shipping.freeShipping
 * @returns {{ enabled:boolean, qualifies:boolean, missing:number, text:string }}
 */
export function getFreeShippingStatus(totals, freeShipping) {
  if (!freeShipping?.enabled) return { enabled: false, qualifies: false, missing: 0, text: '' };

  const qualifies = qualifiesForFreeShipping(totals, freeShipping);
  const missing = qualifies ? 0 : unitsMissingForFreeShipping(totals, freeShipping);

  let text = '';
  if (qualifies) {
    text = 'Frete grátis desbloqueado 🎉';
  } else if (freeShipping.minUnits != null) {
    text = `Frete grátis a partir de ${freeShipping.minUnits} miniaturas — ${missing === 1 ? 'falta' : 'faltam'} +${missing}`;
  } else if (freeShipping.minOrderValue != null) {
    text = `Frete grátis em pedidos a partir de ${money(toCents(freeShipping.minOrderValue))}`;
  }
  return { enabled: true, qualifies, missing, text };
}

/**
 * Frases da política de frete para a página do produto e a seção de envio.
 * @param {object} shipping       storeConfig.shipping
 * @param {number|null} paidCents frete cobrado quando NÃO é grátis (centavos); null se depende do CEP
 * @returns {{ headline:string, detail:string }}  strings vazias quando não há o que mostrar
 */
export function describeShippingPolicy(shipping, paidCents) {
  const fs = shipping.freeShipping;
  const carrier = shipping.options?.length === 1 ? shipping.options[0].name : '';
  const via = carrier ? ` (${carrier})` : '';

  let headline = '';
  if (fs?.enabled) {
    const parts = [];
    if (fs.minUnits != null) parts.push(`a partir de ${fs.minUnits} miniaturas`);
    if (fs.minOrderValue != null) parts.push(`em pedidos a partir de ${money(toCents(fs.minOrderValue))}`);
    if (parts.length) headline = `Frete grátis ${parts.join(' ou ')}`;
  }

  let detail = '';
  if (paidCents != null) {
    if (fs?.enabled && fs.minUnits != null) {
      const who = fs.minUnits - 1 === 1 ? 'Com 1 miniatura' : `Com menos de ${fs.minUnits} miniaturas`;
      detail = `${who}, frete fixo de ${money(paidCents)}${via}`;
    } else {
      detail = `Frete fixo de ${money(paidCents)}${via}`;
    }
  }

  return { headline, detail };
}
