/**
 * FRETE
 * ----------------------------------------------------------------------------
 * TODO: configurar frete.
 *
 * Provedor 'flat' (padrão): usa a tabela de storeConfig.shipping.options, igual para
 * todo o Brasil. Para calcular por CEP, adicione um provedor abaixo (ex.: Melhor Envio,
 * Correios, Frenet — normalmente via um endpoint SEU, para não expor chaves no navegador)
 * e troque storeConfig.shipping.provider.
 *
 * getShippingOptions() sempre devolve uma Promise de:
 *   [{ id, name, carrier, price (centavos), minDays, maxDays, free }]
 */

import { storeConfig } from '../config/store.js';
import { qualifiesForFreeShipping } from '../utils/pricing.js';
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

  // async melhorEnvio({ cep, items }) {
  //   const res = await fetch('/api/frete', { method: 'POST', body: JSON.stringify({ cep, items }) });
  //   return (await res.json()).options;
  // },
};

/**
 * @param {{ cep:string, goodsTotal:number (centavos, já com descontos), items:Array }} ctx
 */
export async function getShippingOptions(ctx) {
  const provider = providers[storeConfig.shipping.provider] ?? providers.flat;
  const options = await provider(ctx);
  const free = qualifiesForFreeShipping(ctx.goodsTotal, storeConfig.shipping.freeShipping);
  // Com frete grátis, apenas a opção mais barata fica gratuita.
  if (free && options.length) {
    const cheapest = options.reduce((a, b) => (b.price < a.price ? b : a));
    return options.map((o) => (o === cheapest ? { ...o, price: 0, free: true } : o));
  }
  return options;
}

/** "De 5 a 10 dias úteis" */
export function deliveryLabel(option) {
  if (!option.minDays && !option.maxDays) return '';
  if (option.minDays === option.maxDays) return `${option.maxDays} dias úteis`;
  return `De ${option.minDays} a ${option.maxDays} dias úteis`;
}
