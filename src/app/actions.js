/**
 * DELEGAÇÃO DE EVENTOS
 * ----------------------------------------------------------------------------
 * Os componentes só escrevem HTML com  data-action="nome"  (e data-* de parâmetros).
 * Os handlers são registrados aqui com on('nome', (el, event) => ...), uma única
 * vez — assim o HTML pode ser re-renderizado à vontade sem perder ouvintes.
 */

const clickHandlers = new Map();
const inputHandlers = new Map();
const submitHandlers = new Map();

export const on = (name, fn) => clickHandlers.set(name, fn);
/** Para campos: data-input="nome" (dispara em "input"). */
export const onInput = (name, fn) => inputHandlers.set(name, fn);
/** Para formulários: data-submit="nome". */
export const onSubmit = (name, fn) => submitHandlers.set(name, fn);

export function startActions() {
  document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    const handler = clickHandlers.get(el.dataset.action);
    if (!handler) return;
    if (el.tagName === 'A') event.preventDefault();
    handler(el, event);
  });

  document.addEventListener('input', (event) => {
    const el = event.target.closest('[data-input]');
    if (el) inputHandlers.get(el.dataset.input)?.(el, event);
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-submit]');
    if (!form) return;
    event.preventDefault();
    submitHandlers.get(form.dataset.submit)?.(form, event);
  });
}
