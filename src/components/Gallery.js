/**
 * GALERIA DO PRODUTO — carrossel com deslize (celular) + setas (desktop) + miniaturas.
 * Toque/clique na foto abre a ampliação com zoom (Lightbox).
 */

import { html } from '../utils/html.js';
import { icon } from '../utils/icons.js';
import { img } from './primitives.js';

export function galleryMarkup(product) {
  const images = product.images;
  const multi = images.length > 1;

  return html`<div class="gallery" data-gallery>
    <div class="gallery__stage">
      <ul class="gallery__track" tabindex="0" aria-label="Fotos de ${product.name}">
        ${images.map(
          (src, i) => html`<li class="gallery__slide">
            <button type="button" class="gallery__zoom" data-action="open-lightbox" data-group="pdp" data-src="${src}" data-alt="${product.name} — foto ${i + 1}" aria-label="Ampliar foto ${i + 1} de ${images.length}">
              ${img({ src, alt: `${product.name} — foto ${i + 1}`, eager: i === 0, priority: i === 0, width: 800, height: 800 })}
            </button>
          </li>`,
        )}
      </ul>
      ${multi ? html`<span class="gallery__counter" data-gallery-counter>1 / ${images.length}</span>` : ''}
      ${multi
        ? html`<button type="button" class="gallery__arrow gallery__arrow--prev" data-gallery-prev aria-label="Foto anterior">${icon('chevronLeft', { size: 22 })}</button>
            <button type="button" class="gallery__arrow gallery__arrow--next" data-gallery-next aria-label="Próxima foto">${icon('chevronRight', { size: 22 })}</button>`
        : ''}
      <span class="gallery__hint" aria-hidden="true">${icon('zoom', { size: 16 })} Ampliar</span>
    </div>
    ${multi
      ? html`<ul class="gallery__thumbs" data-gallery-thumbs>
          ${images.map(
            (src, i) => html`<li>
              <button type="button" class="gallery__thumb${i === 0 ? ' is-active' : ''}" data-gallery-thumb="${i}" aria-label="Ver foto ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''}>
                ${img({ src, alt: '', width: 120, height: 120 })}
              </button>
            </li>`,
          )}
        </ul>`
      : ''}
  </div>`;
}

export function mountGallery(root) {
  const gallery = root.querySelector('[data-gallery]');
  if (!gallery) return () => {};
  const track = gallery.querySelector('.gallery__track');
  const counter = gallery.querySelector('[data-gallery-counter]');
  const thumbsWrap = gallery.querySelector('[data-gallery-thumbs]');
  const thumbs = [...gallery.querySelectorAll('[data-gallery-thumb]')];
  const total = track.children.length;
  let current = 0;
  let frame = 0;

  const goTo = (i) => {
    const target = Math.min(total - 1, Math.max(0, i));
    track.scrollTo({ left: target * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  function setCurrent(i) {
    if (i === current) return;
    current = i;
    if (counter) counter.textContent = `${i + 1} / ${total}`;
    thumbs.forEach((t, n) => {
      t.classList.toggle('is-active', n === i);
      if (n === i) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
    const active = thumbs[i];
    if (thumbsWrap && active) {
      const left = active.offsetLeft - (thumbsWrap.clientWidth - active.offsetWidth) / 2;
      thumbsWrap.scrollTo({ left, behavior: 'smooth' });
    }
  }

  const onScroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => setCurrent(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
  };

  const onClick = (e) => {
    const thumb = e.target.closest('[data-gallery-thumb]');
    if (thumb) return goTo(Number(thumb.dataset.galleryThumb));
    if (e.target.closest('[data-gallery-prev]')) return goTo(current - 1);
    if (e.target.closest('[data-gallery-next]')) return goTo(current + 1);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    else if (e.key === 'ArrowRight') goTo(current + 1);
  };

  // Ao redimensionar a janela, mantém a foto atual alinhada.
  const onResize = () => (track.scrollLeft = current * track.clientWidth);

  track.addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('keydown', onKey);
  gallery.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', onResize);
  };
}
