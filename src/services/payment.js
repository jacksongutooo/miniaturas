/**
 * PAGAMENTO / CRIAÇÃO DO PEDIDO
 * ----------------------------------------------------------------------------
 * TODO: configurar gateway.
 *
 * Enquanto storeConfig.checkout.paymentProvider === 'demo', NENHUM pagamento real
 * é feito: o pedido só é simulado no navegador para você testar o fluxo. O site
 * mostra um aviso de "modo demonstração" no checkout e os pixels NÃO registram
 * "Purchase" para pedidos demo.
 *
 * Para integrar um gateway (Mercado Pago, Pagar.me, Stripe, Asaas, Pagarme, Efí...):
 *   1. Crie um endpoint SEU (ex.: /api/pedidos) que recebe o pedido, recalcula os
 *      valores no servidor (NUNCA confie nos totais vindos do navegador) e cria a cobrança.
 *      Chaves secretas ficam só no servidor.
 *   2. Implemente um provedor em `providers` abaixo e troque storeConfig.checkout.paymentProvider.
 *   3. Retorne { ok: true, order: { ...order, status: 'pending' | 'paid', payment: { pixCode?, redirectUrl? } } }.
 *      Para cartão, use os campos hospedados/redirecionamento do gateway — não colete número
 *      de cartão em campos próprios.
 *
 * Formato do pedido recebido:
 *   { customer, address, shipping, paymentMethod, items:[{productId,name,qty,unitPrice,bump}],
 *     totals:{ subtotal, discountPercent, discount, bumpTotal, shipping, total } (centavos), utm }
 */

import { storeConfig } from '../config/store.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function orderNumber() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${t}${r}`;
}

const providers = {
  /** Simulação local — não cobra ninguém. */
  async demo(order) {
    await wait(900);
    return {
      ok: true,
      order: {
        ...order,
        id: `DEMO-${orderNumber()}`,
        createdAt: new Date().toISOString(),
        status: 'demo',
        demo: true,
      },
    };
  },

  // async meuGateway(order) {
  //   const res = await fetch('/api/pedidos', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(order),
  //   });
  //   if (!res.ok) return { ok: false, message: 'Não foi possível criar o pedido. Tente novamente.' };
  //   return { ok: true, order: await res.json() };
  // },
};

export const isDemoPayment = () => storeConfig.checkout.paymentProvider === 'demo';

/** @returns {Promise<{ok:boolean, order?:object, message?:string}>} */
export async function createOrder(order) {
  const provider = providers[storeConfig.checkout.paymentProvider];
  if (!provider) return { ok: false, message: 'Pagamento ainda não configurado.' };
  try {
    return await provider(order);
  } catch {
    return { ok: false, message: 'Não foi possível processar agora. Tente novamente em instantes.' };
  }
}
