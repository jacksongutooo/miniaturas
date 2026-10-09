/**
 * AÇÕES GLOBAIS (data-action="...") — cliques que valem em qualquer página.
 */

import { on } from './actions.js';
import * as cart from './cart.js';
import * as favorites from './favorites.js';
import { addToCart, browseCatalog } from './shopping.js';
import { openCart, closeCart, startCheckout, offerActions, clearCart, undoClearCart } from '../components/CartDrawer.js';
import { openLightboxFromElement } from '../components/Lightbox.js';
import { showToast } from '../components/Toast.js';
import { getProduct } from '../products/catalog.js';

const lineByKey = (key) => cart.getState().lines.find((l) => cart.lineKey(l) === key);

export function registerHandlers() {
  // ── carrinho ───────────────────────────────────────────────────────────
  on('add-to-cart', (el) => addToCart(Number(el.dataset.id), 1));
  on('cart-inc', (el) => {
    const line = lineByKey(el.dataset.key);
    if (!line) return;
    const before = line.qty;
    cart.increment(el.dataset.key);
    if (lineByKey(el.dataset.key)?.qty === before) showToast('Quantidade máxima disponível deste modelo.');
  });
  on('cart-dec', (el) => {
    const line = lineByKey(el.dataset.key);
    if (!line) return;
    if (el.dataset.removeAtMin && line.qty <= 1) cart.remove(el.dataset.key);
    else cart.decrement(el.dataset.key);
  });
  on('cart-remove', (el) => cart.remove(el.dataset.key));
  on('cart-clear', () => clearCart());
  on('cart-undo-clear', () => undoClearCart());
  on('open-cart', () => openCart());
  on('close-cart', () => closeCart());
  on('checkout', () => startCheckout());

  // ── oferta antes do checkout ───────────────────────────────────────────
  on('offer-add', (el) => {
    const result = cart.addBump(Number(el.dataset.id));
    if (!result.ok) {
      showToast(result.reason === 'limit' ? 'Você já atingiu o limite de ofertas por pedido.' : 'Esta oferta não está mais disponível.');
    }
  });
  on('offer-skip', () => offerActions.skip());
  on('offer-continue', () => offerActions.continue());
  on('offer-back', () => offerActions.back());
  on('drawer-nav', (el) => offerActions.navigate(el.getAttribute('href')));
  on('browse', () => browseCatalog());

  // ── favoritos ──────────────────────────────────────────────────────────
  on('toggle-favorite', (el) => {
    const id = Number(el.dataset.id);
    const added = favorites.toggle(id);
    if (added) showToast(`${getProduct(id)?.name ?? 'Miniatura'} salva nos favoritos.`, { actionLabel: 'Ver favoritos', action: 'open-favorites' });
  });
  on('open-favorites', () => {
    window.location.hash = '#/favoritos';
  });

  // ── navegação / utilidades ─────────────────────────────────────────────
  on('open-lightbox', (el) => openLightboxFromElement(el));
  on('scroll-to', (el) => {
    document.getElementById(el.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  on('skip-to-main', () => {
    const main = document.getElementById('main');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView();
  });
  on('whatsapp-unset', () => {
    // TODO: adicionar WhatsApp em src/config/store.js (storeConfig.whatsapp.number).
    showToast(`WhatsApp ainda não configurado. Defina o número em src/config/store.js.`);
  });
}
