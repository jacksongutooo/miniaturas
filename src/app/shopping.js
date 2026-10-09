/**
 * Ações de compra com feedback ao cliente (toast): adicionar ao carrinho etc.
 */

import { storeConfig } from '../config/store.js';
import { html } from '../utils/html.js';
import { getDiscountProgress } from '../utils/discount.js';
import { getFreeShippingStatus } from '../utils/freeShipping.js';
import { getProduct } from '../products/catalog.js';
import { showToast } from '../components/Toast.js';
import { closeCart, closeForNavigation } from '../components/CartDrawer.js';
import { getPath, navigate, onRouteChange } from './router.js';
import * as cart from './cart.js';

/** Adiciona ao carrinho e mostra o quanto falta para o próximo desconto e para o frete grátis. */
export function addToCart(productId, qty = 1) {
  const product = getProduct(productId);
  const shippingBefore = getFreeShippingStatus(cart.getState().totals, storeConfig.shipping.freeShipping);
  const result = cart.add(productId, qty);

  if (!result.ok) {
    const message =
      result.reason === 'soldout'
        ? 'Este modelo está esgotado.'
        : result.reason === 'max'
          ? 'Você já tem no carrinho a quantidade máxima disponível deste modelo.'
          : 'Não foi possível adicionar este modelo.';
    showToast(message, { tone: 'default' });
    return result;
  }

  const { totals } = cart.getState();
  const progress = getDiscountProgress(totals.regularCount, storeConfig.discountRules, totals.savings);
  let note = result.reason === 'capped' ? 'Quantidade limitada ao estoque disponível.' : progress.hint || progress.title;

  // Frete grátis: comemora quando libera; senão lembra a regra (só quando há o que ganhar).
  const shipping = getFreeShippingStatus(totals, storeConfig.shipping.freeShipping);
  if (shipping.enabled && result.reason !== 'capped') {
    if (shipping.qualifies && !shippingBefore.qualifies) {
      note = `Frete grátis desbloqueado 🎉 ${note}`.trim();
    } else if (!shipping.qualifies && shipping.missing > 0) {
      // Desconto e frete grátis liberam com a mesma quantidade → uma frase só.
      const sameStep = progress.percent === 0 && progress.remaining === shipping.missing && note.endsWith('.');
      note = sameStep
        ? `${note.slice(0, -1)} + frete grátis.`
        : `${note} Frete grátis a partir de ${storeConfig.shipping.freeShipping.minUnits} miniaturas.`.trim();
    }
  }

  showToast(
    html`<strong>${product.name}</strong> adicionada${note ? html`<small class="toast__note">${note}</small>` : ''}`,
    { tone: 'success', actionLabel: 'Ver carrinho', action: 'open-cart', duration: 3800 },
  );
  return result;
}

/** "Ver miniaturas": vai para a vitrine (se preciso) e rola até o catálogo. */
export function browseCatalog() {
  const scroll = () => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (getPath() === '/') {
    closeCart(); // mesma página: fecha normalmente (inclusive no histórico)
    return scroll();
  }
  closeForNavigation();
  const off = onRouteChange(() => {
    off();
    requestAnimationFrame(scroll);
  });
  navigate('/');
}
