import { storeConfig } from '../config/store.js';
import { content } from '../config/content.js';
import { html, raw, escapeHtml } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { moneyFromReais, normalizeText } from '../utils/format.js';
import { searchProducts } from '../products/catalog.js';
import { hrefFor, navigate, onRouteChange } from '../app/router.js';
import * as cart from '../app/cart.js';
import * as favorites from '../app/favorites.js';
import { img } from './primitives.js';

/** Logo + nome da loja (usado no cabeçalho e no checkout). */
export function brand({ href = hrefFor.home(), name = storeConfig.name } = {}) {
  const { logo } = storeConfig;
  return html`<a class="brand" href="${href}" aria-label="${name} — página inicial">
    ${logo.src ? html`<img class="brand__logo" src="${logo.src}" alt="${logo.showName ? '' : logo.alt}" height="${logo.height}" style="height:${logo.height}px;width:auto" decoding="async" />` : ''}
    ${logo.showName || !logo.src ? html`<span class="brand__name">${name}</span>` : ''}
  </a>`;
}

export function topBar() {
  return html`<div class="topbar">
    <ul class="topbar__list container">
      ${content.topBar.map((text) => html`<li>${text}</li>`)}
    </ul>
  </div>`;
}

export function headerMarkup() {
  return html`<header class="header" id="site-header">
    <div class="header__inner container">
      <div class="header__brand">${brand()}</div>

      <form class="search" role="search" data-search-form action="#" autocomplete="off">
        <div class="search__field">
          <label class="visually-hidden" for="search-input">${content.catalog.searchPlaceholder}</label>
          <span class="search__icon">${icon('search', { size: 18 })}</span>
          <input id="search-input" class="search__input" type="search" name="q" placeholder="${content.catalog.searchPlaceholder}"
            autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"
            role="combobox" aria-expanded="false" aria-controls="search-panel" aria-autocomplete="list" />
          <button type="button" class="search__clear" data-search-clear aria-label="Limpar busca" hidden>${icon('close', { size: 16 })}</button>
        </div>
        <div class="search__panel" id="search-panel" role="listbox" hidden></div>
      </form>

      <a class="icon-btn header__fav" href="${hrefFor.favorites()}" aria-label="Favoritos">
        ${icon('heart', { size: 22 })}
        <span class="icon-btn__badge" data-fav-count hidden>0</span>
      </a>
      <button type="button" class="icon-btn header__cart" data-action="open-cart" aria-label="Abrir carrinho">
        ${icon('cart', { size: 22 })}
        <span class="icon-btn__badge" data-cart-count hidden>0</span>
      </button>
    </div>
  </header>`;
}

/** Destaca o trecho digitado (sem diferenciar acentos). */
function highlight(name, query) {
  const needle = normalizeText(query).split(/\s+/)[0];
  if (!needle) return escapeHtml(name);
  // normaliza caractere a caractere para manter os índices alinhados com o texto original
  const norm = [...name].map((c) => normalizeText(c) || c.toLowerCase()).join('');
  const idx = norm.length === name.length ? norm.indexOf(needle) : -1;
  if (idx < 0) return escapeHtml(name);
  return `${escapeHtml(name.slice(0, idx))}<mark>${escapeHtml(name.slice(idx, idx + needle.length))}</mark>${escapeHtml(name.slice(idx + needle.length))}`;
}

export function mountHeader(root) {
  const form = root.querySelector('[data-search-form]');
  const input = form.querySelector('.search__input');
  const clear = form.querySelector('[data-search-clear]');
  const panel = root.querySelector('#search-panel');
  const cartBadge = root.querySelector('[data-cart-count]');
  const favBadge = root.querySelector('[data-fav-count]');
  const cartBtn = root.querySelector('.header__cart');
  let activeIndex = -1;
  let timer;

  // ── contadores ──────────────────────────────────────────────────────────
  let lastCount = cart.getState().totals.itemCount;
  const renderCart = ({ totals }) => {
    cartBadge.textContent = totals.itemCount > 99 ? '99+' : String(totals.itemCount);
    cartBadge.hidden = totals.itemCount === 0;
    if (totals.itemCount > lastCount) {
      cartBtn.classList.remove('is-bumping');
      void cartBtn.offsetWidth;
      cartBtn.classList.add('is-bumping');
    }
    lastCount = totals.itemCount;
  };
  const renderFav = () => {
    const n = favorites.count();
    favBadge.textContent = String(n);
    favBadge.hidden = n === 0;
  };
  renderCart(cart.getState());
  renderFav();
  cart.subscribe(renderCart);
  favorites.subscribe(renderFav);

  // ── busca ───────────────────────────────────────────────────────────────
  const rows = () => [...panel.querySelectorAll('[role="option"]')];

  function closePanel() {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function setActive(index) {
    const items = rows();
    items.forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
      el.setAttribute('aria-selected', String(i === index));
    });
    activeIndex = index;
    if (items[index]) input.setAttribute('aria-activedescendant', items[index].id);
  }

  function renderPanel() {
    const query = input.value.trim();
    clear.hidden = query.length === 0;
    if (query.length < 1) return closePanel();

    const results = searchProducts(query, { limit: 6 });
    const body = results.length
      ? html`${results.map(
          (p, i) => html`<a class="suggest" id="suggest-${i}" role="option" aria-selected="false" href="${hrefFor.product(p.slug)}">
            <span class="suggest__thumb">${img({ src: p.images[0], alt: '', width: 80, height: 80 })}</span>
            <span class="suggest__text">
              <span class="suggest__name">${raw(highlight(p.name, query))}</span>
              <span class="suggest__meta">${p.category}</span>
            </span>
            <span class="suggest__price">${moneyFromReais(p.price)}</span>
          </a>`,
        )}
        <a class="suggest suggest--all" id="suggest-all" role="option" aria-selected="false" href="${hrefFor.search(query)}">
          Ver todos os resultados para “${query}” ${icon('chevronRight', { size: 16 })}
        </a>`
      : html`<p class="suggest__empty">Nenhuma miniatura encontrada para “${query}”.</p>`;

    panel.innerHTML = String(body);
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    activeIndex = -1;
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(renderPanel, 60);
    clear.hidden = input.value.length === 0;
  });
  input.addEventListener('focus', () => input.value.trim() && renderPanel());

  input.addEventListener('keydown', (e) => {
    const items = rows();
    if (e.key === 'ArrowDown' && items.length) {
      e.preventDefault();
      setActive((activeIndex + 1) % items.length);
    } else if (e.key === 'ArrowUp' && items.length) {
      e.preventDefault();
      setActive((activeIndex - 1 + items.length) % items.length);
    } else if (e.key === 'Escape') {
      closePanel();
      input.blur();
    } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      const href = items[activeIndex].getAttribute('href');
      closePanel();
      input.blur();
      navigate(href.slice(1));
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    closePanel();
    input.blur();
    navigate(hrefFor.search(query).slice(1));
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    closePanel();
    input.focus();
  });

  // Clicar em uma sugestão fecha o painel; clicar fora também.
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) closePanel();
  });
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target) && !panel.contains(e.target)) closePanel();
  });

  // Mantém o campo coerente com a rota.
  onRouteChange(({ name, params }) => {
    closePanel();
    if (name === 'search') input.value = params.query ?? '';
    else if (name === 'home') input.value = '';
    clear.hidden = input.value.length === 0;
  });
}
