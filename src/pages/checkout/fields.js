/**
 * Campos de formulário do checkout (marcação acessível + rótulo + erro inline).
 */

import { html } from '../../utils/html.js';

/**
 * @param {{ name:string, label:string, value?:string, type?:string, autocomplete?:string,
 *           inputmode?:string, placeholder?:string, error?:string, optional?:boolean,
 *           maxlength?:number, mask?:string, hint?:string, enterkeyhint?:string, className?:string }} f
 */
export function field(f) {
  const id = `f-${f.name}`;
  const errId = `${id}-error`;
  return html`<div class="field${f.error ? ' has-error' : ''}${f.className ? ` ${f.className}` : ''}">
    <label class="field__label" for="${id}">${f.label}${f.optional ? html` <span class="field__optional">(opcional)</span>` : ''}</label>
    <input class="field__input" id="${id}" name="${f.name}" type="${f.type ?? 'text'}" value="${f.value ?? ''}"
      ${f.autocomplete ? html`autocomplete="${f.autocomplete}"` : ''}
      ${f.inputmode ? html`inputmode="${f.inputmode}"` : ''}
      ${f.placeholder ? html`placeholder="${f.placeholder}"` : ''}
      ${f.maxlength ? html`maxlength="${f.maxlength}"` : ''}
      ${f.mask ? html`data-mask="${f.mask}"` : ''}
      enterkeyhint="${f.enterkeyhint ?? 'next'}"
      ${f.error ? html`aria-invalid="true" aria-describedby="${errId}"` : ''} />
    ${f.error ? html`<p class="field__error" id="${errId}" role="alert">${f.error}</p>` : f.hint ? html`<p class="field__hint">${f.hint}</p>` : ''}
  </div>`;
}

/** <select> com a mesma aparência dos campos de texto. */
export function selectField({ name, label, value, options, error, autocomplete, placeholder = 'Selecione' }) {
  const id = `f-${name}`;
  const errId = `${id}-error`;
  return html`<div class="field${error ? ' has-error' : ''}">
    <label class="field__label" for="${id}">${label}</label>
    <select class="field__input field__select" id="${id}" name="${name}" ${autocomplete ? html`autocomplete="${autocomplete}"` : ''} ${error ? html`aria-invalid="true" aria-describedby="${errId}"` : ''}>
      <option value="">${placeholder}</option>
      ${options.map(([val, text]) => html`<option value="${val}" ${val === value ? 'selected' : ''}>${text}</option>`)}
    </select>
    ${error ? html`<p class="field__error" id="${errId}" role="alert">${error}</p>` : ''}
  </div>`;
}

/** Cartão selecionável (frete, forma de pagamento). */
export function choiceCard({ name, value, checked, title, subtitle, aside, icon: iconHtml }) {
  return html`<label class="choice${checked ? ' is-checked' : ''}">
    <input class="choice__input" type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''} />
    <span class="choice__mark" aria-hidden="true"></span>
    ${iconHtml ? html`<span class="choice__icon">${iconHtml}</span>` : ''}
    <span class="choice__text">
      <span class="choice__title">${title}</span>
      ${subtitle ? html`<span class="choice__sub">${subtitle}</span>` : ''}
    </span>
    ${aside ? html`<span class="choice__aside">${aside}</span>` : ''}
  </label>`;
}
