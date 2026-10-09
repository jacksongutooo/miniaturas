/**
 * Seções de conteúdo da página inicial. Os textos vêm de src/config/content.js.
 */

import { storeConfig } from '../config/store.js';
import { content } from '../config/content.js';
import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { customerPhotos } from '../products/data/gallery.js';
import { moneyFromReais } from '../utils/format.js';
import { img } from './primitives.js';

/** "Detalhes que fazem a diferença" */
export function highlightsSection() {
  const { title, items } = content.highlights;
  return html`<section class="section" aria-labelledby="highlights-title">
    <div class="container">
      <h2 class="section__title" id="highlights-title">${title}</h2>
      <ul class="highlights">
        ${items.map(
          (item) => html`<li class="highlight">
            <span class="highlight__icon">${icon(item.icon, { size: 22 })}</span>
            <div>
              <h3 class="highlight__title">${item.title}</h3>
              ${item.text ? html`<p class="highlight__text">${item.text}</p>` : ''}
            </div>
          </li>`,
        )}
      </ul>
    </div>
  </section>`;
}

/** "Veja como elas ficam" — fotos de clientes (carrossel no celular, grade no desktop). */
export function customerGallerySection() {
  const { title, subtitle } = content.customerGallery;
  if (customerPhotos.length === 0) return html``;
  return html`<section class="section section--soft" aria-labelledby="gallery-title">
    <div class="container">
      <div class="section__head">
        <h2 class="section__title" id="gallery-title">${title}</h2>
        ${subtitle ? html`<p class="section__sub">${subtitle}</p>` : ''}
      </div>
    </div>
    <ul class="photo-rail" tabindex="0" aria-label="${title}">
      ${customerPhotos.map(
        (photo, i) => html`<li class="photo-rail__item">
          <button type="button" class="photo-rail__btn" data-action="open-lightbox" data-group="clientes" data-src="${photo.src}" data-alt="${photo.alt}" aria-label="Ampliar foto ${i + 1}: ${photo.alt}">
            ${img({ src: photo.src, alt: photo.alt, width: 400, height: 400 })}
          </button>
        </li>`,
      )}
    </ul>
  </section>`;
}

/** "Uma lembrança especial para presentear" */
export function giftSection() {
  const g = content.gift;
  return html`<section class="section" aria-labelledby="gift-title">
    <div class="container">
      <div class="feature">
        <div class="feature__media">${img({ src: g.image, alt: g.imageAlt, width: 900, height: 675 })}</div>
        <div class="feature__body">
          <h2 class="section__title" id="gift-title">${g.title}</h2>
          <p class="feature__text">${g.text}</p>
          <ul class="pills" aria-label="Ocasiões">
            ${g.occasions.map((o) => html`<li>${o}</li>`)}
          </ul>
          <button type="button" class="btn btn--primary" data-action="browse">${icon('gift', { size: 18 })} ${g.cta}</button>
        </div>
      </div>
    </div>
  </section>`;
}

/** "Embalagem e envio" — valores configuráveis em storeConfig.shipping.info */
export function packagingSection() {
  const p = content.packaging;
  const { info, freeShipping } = storeConfig.shipping;
  const rows = [
    ['handlingTime', 'box', info.handlingTime],
    ['carrier', 'truck', info.carrier],
    ['deliveryTime', 'mapPin', info.deliveryTime],
    ['tracking', 'route', info.tracking],
    // Só aparece quando a política de frete grátis for ligada na config.
    ['freeShipping', 'tag', freeShipping.enabled && freeShipping.minOrderValue != null ? `Em pedidos a partir de ${moneyFromReais(freeShipping.minOrderValue)}` : ''],
  ].filter(([, , value]) => value);

  return html`<section class="section section--soft" aria-labelledby="packaging-title">
    <div class="container">
      <div class="feature feature--reverse">
        <div class="feature__media">${img({ src: p.image, alt: p.imageAlt, width: 900, height: 675 })}</div>
        <div class="feature__body">
          <h2 class="section__title" id="packaging-title">${p.title}</h2>
          <p class="feature__text">${p.text}</p>
          <dl class="facts">
            ${rows.map(
              ([key, ic, value]) => html`<div class="facts__row">
                <dt>${icon(ic, { size: 18 })} ${p.labels[key]}</dt>
                <dd>${value}</dd>
              </div>`,
            )}
          </dl>
        </div>
      </div>
    </div>
  </section>`;
}

/** Faixa de confiança antes do rodapé. */
export function trustSection() {
  return html`<section class="trust" aria-label="Informações de compra">
    <ul class="container trust__list">
      ${content.trust.map(
        (t) => html`<li class="trust__item">
          <span class="trust__icon">${icon(t.icon, { size: 22 })}</span>
          <div>
            <h3 class="trust__title">${t.title}</h3>
            ${t.text ? html`<p class="trust__text">${t.text}</p>` : ''}
          </div>
        </li>`,
      )}
    </ul>
  </section>`;
}
