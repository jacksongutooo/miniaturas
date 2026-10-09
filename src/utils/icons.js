/**
 * Ícones SVG inline (traço, 24×24) — sem biblioteca externa, sem requisição extra.
 * Uso: icon('cart')  ou  icon('cart', { size: 20, class: 'minha-classe' })
 */

import { raw } from './html.js';

const paths = {
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h2.7l2.2 11.1a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2l1.4-6.6H6.1"/>',
  heart: '<path d="M12 20.3s-7.8-4.6-9.2-9.6C1.7 7 4 4.2 7 4.2c2 0 3.7 1.1 5 2.9 1.3-1.8 3-2.9 5-2.9 3 0 5.3 2.8 4.2 6.5-1.4 5-9.2 9.6-9.2 9.6z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.2a1.8 1.8 0 0 0 1.8 1.6h6.4a1.8 1.8 0 0 0 1.8-1.6L18 7M9 7V4.6A.6.6 0 0 1 9.6 4h4.8a.6.6 0 0 1 .6.6V7"/>',
  chevronLeft: '<path d="m15 5-7 7 7 7"/>',
  chevronRight: '<path d="m9 5 7 7-7 7"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  shield: '<path d="M12 3 4.5 6v5.6c0 4.4 3.1 7.7 7.5 9.4 4.4-1.7 7.5-5 7.5-9.4V6L12 3z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
  truck: '<path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4.2l3.3 3.4V16h-7.5"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>',
  box: '<path d="m3.5 7.5 8.5-4.5 8.5 4.5v9L12 21l-8.5-4.5z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
  gift: '<rect x="3.5" y="9" width="17" height="4" rx="1"/><path d="M5 13v7.5h14V13M12 9v11.5M12 9c-1.2-3.6-5-4.8-5-2.4C7 8 9 9 12 9zm0 0c1.2-3.6 5-4.8 5-2.4C17 8 15 9 12 9z"/>',
  sparkle: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/>',
  layers: '<path d="m12 3.5 9 4.8-9 4.8-9-4.8z"/><path d="m3 12.4 9 4.8 9-4.8M3 16.4l9 4.8 9-4.8"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.3"/><circle cx="17" cy="17" r="2.3"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13.5" width="4" height="6" rx="1.6"/><rect x="17" y="13.5" width="4" height="6" rx="1.6"/><path d="M19 19.5c0 1.4-1.8 2-4.5 2"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.4"/><circle cx="9" cy="10" r="1.8"/><path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4"/>',
  zoom: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>',
  tag: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7a1 1 0 0 1 .7.3l7.6 7.6a1 1 0 0 1 0 1.4l-7.7 7.7a1 1 0 0 1-1.4 0l-7.6-7.6a1 1 0 0 1-.3-.7z"/><circle cx="8.3" cy="8.3" r="1.3"/>',
  creditCard: '<rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="M3 10h18M7 15h3"/>',
  pix: '<path d="m12 3.2 3.3 3.3a2.2 2.2 0 0 0 3.1 0l.1-.1M12 20.8l3.3-3.3a2.2 2.2 0 0 1 3.1 0l.1.1M12 3.2 8.7 6.5a2.2 2.2 0 0 1-3.1 0l-.1-.1M12 20.8l-3.3-3.3a2.2 2.2 0 0 0-3.1 0l-.1.1M3.2 12l2.3-2.3a1.2 1.2 0 0 1 1.7 0l3.2 3.2a1.2 1.2 0 0 0 1.7 0l3.2-3.2a1.2 1.2 0 0 1 1.7 0L20.8 12l-2.3 2.3a1.2 1.2 0 0 1-1.7 0l-3.2-3.2a1.2 1.2 0 0 0-1.7 0l-3.2 3.2a1.2 1.2 0 0 1-1.7 0z"/>',
  mapPin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.7-3.6 3.6-5.5 7.5-5.5s6.8 1.9 7.5 5.5"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6A2 2 0 0 0 13.5 4H6A2 2 0 0 0 4 6v7.5a2 2 0 0 0 2 2h2.5"/>',
};

// Estrela e WhatsApp usam preenchimento (não traço).
const filled = {
  whatsapp:
    '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.84 9.84 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/>',
  star: '<path d="m12 2.8 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.6 3.1 1.2-6.3L3 9.4l6.3-.8z"/>',
  heartFilled:
    '<path d="M12 20.3s-7.8-4.6-9.2-9.6C1.7 7 4 4.2 7 4.2c2 0 3.7 1.1 5 2.9 1.3-1.8 3-2.9 5-2.9 3 0 5.3 2.8 4.2 6.5-1.4 5-9.2 9.6-9.2 9.6z"/>',
};

/** Retorna o SVG como SafeHtml (pode ser usado direto dentro de html`...`). */
export function icon(name, { size = 20, class: className = '', label = '' } = {}) {
  const cls = `icon${className ? ` ${className}` : ''}`;
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  if (filled[name]) {
    return raw(
      `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="${name === 'heartFilled' ? 'currentColor' : 'none'}" stroke-width="1.5" stroke-linejoin="round" ${a11y}>${filled[name]}</svg>`,
    );
  }
  const body = paths[name];
  if (!body) return raw('');
  return raw(
    `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${body}</svg>`,
  );
}
