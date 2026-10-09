import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';

let el;
let timer;

export function mountToast(container) {
  el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.hidden = true;
  container.appendChild(el);
}

/**
 * Mensagem rápida na parte de baixo da tela.
 * @param {string} message
 * @param {{ actionLabel?:string, action?:string, tone?:'default'|'success', duration?:number }} opts
 *        action: nome de uma data-action (ex.: 'open-cart')
 */
export function showToast(message, { actionLabel, action, tone = 'default', duration = 3200 } = {}) {
  if (!el) return;
  clearTimeout(timer);
  el.className = `toast toast--${tone}`;
  el.innerHTML = String(html`
    ${tone === 'success' ? icon('check', { size: 18, class: 'toast__icon' }) : ''}
    <span class="toast__msg">${message}</span>
    ${actionLabel ? html`<button type="button" class="toast__action" data-action="${action}">${actionLabel}</button>` : ''}
  `);
  el.hidden = false;
  // força o navegador a aplicar o estado inicial antes da transição
  void el.offsetWidth;
  el.classList.add('is-visible');
  timer = setTimeout(hideToast, duration);
}

export function hideToast() {
  if (!el) return;
  el.classList.remove('is-visible');
  clearTimeout(timer);
  timer = setTimeout(() => {
    el.hidden = true;
  }, 200);
}
