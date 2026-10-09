import { storeConfig } from '../config/store.js';
import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { onlyDigits } from '../utils/validators.js';

/** Link do WhatsApp com a mensagem automática (ou null se o número ainda não foi configurado). */
export function whatsappLink(message = storeConfig.whatsapp.message) {
  const number = onlyDigits(storeConfig.whatsapp.number);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

export function mountWhatsapp(container) {
  const { enabled } = storeConfig.whatsapp;
  if (!enabled) return;
  const link = whatsappLink();
  const el = document.createElement('div');
  el.className = 'whatsapp';
  el.innerHTML = String(
    link
      ? html`<a class="whatsapp__btn" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="Falar com o atendimento pelo WhatsApp">
          ${icon('whatsapp', { size: 26 })}<span class="whatsapp__label">Atendimento</span>
        </a>`
      : // TODO: adicionar WhatsApp (storeConfig.whatsapp.number). Até lá o botão só avisa.
        html`<button type="button" class="whatsapp__btn" data-action="whatsapp-unset" aria-label="Falar com o atendimento pelo WhatsApp">
          ${icon('whatsapp', { size: 26 })}<span class="whatsapp__label">Atendimento</span>
        </button>`,
  );
  container.appendChild(el);
}
