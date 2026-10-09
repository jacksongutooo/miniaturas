import { html } from '../utils/html.js';
import { hrefFor } from '../app/router.js';

export default function NotFoundPage() {
  return {
    title: 'Página não encontrada',
    html: html`<section class="section">
      <div class="container container--narrow">
        <div class="empty-state">
          <p class="empty-state__title">Página não encontrada</p>
          <p class="muted">O endereço pode ter mudado ou o produto não está mais disponível.</p>
          <a class="btn btn--primary" href="${hrefFor.home()}">Ver miniaturas</a>
        </div>
      </div>
    </section>`,
  };
}
