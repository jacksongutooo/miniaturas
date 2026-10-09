import { storeConfig } from '../config/store.js';
import { content } from '../config/content.js';
import { html, raw, escapeHtml } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { hrefFor } from '../app/router.js';
import { brand } from './Header.js';
import { whatsappLink } from './WhatsappButton.js';

export function footerMarkup() {
  const { company, support, name } = storeConfig;
  const wa = whatsappLink();
  const year = new Date().getFullYear();

  return html`<footer class="footer">
    <div class="container footer__grid">
      <div class="footer__about">
        ${brand()}
        <p>${content.footer.about}</p>
      </div>

      <nav class="footer__col" aria-label="Institucional">
        <h2 class="footer__title">Institucional</h2>
        <ul>
          ${content.footer.links.map((l) => html`<li><a href="${hrefFor.page(l.slug)}">${l.label}</a></li>`)}
        </ul>
      </nav>

      <div class="footer__col">
        <h2 class="footer__title">Atendimento</h2>
        <ul>
          ${wa ? html`<li><a href="${wa}" target="_blank" rel="noopener noreferrer">${icon('whatsapp', { size: 16 })} WhatsApp</a></li>` : ''}
          ${support.email ? html`<li><a href="mailto:${support.email}">${raw(escapeHtml(support.email).replace('@', '@<wbr>'))}</a></li>` : ''}
          ${support.hours ? html`<li class="footer__muted">${support.hours}</li>` : ''}
        </ul>
      </div>

      <div class="footer__col footer__col--company">
        <h2 class="footer__title">Empresa</h2>
        <!-- TODO: adicionar CNPJ e dados da empresa (storeConfig.company) -->
        <ul class="footer__muted">
          ${company.legalName ? html`<li>${company.legalName}</li>` : ''}
          ${company.cnpj ? html`<li>CNPJ: ${company.cnpj}</li>` : ''}
          ${company.address ? html`<li>${company.address}</li>` : ''}
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="container">© ${year} ${name}. Todos os direitos reservados.</div>
    </div>
  </footer>`;
}
