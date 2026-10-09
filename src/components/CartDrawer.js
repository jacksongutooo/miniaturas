/**
 * CARRINHO LATERAL (desktop) / TELA CHEIA (celular)  +  ETAPA "ANTES DE FINALIZAR..."
 * ----------------------------------------------------------------------------
 * Duas visões dentro da mesma gaveta, sem trocar de página:
 *   'cart'  → itens, barra de progresso do desconto, resumo e "Finalizar compra"
 *   'offer' → oferta complementar (miniatura de R$ 12,90) antes de ir ao checkout
 */

import { storeConfig } from '../config/store.js';
import { content } from '../config/content.js';
import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { money, moneyFromReais, plural } from '../utils/format.js';
import { trapTab } from '../utils/focusTrap.js';
import { getProduct, getProducts } from '../products/catalog.js';
import { pickUpsellProducts } from '../products/upsell.js';
import { getMaxQty } from '../services/inventory.js';
import { getPath, hrefFor, navigate } from '../app/router.js';
import { pushOverlay, popOverlay } from '../app/overlays.js';
import * as cart from '../app/cart.js';
import { img, cartStepper } from './primitives.js';
import { hideToast } from './Toast.js';
import { discountProgress } from './DiscountProgress.js';
import { summaryRows } from './CartSummary.js';

let root; // .drawer
let panel;
let head;
let pin;
let body;
let foot;
let isOpen = false;
let view = 'cart';
let offerIds = [];
let dismissedAtCount = -1; // quantidade regular em que o cliente recusou a oferta
let lastFocus = null;
let hideTimer;
let lastFill = 0; // para animar a barra de progresso entre renderizações

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ── marcação ────────────────────────────────────────────────────────────────

function lineMarkup(line) {
  const { product } = line;
  const key = line.key;
  const href = hrefFor.product(product.slug);
  return html`<li class="line${line.bump ? ' line--bump' : ''}">
    <a class="line__media" href="${href}" data-action="drawer-nav" tabindex="-1" aria-hidden="true">${img({ src: product.images[0], alt: '', eager: true, width: 160, height: 160 })}</a>
    <div class="line__info">
      <a class="line__name" href="${href}" data-action="drawer-nav">${product.name}</a>
      <div class="line__pricing">
        ${line.bump
          ? html`<span><s>${money(line.listPrice)}</s> ${money(line.unitPrice)} <span class="tag">Oferta</span></span>`
          : html`<span>${money(line.unitPrice)}</span>`}
        <strong class="line__total">${money(line.lineTotal)}</strong>
      </div>
      ${line.bump ? html`<p class="line__note">Preço promocional, fora do desconto progressivo.</p>` : ''}
      <div class="line__controls">
        ${line.bump
          ? html`<span class="line__qty-fixed">1 un.</span>`
          : cartStepper({ key, qty: line.qty, max: getMaxQty(product), label: product.name })}
        <button type="button" class="line__remove" data-action="cart-remove" data-key="${key}" aria-label="Remover ${product.name} do carrinho">
          ${icon('trash', { size: 18 })}<span>Remover</span>
        </button>
      </div>
    </div>
  </li>`;
}

function headMarkup(totals) {
  if (view === 'offer') {
    return html`
      <button type="button" class="icon-btn" data-action="offer-back" aria-label="Voltar ao carrinho">${icon('arrowLeft', { size: 22 })}</button>
      <div class="drawer__titles">
        <h2 id="drawer-title" class="drawer__title">Antes de finalizar...</h2>
        <p class="drawer__sub">Complete sua coleção com uma oferta exclusiva.</p>
      </div>
      <button type="button" class="icon-btn" data-action="close-cart" aria-label="Fechar">${icon('close', { size: 22 })}</button>`;
  }
  return html`
    <div class="drawer__titles">
      <h2 id="drawer-title" class="drawer__title">Seu carrinho</h2>
      <p class="drawer__sub">${plural(totals.itemCount, 'miniatura', 'miniaturas')}</p>
    </div>
    <button type="button" class="icon-btn" data-action="close-cart" aria-label="Fechar carrinho">${icon('close', { size: 22 })}</button>`;
}

function emptyMarkup() {
  return html`<div class="drawer__empty">
    <span class="drawer__empty-icon">${icon('cart', { size: 34 })}</span>
    <p class="drawer__empty-title">Seu carrinho está vazio</p>
    <p class="muted">Escolha suas miniaturas favoritas e ganhe desconto progressivo.</p>
    <button type="button" class="btn btn--primary" data-action="browse">${content.hero.cta}</button>
  </div>`;
}

function offerCard(product, bumpInCart) {
  const price = moneyFromReais(storeConfig.upsellPrice);
  return html`<li class="offer-card${bumpInCart ? ' is-added' : ''}">
    <a class="offer-card__media" href="${hrefFor.product(product.slug)}" data-action="drawer-nav" tabindex="-1" aria-hidden="true">${img({ src: product.images[0], alt: '', eager: true, width: 200, height: 200 })}</a>
    <div class="offer-card__body">
      <h3 class="offer-card__name">${product.name}</h3>
      <p class="offer-card__prices"><span class="offer-card__from">De <s>${moneyFromReais(product.price)}</s></span> <span class="offer-card__to">Por: <strong>${price}</strong></span></p>
      <p class="offer-card__text">${bumpInCart ? 'Adicionado ao seu pedido.' : `Adicione ao seu pedido por apenas ${price}.`}</p>
    </div>
    <div class="offer-card__actions">
      ${bumpInCart
        ? html`<p class="offer-card__added">${icon('check', { size: 16 })} Adicionado ao pedido</p>
            <button type="button" class="link-btn" data-action="cart-remove" data-key="b:${product.id}">Remover</button>`
        : html`<button type="button" class="btn btn--primary btn--block" data-action="offer-add" data-id="${product.id}">+ Adicionar por ${price}</button>`}
    </div>
  </li>`;
}

/** A barra é recriada a cada renderização; parte do valor anterior para a transição aparecer. */
function animateProgress() {
  const bar = pin.querySelector('.progress');
  if (!bar) return;
  const target = Number(bar.style.getPropertyValue('--fill')) || 0;
  if (!isOpen || target === lastFill) {
    lastFill = target;
    return;
  }
  bar.style.setProperty('--fill', String(lastFill));
  void bar.offsetWidth;
  bar.style.setProperty('--fill', String(target));
  lastFill = target;
}

function render() {
  const { totals, lines } = cart.getState();

  // Carrinho esvaziado enquanto estava na oferta → volta para o carrinho.
  if (totals.itemCount === 0 && view === 'offer') view = 'cart';

  const scrollTop = body.scrollTop;
  const active = document.activeElement;
  const refocus = panel.contains(active) && active.dataset?.action
    ? `[data-action="${active.dataset.action}"]${active.dataset.key ? `[data-key="${active.dataset.key}"]` : ''}${active.dataset.id ? `[data-id="${active.dataset.id}"]` : ''}`
    : null;

  head.innerHTML = String(headMarkup(totals));

  if (view === 'offer') {
    pin.innerHTML = '';
    pin.hidden = true;
    const canAdd = cart.canAddBump();
    const visible = offerIds
      .map((id) => getProduct(id))
      .filter(Boolean)
      .map((p) => ({ p, added: lines.some((l) => l.bump && l.productId === p.id) }))
      .filter(({ added }) => added || canAdd);
    const hasBump = totals.bumpCount > 0;

    body.innerHTML = String(html`<ul class="offer-list">${visible.map(({ p, added }) => offerCard(p, added))}</ul>
      ${hasBump ? html`<p class="offer-note">A miniatura promocional tem preço fixo e não entra na contagem do desconto progressivo.</p>` : ''}`);
    foot.hidden = false;
    foot.innerHTML = String(html`
      <div class="offer-total"><span>Total do pedido</span><strong>${money(totals.total)}</strong></div>
      ${hasBump
        ? html`<button type="button" class="btn btn--primary btn--lg btn--block" data-action="offer-continue">Continuar para o checkout</button>`
        : html`<button type="button" class="link-btn link-btn--muted" data-action="offer-skip">Não, quero continuar</button>`}
    `);
  } else if (totals.itemCount === 0) {
    pin.innerHTML = '';
    pin.hidden = true;
    body.innerHTML = String(emptyMarkup());
    foot.innerHTML = '';
    foot.hidden = true;
  } else {
    pin.hidden = false;
    pin.innerHTML = String(discountProgress(totals));
    animateProgress();
    body.innerHTML = String(html`<ul class="lines">${cart.getDetailedLines().map(lineMarkup)}</ul>`);
    foot.hidden = false;
    foot.innerHTML = String(html`
      ${summaryRows(totals)}
      <button type="button" class="btn btn--primary btn--lg btn--block" data-action="checkout">Finalizar compra</button>
      <p class="drawer__fine">Frete e pagamento na próxima etapa.</p>
    `);
  }

  body.scrollTop = scrollTop;
  if (refocus) panel.querySelector(refocus)?.focus({ preventScroll: true });
}

// ── abrir / fechar ───────────────────────────────────────────────────────────

function show() {
  clearTimeout(hideTimer);
  root.hidden = false;
  root.setAttribute('aria-hidden', 'false');
  void root.offsetWidth; // aplica o estado inicial antes da transição
  root.classList.add('is-open');
  document.documentElement.classList.add('no-scroll');
  document.body.classList.add('is-drawer-open');
}

function hide() {
  if (!isOpen) return;
  isOpen = false;
  root.classList.remove('is-open');
  root.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('no-scroll');
  document.body.classList.remove('is-drawer-open');
  hideTimer = setTimeout(() => (root.hidden = true), reducedMotion() ? 0 : 260);
  lastFocus?.focus?.({ preventScroll: true });
}

export function openCart(startView = 'cart') {
  if (isOpen) return;
  view = startView;
  isOpen = true;
  hideToast();
  lastFocus = document.activeElement;
  render();
  show();
  panel.focus({ preventScroll: true });
  pushOverlay('cart', hide);
}

export function closeCart() {
  if (!isOpen) return;
  hide();
  popOverlay('cart');
}

/** Fecha sem mexer no histórico (usado antes de navegar para outra página). */
export function closeForNavigation() {
  if (!isOpen) return;
  hide();
  // a entrada de histórico do overlay é descartada pelo router (dropOverlays)
}

export const isCartOpen = () => isOpen;

// ── fluxo "Finalizar compra" → oferta → checkout ─────────────────────────────

function goCheckout() {
  closeForNavigation();
  navigate(hrefFor.checkout().slice(1));
}

export function startCheckout() {
  const { totals, lines } = cart.getState();
  if (totals.regularCount === 0) return;

  const picks = pickUpsellProducts(lines, getProducts(), storeConfig.upsellSuggestions);
  const offerAvailable = cart.canAddBump() && picks.length > 0 && dismissedAtCount !== totals.regularCount;
  if (!offerAvailable) return goCheckout();

  offerIds = picks.map((p) => p.id);
  view = 'offer';
  render();
  body.scrollTop = 0;
  panel.focus({ preventScroll: true });
}

export const offerActions = {
  back() {
    view = 'cart';
    render();
  },
  skip() {
    dismissedAtCount = cart.getState().totals.regularCount;
    goCheckout();
  },
  continue() {
    goCheckout();
  },
  navigate(href) {
    const path = href.replace(/^#/, '');
    if (path === getPath()) return closeCart(); // já está nesta página
    closeForNavigation();
    navigate(path);
  },
};

// ── montagem ─────────────────────────────────────────────────────────────────

export function mountCartDrawer(container) {
  root = document.createElement('div');
  root.className = 'drawer';
  root.id = 'cart-drawer';
  root.hidden = true;
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="drawer__backdrop" data-action="close-cart"></div>
    <section class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">
      <header class="drawer__head"></header>
      <div class="drawer__pin" hidden></div>
      <div class="drawer__body"></div>
      <footer class="drawer__foot" hidden></footer>
    </section>`;
  container.appendChild(root);

  panel = root.querySelector('.drawer__panel');
  head = root.querySelector('.drawer__head');
  pin = root.querySelector('.drawer__pin');
  body = root.querySelector('.drawer__body');
  foot = root.querySelector('.drawer__foot');

  cart.subscribe(() => {
    if (isOpen) render();
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeCart();
    } else trapTab(panel, e);
  });
}
