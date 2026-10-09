/**
 * ZOOM POR GESTO (sem biblioteca)
 *  • celular: pinça para ampliar, arrastar para mover, duplo toque para alternar o zoom
 *  • desktop: roda do mouse / duplo clique; arrastar quando ampliado
 *  • sem zoom: arrastar para os lados chama onSwipe(-1 | 1) (foto anterior/próxima)
 *
 * `viewport` é a área visível (touch-action: none); `target` é o <img> centralizado nela.
 */

const MAX_SCALE = 4;
const SWIPE_DISTANCE = 56;

export function attachZoom(viewport, target, { onSwipe, onZoomChange } = {}) {
  let scale = 1;
  let x = 0;
  let y = 0;
  const pointers = new Map();
  let pinch = null; // { dist, scale, mid:{x,y}, x, y }
  let drag = null; // { startX, startY, x, y, moved }
  let lastTap = 0;

  const apply = (animate = false) => {
    target.style.transition = animate ? 'transform .2s ease' : 'none';
    target.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    onZoomChange?.(scale > 1.01);
  };

  function clamp() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const maxX = Math.max(0, (target.offsetWidth * scale - vw) / 2);
    const maxY = Math.max(0, (target.offsetHeight * scale - vh) / 2);
    x = Math.min(maxX, Math.max(-maxX, x));
    y = Math.min(maxY, Math.max(-maxY, y));
  }

  const center = () => {
    const r = viewport.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  function zoomAt(clientX, clientY, nextScale) {
    const c = center();
    const px = clientX - c.x;
    const py = clientY - c.y;
    nextScale = Math.min(MAX_SCALE, Math.max(1, nextScale));
    const ratio = nextScale / scale;
    x = px - (px - x) * ratio;
    y = py - (py - y) * ratio;
    scale = nextScale;
    if (scale <= 1.01) {
      scale = 1;
      x = 0;
      y = 0;
    }
    clamp();
  }

  const dist = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const mid = () => {
    const [a, b] = [...pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  function onDown(e) {
    try {
      viewport.setPointerCapture?.(e.pointerId);
    } catch {
      /* ponteiro já finalizado: segue sem captura */
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      pinch = { dist: dist(), scale, mid: mid(), x, y };
      drag = null;
    } else if (pointers.size === 1) {
      drag = { startX: e.clientX, startY: e.clientY, x, y, moved: false };
    }
  }

  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch && pointers.size >= 2) {
      const m = mid();
      const c = center();
      const next = Math.min(MAX_SCALE, Math.max(1, (pinch.scale * dist()) / pinch.dist));
      // mantém o ponto sob os dedos fixo
      const ratio = next / pinch.scale;
      const px = pinch.mid.x - c.x;
      const py = pinch.mid.y - c.y;
      x = pinch.x + (m.x - pinch.mid.x) - (px - pinch.x) * (ratio - 1);
      y = pinch.y + (m.y - pinch.mid.y) - (py - pinch.y) * (ratio - 1);
      scale = next;
      clamp();
      apply();
      return;
    }

    if (drag && pointers.size === 1) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
      if (scale > 1.01) {
        x = drag.x + dx;
        y = drag.y + dy;
        clamp();
        apply();
      } else {
        // acompanha o dedo horizontalmente como feedback do "arrastar para trocar"
        target.style.transition = 'none';
        target.style.transform = `translate(${dx * 0.5}px, 0) scale(1)`;
      }
    }
  }

  function onUp(e) {
    const had = pointers.has(e.pointerId);
    pointers.delete(e.pointerId);
    if (!had) return;

    if (pinch) {
      if (pointers.size < 2) pinch = null;
      if (scale <= 1.01) {
        scale = 1;
        x = 0;
        y = 0;
      }
      clamp();
      apply(true);
      if (pointers.size === 1) {
        const [p] = [...pointers.values()];
        drag = { startX: p.x, startY: p.y, x, y, moved: true };
      }
      return;
    }

    if (drag && pointers.size === 0) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const wasDrag = drag.moved;
      drag = null;

      if (scale <= 1.01) {
        if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.2) {
          scale = 1;
          x = 0;
          y = 0;
          apply(true);
          onSwipe?.(dx < 0 ? 1 : -1);
          return;
        }
        apply(true); // volta ao centro
      }

      // duplo toque / duplo clique
      if (!wasDrag) {
        const now = Date.now();
        if (now - lastTap < 320) {
          lastTap = 0;
          zoomAt(e.clientX, e.clientY, scale > 1.01 ? 1 : 2.5);
          apply(true);
        } else {
          lastTap = now;
        }
      }
    }
  }

  function onWheel(e) {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2));
    apply();
  }

  viewport.addEventListener('pointerdown', onDown);
  viewport.addEventListener('pointermove', onMove);
  viewport.addEventListener('pointerup', onUp);
  viewport.addEventListener('pointercancel', onUp);
  viewport.addEventListener('wheel', onWheel, { passive: false });

  return {
    reset() {
      scale = 1;
      x = 0;
      y = 0;
      pointers.clear();
      pinch = null;
      drag = null;
      apply();
    },
    zoomIn() {
      const c = center();
      zoomAt(c.x, c.y, scale * 1.5);
      apply(true);
    },
    zoomOut() {
      const c = center();
      zoomAt(c.x, c.y, scale / 1.5);
      apply(true);
    },
    destroy() {
      viewport.removeEventListener('pointerdown', onDown);
      viewport.removeEventListener('pointermove', onMove);
      viewport.removeEventListener('pointerup', onUp);
      viewport.removeEventListener('pointercancel', onUp);
      viewport.removeEventListener('wheel', onWheel);
    },
  };
}
