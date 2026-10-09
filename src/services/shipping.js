/**
 * FRETE
 * ----------------------------------------------------------------------------
 * TODO: configurar frete.
 *
 * Política atual (storeConfig.shipping): frete grátis a partir da 2ª unidade; com 1 miniatura,
 * frete fixo de R$ 5,90 pelo Correios Mini. A regra de "quando é grátis" fica em
 * utils/pricing.js (qualifiesForFreeShipping) e é configurada em storeConfig.shipping.freeShipping.
 *
 * Provedor 'flat' (padrão): usa a tabela de storeConfig.shipping.options, igual para
 * todo o Brasil. Para calcular por CEP, adicione um provedor abaixo (ex.: Melhor Envio,
 * Correios, Frenet — normalmente via um endpoint SEU, para não expor chaves no navegador)
 * e troque storeConfig.shipping.provider. O frete grátis continua valendo por cima.
 *
 * getShippingOptions() sempre devolve uma Promise de:
 *   [{ id, name, carrier, price (centavos), minDays, maxDays, free }]
 */

import { storeConfig } from '../config/store.js';
import { qualifiesForFreeShipping } from '../utils/pricing.js';
import { describeShippingPolicy } from '../utils/freeShipping.js';
import { toCents } from '../utils/format.js';

const providers = {
  async flat() {
    return storeConfig.shipping.options.map((o) => ({
      id: o.id,
      name: o.name,
      carrier: o.carrier,
      price: toCents(o.price),
      minDays: o.minDays,
      maxDays: o.maxDays,
    }));
  },

  // async melhorEnvio({ cep, totals, items }) {
  //   const res = await fetch('/api/frete', { method: 'POST', body: JSON.stringify({ cep, items }) });
  //   return (await res.json()).options;
  // },
};

/**
 * Opções de entrega do pedido (checkout).
 * @param {{ cep:string, totals:object, items:Array }} ctx  totals = resultado de computeTotals (centavos)
 */
export async function getShippingOptions(ctx) {
  const provider = providers[storeConfig.shipping.provider] ?? providers.flat;
  const options = await provider(ctx);
  // Frete grátis: apenas a opção mais barata fica gratuita.
  if (options.length && qualifiesForFreeShipping(ctx.totals, storeConfig.shipping.freeShipping)) {
    const cheapest = options.reduce((a, b) => (b.price < a.price ? b : a));
    return options.map((o) => (o === cheapest ? { ...o, price: 0, free: true } : o));
  }
  return options;
}

const cheapestPaidCents = () => {
  const { provider, options } = storeConfig.shipping;
  if (provider !== 'flat' || options.length === 0) return null; // depende do CEP
  return Math.min(...options.map((o) => toCents(o.price)));
};

/**
 * Frete estimado para mostrar no carrinho, antes de pedir o CEP.
 * @returns {{ cents:number, free:boolean }|null}  null = só dá para saber no checkout
 */
export function estimateCartShipping(totals) {
  if (totals.itemCount === 0) return null;
  if (qualifiesForFreeShipping(totals, storeConfig.shipping.freeShipping)) return { cents: 0, free: true };
  const cents = cheapestPaidCents();
  return cents == null ? null : { cents, free: false };
}

/** Total a pagar: produtos + frete estimado (quando já é conhecido). */
export const cartGrandTotal = (totals) => totals.total + (estimateCartShipping(totals)?.cents ?? 0);

/** Frases da política de frete (página do produto e seção "Embalagem e envio"). */
export const getShippingPolicyText = () => describeShippingPolicy(storeConfig.shipping, cheapestPaidCents());

/** "De 5 a 10 dias úteis" */
export function deliveryLabel(option) {
  if (!option.minDays && !option.maxDays) return '';
  if (option.minDays === option.maxDays) return `${option.maxDays} dias úteis`;
  return `De ${option.minDays} a ${option.maxDays} dias úteis`;
}
