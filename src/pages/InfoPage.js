/**
 * Páginas institucionais (privacidade, termos, trocas, envio, contato).
 * Conteúdo em src/config/pages.js.
 */

import { storeConfig } from '../config/store.js';
import { pages } from '../config/pages.js';
import { html } from '../utils/html.js';
import { hrefFor } from '../app/router.js';
import NotFoundPage from './NotFoundPage.js';
import { whatsappLink } from '../components/WhatsappButton.js';

const fill = (text) => text.replaceAll('{storeName}', storeConfig.name);

export default function InfoPage({ slug }) {
  const page = pages[slug];
  if (!page) return NotFoundPage();

  const wa = slug === 'contato' ? whatsappLink() : null;
  return {
    title: page.title,
    html: html`<section class="section">
      <div class="container container--narrow">
        <nav class="breadcrumb" aria-label="Você está em"><a href="${hrefFor.home()}">Início</a><span aria-hidden="true">/</span><span>${page.title}</span></nav>
        <article class="prose">
          <h1>${page.title}</h1>
          ${page.body.map((block) => (typeof block === 'string' ? html`<p>${fill(block)}</p>` : html`<h2>${fill(block.h)}</h2>`))}
          ${slug === 'contato'
            ? html`<ul class="prose__contacts">
                ${wa ? html`<li><a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>` : ''}
                ${storeConfig.support.email ? html`<li><a href="mailto:${storeConfig.support.email}">${storeConfig.support.email}</a></li>` : ''}
                ${storeConfig.support.hours ? html`<li>${storeConfig.support.hours}</li>` : ''}
              </ul>`
            : ''}
        </article>
      </div>
    </section>`,
  };
}
