/**
 * CHECKOUT — 5 etapas: Dados → Endereço → Entrega → Pagamento → Confirmação.
 * Carregado sob demanda (só quem chega ao checkout baixa este código).
 *
 * Os dados do formulário ficam em sessionStorage (somem ao fechar a aba) para que
 * recarregar a página não apague o que o cliente já digitou.
 */

import { storeConfig } from '../config/store.js';
import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { money } from '../utils/format.js';
import { maskCep, maskCpf, maskPhone, onlyDigits } from '../utils/validators.js';
import { session } from '../utils/storage.js';
import { getUtm } from '../utils/utm.js';
import { getProduct } from '../products/catalog.js';
import { getShippingOptions, deliveryLabel } from '../services/shipping.js';
import { lookupCep } from '../services/cep.js';
import { createOrder } from '../services/payment.js';
import { track } from '../services/analytics.js';
import * as cart from '../app/cart.js';
import { getPath, hrefFor } from '../app/router.js';
import { brand } from '../components/Header.js';
import { img } from '../components/primitives.js';
import { summaryRows } from '../components/CartSummary.js';
import { stepNav, personalStep, addressStep, cepStatus, shippingStep, paymentStep, confirmationStep } from './checkout/steps.js';
import { validatePersonal, validateAddress, validateShipping, validatePayment } from './checkout/validation.js';

const MASKS = { cpf: maskCpf, phone: maskPhone, cep: maskCep };
const SESSION_KEY = 'checkout';

const emptyForm = () => ({
  name: '', email: '', phone: '', cpf: '',
  cep: '', street: '', number: '', noNumber: false, complement: '', district: '', city: '', state: '',
  shippingId: '',
  paymentMethod: storeConfig.checkout.paymentMethods[0]?.id ?? '',
});

const trackItems = (lines) =>
  lines.map((l) => ({ id: l.productId, name: getProduct(l.productId)?.name ?? '', price: l.unitPrice / 100, quantity: l.qty }));

function summaryMarkup(totals, lines, shipping) {
  return html`
    <ul class="order-lines">
      ${lines.map((l) => {
        const p = getProduct(l.productId);
        return html`<li class="order-line">
          <span class="order-line__media">${img({ src: p.images[0], alt: '', width: 120, height: 120 })}<span class="order-line__qty">${l.qty}</span></span>
          <span class="order-line__name">${p.name}${l.bump ? html` <span class="tag">Oferta</span>` : ''}</span>
          <span class="order-line__price">${money(l.lineTotal)}</span>
        </li>`;
      })}
    </ul>
    ${summaryRows(totals, { shipping, showShipping: true })}
  `;
}

export default function CheckoutPage() {
  const markup = html`<div class="checkout" data-checkout>
    <header class="checkout__top">
      <div class="container checkout__top-inner">
        ${brand()}
        <span class="secure">${icon('lock', { size: 16 })} Compra segura</span>
      </div>
    </header>

    <div class="container checkout__layout">
      <div class="checkout__main">
        <a class="back-link" href="${hrefFor.home()}" data-back-link>${icon('arrowLeft', { size: 16 })} Continuar comprando</a>
        <div data-steps-nav></div>

        <details class="summary-mobile" data-summary-mobile>
          <summary class="summary-mobile__toggle">
            <span>${icon('cart', { size: 18 })} Ver resumo do pedido</span>
            <span class="summary-mobile__right"><strong data-summary-total></strong>${icon('chevronDown', { size: 18, class: 'summary-mobile__chev' })}</span>
          </summary>
          <div class="summary-mobile__body" data-summary-body></div>
        </details>

        <div class="checkout__panel" data-step-panel></div>
      </div>

      <aside class="checkout__aside" aria-label="Resumo do pedido">
        <div class="summary-card">
          <h2 class="summary-card__title">Resumo do pedido</h2>
          <div data-summary-body></div>
        </div>
      </aside>
    </div>
  </div>`;

  return { title: 'Finalizar compra', html: markup, layout: 'checkout', mount };
}

function mount(root) {
  const el = root.querySelector('[data-checkout]');
  const panel = root.querySelector('[data-step-panel]');
  const navEl = root.querySelector('[data-steps-nav]');
  const summaryBodies = [...root.querySelectorAll('[data-summary-body]')];
  const summaryTotal = root.querySelector('[data-summary-total]');

  let form = { ...emptyForm(), ...session.read(SESSION_KEY, {}) };
  let errors = {};
  let step = 1;
  let maxStep = 1;
  let shippingOptions = null;
  let shippingFailed = false;
  let shippingKey = '';
  let lastLookupCep = '';
  let lookupState = 'idle';
  let submitting = false;
  let paymentError = '';
  let order = session.read('lastOrder', null);

  const cartEmpty = () => cart.getState().totals.itemCount === 0;
  const isComplete = () => Boolean(order) && cartEmpty();
  if (isComplete()) step = 5;

  const persist = () => session.write(SESSION_KEY, form);

  // ── dados derivados ──────────────────────────────────────────────────────
  const selectedShipping = () => shippingOptions?.find((o) => o.id === form.shippingId) ?? null;
  const shippingSummary = () => {
    const s = selectedShipping();
    return s ? { cents: s.price, free: Boolean(s.free) } : null;
  };
  const shippingLabel = () => {
    const s = selectedShipping();
    if (!s) return '—';
    return `${s.name} (${s.free ? 'Grátis' : money(s.price)}) • ${deliveryLabel(s)}`;
  };
  const addressLine = () =>
    `${form.street}, ${form.noNumber ? 's/n' : form.number}${form.complement ? ` — ${form.complement}` : ''} — ${form.district}, ${form.city}/${form.state} — CEP ${form.cep}`;
  const grandTotal = () => cart.getState().totals.total + (selectedShipping()?.price ?? 0);

  // ── renderização ─────────────────────────────────────────────────────────
  function renderSummary() {
    const { totals } = cart.getState();
    const lines = cart.getState().totals.lines;
    const body = lines.length ? summaryMarkup(totals, lines, shippingSummary()) : html``;
    summaryBodies.forEach((b) => (b.innerHTML = String(body)));
    if (summaryTotal) summaryTotal.textContent = money(grandTotal());
    el.classList.toggle('is-complete', step === 5);
  }

  function panelMarkup() {
    if (step === 5 && order) return confirmationStep(order);
    if (cartEmpty()) {
      return html`<div class="empty-state">
        <p class="empty-state__title">Seu carrinho está vazio</p>
        <p class="muted">Adicione miniaturas para finalizar a compra.</p>
        <a class="btn btn--primary" href="${hrefFor.home()}">Ver miniaturas</a>
      </div>`;
    }
    switch (step) {
      case 1: return personalStep(form, errors);
      case 2: return addressStep(form, errors, { lookup: lookupState });
      case 3: return shippingStep(form, errors, shippingOptions, { failed: shippingFailed });
      default:
        return paymentStep(form, errors, {
          grandTotal: grandTotal(),
          addressLine: addressLine(),
          shippingLabel: shippingLabel(),
          submitting,
          errorMessage: paymentError,
        });
    }
  }

  function render({ focus = true } = {}) {
    const showNav = !(cartEmpty() && !order);
    navEl.innerHTML = showNav ? String(stepNav(step, maxStep)) : '';
    panel.innerHTML = String(panelMarkup());
    root.querySelector('[data-back-link]').hidden = step === 5;
    renderSummary();
    if (focus) {
      const invalid = panel.querySelector('[aria-invalid="true"]');
      if (invalid) invalid.focus();
      else {
        const heading = panel.querySelector('.step__title');
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        }
      }
    }
  }

  /** Re-renderiza a etapa mantendo o foco no mesmo campo (ex.: trocar forma de pagamento). */
  function rerenderKeepFocus() {
    const a = document.activeElement;
    const sel = a?.name ? `[name="${a.name}"]${a.type === 'radio' ? `[value="${a.value}"]` : ''}` : null;
    render({ focus: false });
    if (sel) panel.querySelector(sel)?.focus({ preventScroll: true });
  }

  // ── navegação entre etapas ───────────────────────────────────────────────
  function goStep(n, { push = true } = {}) {
    step = n;
    maxStep = Math.max(maxStep, n);
    errors = {};
    paymentError = '';
    if (push) history.pushState({ checkoutStep: n }, '', location.href);
    if (n === 3) loadShipping();
    render();
    window.scrollTo(0, 0);
  }

  async function loadShipping() {
    const { totals, lines } = cart.getState();
    const key = `${onlyDigits(form.cep)}|${totals.total}|${storeConfig.shipping.provider}`;
    if (shippingOptions && key === shippingKey) return;
    shippingOptions = null;
    shippingFailed = false;
    shippingKey = key;
    try {
      const options = await getShippingOptions({ cep: onlyDigits(form.cep), goodsTotal: totals.total, items: lines });
      shippingOptions = options;
      if (!options.some((o) => o.id === form.shippingId)) form.shippingId = options[0]?.id ?? '';
      persist();
    } catch {
      shippingFailed = true;
      shippingKey = '';
    }
    if (step === 3) render({ focus: false });
    renderSummary();
  }

  // ── CEP ──────────────────────────────────────────────────────────────────
  function setCepStatus(state) {
    lookupState = state;
    const box = panel.querySelector('[data-cep-status]');
    if (box) box.innerHTML = String(cepStatus(state));
  }
  async function maybeLookupCep() {
    const digits = onlyDigits(form.cep);
    if (digits.length !== 8 || digits === lastLookupCep) return;
    lastLookupCep = digits;
    setCepStatus('loading');
    const result = await lookupCep(digits);
    if (onlyDigits(form.cep) !== digits || step !== 2) return; // o cliente mudou o CEP/etapa
    if (!result) return setCepStatus('notfound');
    const fill = { street: result.street, district: result.district, city: result.city, state: result.state };
    Object.entries(fill).forEach(([name, value]) => {
      if (!value) return;
      form[name] = value;
      const input = panel.querySelector(`[name="${name}"]`);
      if (input) input.value = value;
    });
    persist();
    setCepStatus('found');
    panel.querySelector('[name="number"]')?.focus();
  }

  // ── eventos do formulário ────────────────────────────────────────────────
  function clearFieldError(input) {
    const wrap = input.closest('.field');
    if (!wrap || !wrap.classList.contains('has-error')) return;
    wrap.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    wrap.querySelector('.field__error')?.remove();
    delete errors[input.name];
  }

  panel.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.name) return;
    if (t.type === 'radio') return;
    if (t.dataset.mask) {
      t.value = MASKS[t.dataset.mask](t.value);
    }
    if (t.type === 'checkbox') {
      form[t.name] = t.checked;
      if (t.name === 'noNumber') {
        const num = panel.querySelector('[name="number"]');
        num.disabled = t.checked;
        num.closest('.field').classList.toggle('is-disabled', t.checked);
        if (t.checked) {
          num.value = '';
          form.number = '';
          clearFieldError(num);
        }
      }
    } else {
      form[t.name] = t.value;
    }
    clearFieldError(t);
    persist();
    if (t.name === 'cep') maybeLookupCep();
  });

  panel.addEventListener('change', (e) => {
    const t = e.target;
    if (t.tagName === 'SELECT') {
      form[t.name] = t.value;
      clearFieldError(t);
      persist();
      return;
    }
    if (t.type === 'radio') {
      form[t.name] = t.value;
      errors = {};
      persist();
      if (t.name === 'shippingId') {
        panel.querySelectorAll('.choice').forEach((c) => c.classList.toggle('is-checked', c.contains(t)));
        renderSummary();
      } else {
        rerenderKeepFocus();
      }
    }
  });

  panel.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = Number(e.target.dataset.stepForm);
    const validators = { 1: validatePersonal, 2: validateAddress, 3: validateShipping, 4: validatePayment };
    const found = validators[n]?.(form) ?? {};
    if (Object.keys(found).length) {
      errors = found;
      render();
      return;
    }
    if (n < 4) goStep(n + 1);
    else submitOrder();
  });

  root.addEventListener('click', (e) => {
    const goto = e.target.closest('[data-goto-step]');
    if (goto) {
      const n = Number(goto.dataset.gotoStep);
      if (n < step) goStep(n);
    }
    if (e.target.closest('[data-retry-shipping]')) {
      shippingKey = '';
      loadShipping();
      render({ focus: false });
    }
  });

  // ── pedido ───────────────────────────────────────────────────────────────
  function buildOrder() {
    const { totals } = cart.getState();
    const ship = selectedShipping();
    return {
      customer: { name: form.name.trim(), email: form.email.trim(), phone: onlyDigits(form.phone), cpf: onlyDigits(form.cpf) },
      address: {
        cep: onlyDigits(form.cep), street: form.street.trim(), number: form.noNumber ? 's/n' : form.number.trim(),
        complement: form.complement.trim(), district: form.district.trim(), city: form.city.trim(), state: form.state,
      },
      shipping: { id: ship.id, name: ship.name, carrier: ship.carrier, price: ship.price },
      paymentMethod: form.paymentMethod,
      items: totals.lines.map((l) => ({
        productId: l.productId, name: getProduct(l.productId).name, qty: l.qty, unitPrice: l.unitPrice, bump: l.bump,
      })),
      totals: {
        subtotal: totals.subtotal, discountPercent: totals.discountPercent, discount: totals.discount,
        bumpTotal: totals.bumpTotal, shipping: ship.price, total: totals.total,
      },
      utm: getUtm(),
    };
  }

  async function submitOrder() {
    if (submitting) return;
    const { totals } = cart.getState();
    submitting = true;
    paymentError = '';
    render({ focus: false });

    track('AddPaymentInfo', {
      value: grandTotal() / 100,
      paymentMethod: form.paymentMethod,
      items: trackItems(totals.lines),
    });

    const result = await createOrder(buildOrder());
    submitting = false;
    if (!result.ok) {
      paymentError = result.message ?? 'Não foi possível finalizar o pedido. Tente novamente.';
      render({ focus: false });
      panel.querySelector('.notice--warn')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    order = { ...result.order, addressLine: addressLine(), shippingLabel: shippingLabel() };
    session.write('lastOrder', order);

    track('Purchase', {
      value: grandTotal() / 100,
      transactionId: order.id,
      demo: Boolean(order.demo),
      items: trackItems(totals.lines),
    });

    cart.clear();
    step = 5;
    maxStep = 5;
    history.replaceState({ checkoutStep: 5 }, '', location.href);
    render();
    window.scrollTo(0, 0);
  }

  // ── ciclo de vida ────────────────────────────────────────────────────────
  const onPop = () => {
    if (getPath() !== '/checkout') return;
    const target = isComplete() ? 5 : Math.min(history.state?.checkoutStep ?? 1, maxStep);
    if (target !== step) {
      step = target;
      errors = {};
      if (step === 3) loadShipping();
      render({ focus: false });
    }
  };
  window.addEventListener('popstate', onPop);
  const unsubscribe = cart.subscribe(() => {
    if (cartEmpty() && !order) render({ focus: false });
    else renderSummary();
  });

  // Dados de uma compra anterior: se o carrinho voltou a ter itens, o pedido antigo é descartado.
  if (order && !cartEmpty()) {
    order = null;
    session.remove('lastOrder');
  }

  // O checkout recomeça sempre da etapa 1 em uma nova visita; o histórico marca a etapa.
  history.replaceState({ checkoutStep: step }, '', location.href);
  render({ focus: false });

  if (!cartEmpty()) {
    const { totals } = cart.getState();
    track('InitiateCheckout', { value: totals.total / 100, items: trackItems(totals.lines) });
  }

  return () => {
    window.removeEventListener('popstate', onPop);
    unsubscribe();
  };
}
