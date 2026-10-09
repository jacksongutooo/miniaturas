/**
 * ROUTER (por hash: funciona em qualquer hospedagem estática, sem configurar servidor)
 *
 *   #/                         vitrine
 *   #/produto/<slug>           página do produto
 *   #/busca/<termo>            resultados da busca
 *   #/favoritos                favoritos
 *   #/checkout                 checkout
 *   #/pagina/<slug>            páginas institucionais
 *
 * Cada rota carrega um módulo de página (src/pages/*.js) cujo `default export` é
 *   (params) => ({ title, html, mount?(root) => cleanup?, layout? })
 */

import { storeConfig } from '../config/store.js';
import { dropOverlays } from './overlays.js';
// Vitrine e produto vão no pacote principal (primeira tela mais rápida); o resto carrega sob demanda.
import * as HomePage from '../pages/HomePage.js';
import * as ProductPage from '../pages/ProductPage.js';
import * as NotFoundPage from '../pages/NotFoundPage.js';

const routes = [
  { name: 'home', pattern: /^\/?$/, keys: [], load: () => HomePage },
  { name: 'product', pattern: /^\/produto\/([^/]+)$/, keys: ['slug'], load: () => ProductPage },
  { name: 'search', pattern: /^\/busca\/(.*)$/, keys: ['query'], load: () => import('../pages/SearchPage.js') },
  { name: 'favorites', pattern: /^\/favoritos$/, keys: [], load: () => import('../pages/FavoritesPage.js') },
  { name: 'checkout', pattern: /^\/checkout$/, keys: [], load: () => import('../pages/CheckoutPage.js') },
  { name: 'info', pattern: /^\/pagina\/([^/]+)$/, keys: ['slug'], load: () => import('../pages/InfoPage.js') },
];
const notFound = { name: 'notfound', load: () => NotFoundPage };

let outlet;
let cleanup = null;
let token = 0;
let currentPath = null;
let forceTop = false;
const scrollPositions = new Map();
const listeners = new Set();

export const onRouteChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getPath = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const path = hash.split('?')[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
};

export const navigate = (path) => {
  forceTop = true;
  if (window.location.hash === `#${path}`) resolve();
  else window.location.hash = path;
};

export const hrefFor = {
  home: () => '#/',
  product: (slug) => `#/produto/${slug}`,
  search: (q) => `#/busca/${encodeURIComponent(q)}`,
  page: (slug) => `#/pagina/${slug}`,
  checkout: () => '#/checkout',
  favorites: () => '#/favoritos',
};

function match(path) {
  for (const route of routes) {
    const m = route.pattern.exec(path);
    if (m) {
      const params = {};
      route.keys.forEach((key, i) => {
        try {
          params[key] = decodeURIComponent(m[i + 1]);
        } catch {
          params[key] = m[i + 1];
        }
      });
      return { route, params };
    }
  }
  return { route: notFound, params: {} };
}

async function resolve() {
  const myToken = ++token;
  const path = getPath();

  if (currentPath != null) scrollPositions.set(currentPath, window.scrollY);
  const restore = forceTop ? null : scrollPositions.get(path);
  forceTop = false;

  const { route, params } = match(path);
  let page;
  try {
    page = (await route.load()).default;
  } catch (err) {
    console.error('Falha ao carregar a página', err);
    outlet.innerHTML = '<p class="container" style="padding:48px 0">Não foi possível carregar esta página. Verifique sua conexão e recarregue.</p>';
    return;
  }
  if (myToken !== token) return; // outra navegação começou enquanto carregava

  dropOverlays();
  cleanup?.();
  cleanup = null;

  const view = page(params);
  currentPath = path;
  outlet.innerHTML = String(view.html);
  document.title = view.title ? `${view.title} | ${storeConfig.name}` : `${storeConfig.name} | ${storeConfig.seo.titleSuffix}`;
  document.body.dataset.route = route.name;
  document.body.dataset.layout = view.layout ?? 'default';

  window.scrollTo(0, restore ?? 0);
  cleanup = view.mount?.(outlet) ?? null;
  listeners.forEach((fn) => fn({ name: route.name, params, path }));
}

export function startRouter(outletEl) {
  outlet = outletEl;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Cliques em links internos (#/...) sempre abrem no topo; voltar/avançar restauram o scroll.
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest?.('a[href^="#/"]');
      if (a && !e.defaultPrevented) forceTop = true;
    },
    true,
  );

  window.addEventListener('hashchange', resolve);
  return resolve();
}
