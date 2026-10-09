/**
 * ANALYTICS — eventos internos da loja + adaptadores para pixels.
 * ----------------------------------------------------------------------------
 * Uso no código da loja:   track('AddToCart', { ... })
 *
 * Eventos: ViewContent · AddToCart · InitiateCheckout · AddPaymentInfo · Purchase
 *
 * Para cada evento este módulo:
 *   1. dispara  window "store:track"  (CustomEvent) — para qualquer script seu escutar;
 *   2. faz push em window.dataLayer   — Google Tag Manager;
 *   3. chama fbq / gtag               — apenas se o pixel correspondente foi configurado
 *                                       (src/config/analytics.js).
 * Sem IDs configurados, nada externo é carregado e nenhum dado sai do navegador.
 */

import { analyticsConfig as cfg } from '../config/analytics.js';
import { storeConfig } from '../config/store.js';

const CURRENCY = storeConfig.currency;

/** Mapa evento interno → nomes no Meta Pixel e no GA4. */
const MAP = {
  ViewContent: { meta: 'ViewContent', ga4: 'view_item' },
  AddToCart: { meta: 'AddToCart', ga4: 'add_to_cart' },
  InitiateCheckout: { meta: 'InitiateCheckout', ga4: 'begin_checkout' },
  AddPaymentInfo: { meta: 'AddPaymentInfo', ga4: 'add_payment_info' },
  Purchase: { meta: 'Purchase', ga4: 'purchase' },
};

let initialized = false;

function loadScript({ src, async = true, attrs = {} }) {
  const el = document.createElement('script');
  el.src = src;
  el.async = async;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.head.appendChild(el);
}

function initMetaPixel(id) {
  if (window.fbq) return;
  const fbq = function (...args) {
    fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
  };
  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  loadScript({ src: 'https://connect.facebook.net/en_US/fbevents.js' });
  fbq('init', id);
  fbq('track', 'PageView');
}

function initGa4(id) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  window.gtag('js', new Date());
  window.gtag('config', id);
  loadScript({ src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}` });
}

function initGtm(id) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  loadScript({ src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}` });
}

function initUtmify(id) {
  // Confira no painel da UTMify se o snippet atual continua igual a este.
  window.pixelId = id;
  loadScript({ src: 'https://cdn.utmify.com.br/scripts/pixel/pixel.js', attrs: { defer: '' } });
}

/** Carrega os pixels configurados. Chamado uma vez, depois que a página carregou. */
export function initAnalytics() {
  if (initialized) return;
  initialized = true;
  if (cfg.metaPixelId) initMetaPixel(cfg.metaPixelId);
  if (cfg.ga4MeasurementId) initGa4(cfg.ga4MeasurementId);
  if (cfg.gtmContainerId) initGtm(cfg.gtmContainerId);
  if (cfg.utmifyPixelId) initUtmify(cfg.utmifyPixelId);
  (cfg.customScripts ?? []).forEach(loadScript);
}

const eventId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** Formata itens para os pixels. items: [{ id, name, price (reais), quantity }] */
function toGa4Items(items = []) {
  return items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity ?? 1 }));
}

/**
 * Dispara um evento.
 * @param {keyof MAP} name
 * @param {{ value?:number, items?:Array, transactionId?:string, demo?:boolean, [k:string]:any }} data
 *        value em REAIS (ex.: 61.23)
 */
export function track(name, data = {}) {
  const map = MAP[name];
  if (!map) return;

  // Pedidos de demonstração (gateway ainda não configurado) nunca contam como compra real.
  if (name === 'Purchase' && data.demo) {
    if (cfg.debug) console.info('[analytics] Purchase ignorado (modo demonstração)', data);
    return;
  }

  const id = eventId();
  const items = data.items ?? [];
  const payload = { event_id: id, currency: CURRENCY, ...data };
  if (cfg.debug) console.info('[analytics]', name, payload);

  try {
    window.dispatchEvent(new CustomEvent('store:track', { detail: { name, ...payload } }));

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: map.ga4,
      ecommerce: {
        currency: CURRENCY,
        value: data.value,
        transaction_id: data.transactionId,
        items: toGa4Items(items),
      },
    });

    if (typeof window.fbq === 'function') {
      window.fbq(
        'track',
        map.meta,
        {
          content_type: 'product',
          content_ids: items.map((i) => String(i.id)),
          content_name: items.length === 1 ? items[0].name : undefined,
          contents: items.map((i) => ({ id: String(i.id), quantity: i.quantity ?? 1, item_price: i.price })),
          num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
          value: data.value,
          currency: CURRENCY,
        },
        { eventID: id },
      );
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', map.ga4, {
        currency: CURRENCY,
        value: data.value,
        transaction_id: data.transactionId,
        items: toGa4Items(items),
      });
    }
  } catch (err) {
    // Analytics nunca pode quebrar a compra.
    if (cfg.debug) console.warn('[analytics] erro', err);
  }
}
