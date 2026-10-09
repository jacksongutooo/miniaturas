/**
 * MARCAÇÃO DE CADA ETAPA DO CHECKOUT
 *   1 Dados pessoais · 2 Endereço · 3 Entrega · 4 Pagamento · 5 Confirmação
 */

import { storeConfig } from '../../config/store.js';
import { html } from '../../utils/html.js';
import { icon } from '../../utils/icons.js';
import { money } from '../../utils/format.js';
import { STATES } from '../../utils/validators.js';
import { deliveryLabel } from '../../services/shipping.js';
import { isDemoPayment } from '../../services/payment.js';
import { hrefFor } from '../../app/router.js';
import { whatsappLink } from '../../components/WhatsappButton.js';
import { field, selectField, choiceCard } from './fields.js';

export const STEPS = [
  { id: 1, label: 'Dados' },
  { id: 2, label: 'Endereço' },
  { id: 3, label: 'Entrega' },
  { id: 4, label: 'Pagamento' },
  { id: 5, label: 'Confirmação' },
];

/** Indicador de etapas (barra compacta no celular, lista com rótulos no desktop). */
export function stepNav(current, maxReached) {
  const total = STEPS.length;
  const label = STEPS[current - 1].label;
  return html`<nav class="steps-nav" aria-label="Etapas do pedido">
    <p class="steps-nav__mobile"><span>Etapa ${current} de ${total}</span> <strong>${label}</strong></p>
    <ol class="steps-nav__list">
      ${STEPS.map((s) => {
        const state = s.id === current ? 'is-current' : s.id < current ? 'is-done' : '';
        const clickable = s.id < current && current < 5;
        return html`<li class="steps-nav__item ${state}" ${s.id === current ? 'aria-current="step"' : ''}>
          ${clickable
            ? html`<button type="button" class="steps-nav__btn" data-goto-step="${s.id}"><span class="steps-nav__dot">${icon('check', { size: 14 })}</span><span class="steps-nav__label">${s.label}</span></button>`
            : html`<span class="steps-nav__btn"><span class="steps-nav__dot">${s.id < current ? icon('check', { size: 14 }) : s.id}</span><span class="steps-nav__label">${s.label}</span></span>`}
        </li>`;
      })}
    </ol>
    <div class="steps-nav__bar" aria-hidden="true"><span style="width:${(current / total) * 100}%"></span></div>
  </nav>`;
}

export function personalStep(f, e = {}) {
  return html`<form class="step-form" data-step-form="1" novalidate>
    <h2 class="step__title">Seus dados</h2>
    <p class="step__sub">Precisamos destes dados para emitir e entregar o seu pedido.</p>
    ${field({ name: 'name', label: 'Nome completo', value: f.name, autocomplete: 'name', error: e.name, placeholder: 'Maria da Silva' })}
    ${field({ name: 'email', label: 'E-mail', type: 'email', value: f.email, autocomplete: 'email', inputmode: 'email', error: e.email, placeholder: 'nome@email.com' })}
    ${field({ name: 'phone', label: 'Telefone / WhatsApp', type: 'tel', value: f.phone, autocomplete: 'tel-national', inputmode: 'tel', mask: 'phone', maxlength: 15, error: e.phone, placeholder: '(11) 91234-5678' })}
    ${storeConfig.checkout.requireCpf
      ? field({ name: 'cpf', label: 'CPF', value: f.cpf, inputmode: 'numeric', mask: 'cpf', maxlength: 14, error: e.cpf, placeholder: '000.000.000-00', hint: 'Exigido para emitir o pagamento.', enterkeyhint: 'done' })
      : ''}
    <button type="submit" class="btn btn--primary btn--lg btn--block">Continuar</button>
  </form>`;
}

/** Mensagem sob o campo CEP: buscando / encontrado / não encontrado. */
export function cepStatus(state) {
  if (state === 'loading') return html`<p class="field__hint field__hint--status">Buscando endereço…</p>`;
  if (state === 'notfound') return html`<p class="field__hint field__hint--status">Não encontramos este CEP. Preencha o endereço abaixo.</p>`;
  if (state === 'found') return html`<p class="field__hint field__hint--ok">${icon('check', { size: 14 })} Endereço encontrado. Confira e informe o número.</p>`;
  return html``;
}

export function addressStep(f, e = {}, { lookup = 'idle' } = {}) {
  return html`<form class="step-form" data-step-form="2" novalidate>
    <h2 class="step__title">Endereço de entrega</h2>
    <div class="field-group">
      ${field({ name: 'cep', label: 'CEP', value: f.cep, autocomplete: 'postal-code', inputmode: 'numeric', mask: 'cep', maxlength: 9, error: e.cep, placeholder: '00000-000' })}
      <div data-cep-status aria-live="polite">${cepStatus(lookup)}</div>
      <a class="link-small" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer">Não sei meu CEP</a>
    </div>
    ${field({ name: 'street', label: 'Rua / Avenida', value: f.street, autocomplete: 'address-line1', error: e.street })}
    <div class="field-row">
      ${field({ name: 'number', label: 'Número', value: f.noNumber ? '' : f.number, inputmode: 'numeric', autocomplete: 'off', error: e.number, className: f.noNumber ? 'is-disabled' : '' })}
      ${field({ name: 'complement', label: 'Complemento', value: f.complement, autocomplete: 'address-line2', optional: true, placeholder: 'Apto, bloco...' })}
    </div>
    <label class="check"><input type="checkbox" name="noNumber" ${f.noNumber ? 'checked' : ''} /> <span>Sem número</span></label>
    ${field({ name: 'district', label: 'Bairro', value: f.district, autocomplete: 'address-level3', error: e.district })}
    <div class="field-row field-row--city">
      ${field({ name: 'city', label: 'Cidade', value: f.city, autocomplete: 'address-level2', error: e.city })}
      ${selectField({ name: 'state', label: 'Estado', value: f.state, options: STATES.map(([uf]) => [uf, uf]), error: e.state, autocomplete: 'address-level1', placeholder: 'UF' })}
    </div>
    <button type="submit" class="btn btn--primary btn--lg btn--block">Continuar</button>
  </form>`;
}

/** options: null = carregando · [] = nenhuma · array = opções */
export function shippingStep(f, e = {}, options = null, { failed = false } = {}) {
  let list;
  if (failed) {
    list = html`<p class="notice notice--warn">Não foi possível calcular o frete agora. <button type="button" class="link-btn" data-retry-shipping>Tentar novamente</button></p>`;
  } else if (options === null) {
    list = html`<div class="skeleton skeleton--choice"></div><div class="skeleton skeleton--choice"></div>`;
  } else {
    list = html`<div class="choices" role="radiogroup" aria-label="Forma de entrega">
      ${options.map((o) =>
        choiceCard({
          name: 'shippingId',
          value: o.id,
          checked: f.shippingId === o.id,
          icon: icon('truck', { size: 22 }),
          title: o.name,
          subtitle: [o.carrier, deliveryLabel(o)].filter(Boolean).join(' • '),
          aside: o.free ? html`<strong class="text-success">Grátis</strong>` : html`<strong>${money(o.price)}</strong>`,
        }),
      )}
    </div>`;
  }
  return html`<form class="step-form" data-step-form="3" novalidate>
    <h2 class="step__title">Entrega</h2>
    <p class="step__sub">Escolha como quer receber o seu pedido.</p>
    ${list}
    ${e.shippingId ? html`<p class="field__error" role="alert">${e.shippingId}</p>` : ''}
    <button type="submit" class="btn btn--primary btn--lg btn--block" ${options === null || failed ? 'disabled' : ''}>Continuar</button>
  </form>`;
}

const METHOD_ICON = { pix: 'pix', card: 'creditCard', boleto: 'tag' };

export function paymentStep(f, e = {}, { grandTotal, addressLine, shippingLabel, submitting = false, errorMessage = '' }) {
  const methods = storeConfig.checkout.paymentMethods;
  const selected = methods.find((m) => m.id === f.paymentMethod);

  return html`<form class="step-form" data-step-form="4" novalidate>
    <h2 class="step__title">Pagamento</h2>

    ${isDemoPayment()
      ? html`<p class="notice notice--info">${icon('info', { size: 18 })}<span><strong>Modo demonstração:</strong> nenhum pagamento real é processado e nenhuma cobrança é feita. (O gateway ainda será configurado em <code>src/services/payment.js</code>.)</span></p>`
      : ''}

    <div class="choices" role="radiogroup" aria-label="Forma de pagamento">
      ${methods.map((m) =>
        choiceCard({
          name: 'paymentMethod',
          value: m.id,
          checked: f.paymentMethod === m.id,
          icon: icon(METHOD_ICON[m.id] ?? 'creditCard', { size: 22 }),
          title: m.label,
        }),
      )}
    </div>
    ${e.paymentMethod ? html`<p class="field__error" role="alert">${e.paymentMethod}</p>` : ''}
    ${selected?.description ? html`<p class="payment-note">${selected.description}</p>` : ''}

    <div class="recap">
      <div class="recap__row">
        <div><span class="recap__label">Entrega em</span><p>${addressLine}</p></div>
        <button type="button" class="link-btn" data-goto-step="2">Alterar</button>
      </div>
      <div class="recap__row">
        <div><span class="recap__label">Frete</span><p>${shippingLabel}</p></div>
        <button type="button" class="link-btn" data-goto-step="3">Alterar</button>
      </div>
    </div>

    ${errorMessage ? html`<p class="notice notice--warn" role="alert">${errorMessage}</p>` : ''}

    <button type="submit" class="btn btn--primary btn--lg btn--block" ${submitting ? 'disabled aria-busy="true"' : ''}>
      ${submitting ? html`<span class="spinner" aria-hidden="true"></span> Processando…` : html`Finalizar pedido • ${money(grandTotal)}`}
    </button>
    <p class="fine">
      Ao finalizar, você concorda com os <a href="${hrefFor.page('termos-de-uso')}">Termos de uso</a> e a
      <a href="${hrefFor.page('politica-de-privacidade')}">Política de privacidade</a>.
    </p>
  </form>`;
}

export function confirmationStep(order) {
  const wa = whatsappLink(`Olá! Tenho uma dúvida sobre o pedido ${order.id}.`);
  const method = storeConfig.checkout.paymentMethods.find((m) => m.id === order.paymentMethod);
  return html`<section class="confirmation" aria-live="polite">
    <span class="confirmation__icon">${icon('check', { size: 34 })}</span>
    <h2 class="step__title">${order.demo ? 'Pedido de demonstração criado' : 'Pedido recebido!'}</h2>
    <p class="confirmation__id">Pedido <strong>${order.id}</strong></p>
    ${order.demo
      ? html`<p class="notice notice--info">${icon('info', { size: 18 })}<span>Este foi um teste do fluxo de compra: <strong>nenhum pagamento foi processado</strong> e nenhum pedido real foi gerado.</span></p>`
      : ''}
    ${order.payment?.pixCode
      ? html`<div class="pix"><p class="step__sub">Pague com Pix copiando o código abaixo:</p><textarea readonly class="pix__code" rows="3">${order.payment.pixCode}</textarea></div>`
      : ''}
    ${order.payment?.redirectUrl
      ? html`<a class="btn btn--primary btn--lg btn--block" href="${order.payment.redirectUrl}">Ir para o pagamento</a>`
      : ''}

    <dl class="confirmation__facts">
      <div><dt>Cliente</dt><dd>${order.customer.name}</dd></div>
      <div><dt>E-mail</dt><dd>${order.customer.email}</dd></div>
      <div><dt>Entrega</dt><dd>${order.addressLine}</dd></div>
      <div><dt>Frete</dt><dd>${order.shippingLabel}</dd></div>
      ${method ? html`<div><dt>Pagamento</dt><dd>${method.label}</dd></div>` : ''}
      <div><dt>Total</dt><dd><strong>${money(order.totals.total + order.totals.shipping)}</strong></dd></div>
    </dl>

    <div class="confirmation__actions">
      <a class="btn btn--primary btn--lg btn--block" href="${hrefFor.home()}">Voltar à loja</a>
      ${wa ? html`<a class="btn btn--ghost btn--block" href="${wa}" target="_blank" rel="noopener noreferrer">${icon('whatsapp', { size: 18 })} Falar com o atendimento</a>` : ''}
    </div>
  </section>`;
}
