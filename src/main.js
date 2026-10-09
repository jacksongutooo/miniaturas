/**
 * PONTO DE ENTRADA — monta a estrutura fixa da página (topo, cabeçalho, rodapé, camadas)
 * e inicia o router. O conteúdo de cada página é montado em <main> pelo router.
 */

import './styles/index.css';

import { html } from './utils/html.js';
import { captureUtm } from './utils/utm.js';
import { initAnalytics } from './services/analytics.js';
import { startActions } from './app/actions.js';
import { startOverlays } from './app/overlays.js';
import { startRouter } from './app/router.js';
import { registerHandlers } from './app/handlers.js';
import { topBar, headerMarkup, mountHeader } from './components/Header.js';
import { footerMarkup } from './components/Footer.js';
import { mountCartDrawer } from './components/CartDrawer.js';
import { mountCartBar } from './components/CartBar.js';
import { mountLightbox } from './components/Lightbox.js';
import { mountToast } from './components/Toast.js';
import { mountWhatsapp } from './components/WhatsappButton.js';

// Imagem que não existe (ex.: foto ainda não enviada) vira um espaço reservado neutro em vez de um ícone quebrado.
const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#efece8"/><g fill="none" stroke="#a8a29a" stroke-width="6" stroke-linejoin="round"><rect x="120" y="140" width="160" height="120" rx="18"/><circle cx="165" cy="183" r="12"/><path d="m130 250 45-40 30 26 25-20 40 34"/></g></svg>',
  );
document.addEventListener(
  'error',
  (e) => {
    const el = e.target;
    if (el?.tagName === 'IMG' && !el.dataset.fallback) {
      el.dataset.fallback = '1';
      el.src = FALLBACK_IMG;
    }
  },
  true,
);

function boot() {
  captureUtm();

  const app = document.getElementById('app');
  app.innerHTML = String(html`
    <button type="button" class="skip-link" data-action="skip-to-main">Pular para o conteúdo</button>
    ${topBar()}
    ${headerMarkup()}
    <main id="main" tabindex="-1"></main>
    ${footerMarkup()}
    <div id="overlays"></div>
  `);

  const overlays = document.getElementById('overlays');
  mountHeader(document.getElementById('site-header'));
  mountCartDrawer(overlays);
  mountCartBar(overlays);
  mountLightbox(overlays);
  mountToast(overlays);
  mountWhatsapp(overlays);

  registerHandlers();
  startActions();
  startOverlays();
  startRouter(document.getElementById('main'));

  // Pixels/analytics só depois que a página terminou de carregar (não atrasam a compra).
  const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500));
  window.addEventListener('load', () => idle(initAnalytics), { once: true });

  // Baixa o código do checkout em segundo plano para abrir instantaneamente.
  window.addEventListener('load', () => idle(() => import('./pages/CheckoutPage.js')), { once: true });
}

boot();
