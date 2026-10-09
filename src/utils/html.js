/**
 * Template HTML com ESCAPE AUTOMÁTICO.
 *
 *   html`<h2>${product.name}</h2>`           → o nome é escapado (seguro contra XSS)
 *   html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`   → listas e sub-templates passam direto
 *   raw('<b>ok</b>')                          → insere HTML já confiável sem escapar
 *
 * O resultado é um objeto SafeHtml; use String(resultado) ou mount() para inserir no DOM.
 */

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const raw = (value) => new SafeHtml(String(value ?? ''));

function render(value) {
  if (value == null || value === false || value === true) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

/** Atribui HTML a um elemento. */
export function setHtml(el, content) {
  el.innerHTML = String(content);
}
