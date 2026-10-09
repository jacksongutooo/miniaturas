/**
 * OVERLAYS + BOTÃO "VOLTAR" DO CELULAR
 * ----------------------------------------------------------------------------
 * Carrinho, galeria ampliada etc. são camadas por cima da página. No celular, o
 * botão voltar deve FECHAR a camada em vez de sair da loja. Cada overlay aberto
 * registra uma entrada no histórico (com um token único); "voltar" fecha o que
 * estiver no topo da pilha.
 */

const stack = []; // [{ id, token, close }]
let seq = 0;

/** Registra um overlay aberto. `close` fecha só a UI (não mexe no histórico). */
export function pushOverlay(id, close) {
  const token = `${id}:${++seq}`;
  stack.push({ id, token, close });
  history.pushState({ overlay: token }, '', location.href);
}

/** Chame ao fechar um overlay pelo botão X / ESC / fundo (volta uma entrada no histórico). */
export function popOverlay(id) {
  const index = stack.map((o) => o.id).lastIndexOf(id);
  if (index === -1) return;
  const [entry] = stack.splice(index, 1);
  if (history.state?.overlay === entry.token) history.back();
}

/**
 * Fecha todos sem voltar no histórico — usado ao NAVEGAR para outra página.
 * (A entrada de histórico fica "órfã"; o popstate abaixo a pula quando o usuário voltar.)
 */
export function dropOverlays() {
  while (stack.length) stack.pop().close();
}

export function startOverlays() {
  window.addEventListener('popstate', () => {
    const top = stack[stack.length - 1];
    const current = history.state?.overlay;
    if (top && current !== top.token) {
      // O usuário apertou "voltar" com um overlay aberto → fecha só o overlay.
      stack.pop();
      top.close();
    } else if (!top && current) {
      // Entrada de overlay "órfã" (ex.: voltou até ela depois de navegar) → pula.
      history.back();
    }
  });
}
