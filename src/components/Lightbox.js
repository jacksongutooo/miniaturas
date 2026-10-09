/**
 * AMPLIAÇÃO DE FOTOS (tela cheia) com zoom por pinça no celular.
 * Usada na página do produto, nas avaliações com foto e na galeria de clientes.
 *
 * Qualquer elemento com  data-action="open-lightbox" data-group="nome" data-src="..." data-alt="..."
 * abre a galeria com todos os elementos do mesmo grupo.
 */

import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { trapTab } from '../utils/focusTrap.js';
import { attachZoom } from '../utils/pinchZoom.js';
import { pushOverlay, popOverlay } from '../app/overlays.js';
import { hideToast } from './Toast.js';

let root;
let imgEl;
let viewport;
let countEl;
let prevBtn;
let nextBtn;
let zoom;
let items = [];
let index = 0;
let isOpen = false;
let lastFocus = null;

function showImage() {
  const item = items[index];
  imgEl.alt = item.alt || '';
  imgEl.src = item.src;
  zoom.reset();
  countEl.textContent = `${index + 1} / ${items.length}`;
  const multi = items.length > 1;
  prevBtn.hidden = !multi;
  nextBtn.hidden = !multi;
  countEl.hidden = !multi;
  // pré-carrega as vizinhas
  [index - 1, index + 1].forEach((i) => {
    if (items[i]) new Image().src = items[i].src;
  });
}

function go(delta) {
  if (items.length < 2) return;
  index = (index + delta + items.length) % items.length;
  showImage();
}

function hide() {
  if (!isOpen) return;
  isOpen = false;
  root.hidden = true;
  document.documentElement.classList.remove('lb-open');
  document.removeEventListener('keydown', onKey, true);
  lastFocus?.focus?.({ preventScroll: true });
}

export function closeLightbox() {
  if (!isOpen) return;
  hide();
  popOverlay('lightbox');
}

function onKey(e) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    closeLightbox();
  } else if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === '+' || e.key === '=') zoom.zoomIn();
  else if (e.key === '-') zoom.zoomOut();
  else trapTab(root, e);
}

/** @param {Array<{src:string, alt?:string}>} list */
export function openLightbox(list, start = 0) {
  if (!list.length) return;
  items = list;
  index = Math.min(Math.max(0, start), list.length - 1);
  lastFocus = document.activeElement;
  isOpen = true;
  hideToast();
  root.hidden = false;
  document.documentElement.classList.add('lb-open');
  showImage();
  root.querySelector('[data-lb-close]').focus({ preventScroll: true });
  document.addEventListener('keydown', onKey, true);
  pushOverlay('lightbox', hide);
}

export function mountLightbox(container) {
  root = document.createElement('div');
  root.className = 'lightbox';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Foto ampliada');
  root.innerHTML = String(html`
    <div class="lightbox__bar">
      <span class="lightbox__count" aria-live="polite"></span>
      <div class="lightbox__tools">
        <button type="button" class="lightbox__btn lightbox__btn--zoom" data-lb-zoom-out aria-label="Reduzir">${icon('minus', { size: 20 })}</button>
        <button type="button" class="lightbox__btn lightbox__btn--zoom" data-lb-zoom-in aria-label="Ampliar">${icon('plus', { size: 20 })}</button>
        <button type="button" class="lightbox__btn" data-lb-close aria-label="Fechar">${icon('close', { size: 22 })}</button>
      </div>
    </div>
    <div class="lightbox__viewport"><img class="lightbox__img" alt="" draggable="false" /></div>
    <button type="button" class="lightbox__nav lightbox__nav--prev" data-lb-prev aria-label="Foto anterior">${icon('chevronLeft', { size: 26 })}</button>
    <button type="button" class="lightbox__nav lightbox__nav--next" data-lb-next aria-label="Próxima foto">${icon('chevronRight', { size: 26 })}</button>
    <p class="lightbox__hint">Use dois dedos para ampliar · arraste para trocar de foto</p>
  `);
  container.appendChild(root);

  imgEl = root.querySelector('.lightbox__img');
  viewport = root.querySelector('.lightbox__viewport');
  countEl = root.querySelector('.lightbox__count');
  prevBtn = root.querySelector('[data-lb-prev]');
  nextBtn = root.querySelector('[data-lb-next]');

  zoom = attachZoom(viewport, imgEl, {
    onSwipe: (dir) => go(dir),
    onZoomChange: (zoomed) => root.classList.toggle('is-zoomed', zoomed),
  });

  root.querySelector('[data-lb-close]').addEventListener('click', closeLightbox);
  root.querySelector('[data-lb-zoom-in]').addEventListener('click', () => zoom.zoomIn());
  root.querySelector('[data-lb-zoom-out]').addEventListener('click', () => zoom.zoomOut());
  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  // clique no fundo escuro (fora da foto) fecha
  viewport.addEventListener('click', (e) => {
    if (e.target === viewport && !root.classList.contains('is-zoomed')) closeLightbox();
  });
}

/** Lê o grupo do DOM e abre na foto clicada. */
export function openLightboxFromElement(el) {
  const group = el.dataset.group;
  const nodes = [...document.querySelectorAll(`[data-action="open-lightbox"][data-group="${CSS.escape(group)}"]`)];
  const list = nodes.map((n) => ({ src: n.dataset.src, alt: n.dataset.alt }));
  openLightbox(list, Math.max(0, nodes.indexOf(el)));
}
