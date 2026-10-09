/**
 * BARRA DE PROGRESSO DO DESCONTO + MENSAGENS  (funções puras)
 * ----------------------------------------------------------------------------
 * Gera os dados que a barra "1 → 2 → 3 → 4 → 5+" e as mensagens usam.
 * Tudo é derivado de storeConfig.discountRules: mudar as regras muda a barra e os textos.
 */

import { money } from './format.js';
import { tiersFromRules } from './pricing.js';

/**
 * @param {number} count     miniaturas regulares no carrinho
 * @param {object} rules     storeConfig.discountRules
 * @param {number} savings   economia total em centavos (totals.savings)
 */
export function getDiscountProgress(count, rules, savings = 0) {
  const tiers = tiersFromRules(rules);
  if (tiers.length === 0) {
    return { nodes: [], fill: 0, percent: 0, nextPercent: null, remaining: 0, isMax: false, title: '', hint: '' };
  }

  const last = tiers.length - 1;
  const currentIndex = tiers.reduce((acc, tier, i) => (count >= tier.at ? i : acc), -1);
  const current = currentIndex >= 0 ? tiers[currentIndex] : null;
  const next = tiers[currentIndex + 1] ?? null;
  const isMax = currentIndex === last;

  // Degraus visuais: 1 → (cada limite) · o último ganha o "+" (ex.: "5+").
  const nodes = [{ at: 1, label: '', reached: count >= 1, plus: false }].concat(
    tiers.map((tier, i) => ({
      at: tier.at,
      label: `${tier.percent}%`,
      reached: count >= tier.at,
      plus: i === last,
    })),
  );
  const reachedIndex = nodes.reduce((acc, node, i) => (node.reached ? i : acc), -1);
  const fill = reachedIndex <= 0 ? 0 : reachedIndex / (nodes.length - 1);

  const remaining = next ? next.at - count : 0;
  const saved = money(savings);
  let title = '';
  let hint = '';

  if (!current) {
    // Ainda sem desconto.
    hint =
      remaining === 1
        ? `Adicione +1 miniatura e ganhe ${next.percent}% OFF.`
        : `Adicione ${remaining} miniaturas e ganhe ${next.percent}% OFF.`;
  } else if (isMax) {
    title = `Você desbloqueou nosso maior desconto: ${current.percent}% OFF 🎉`;
    hint = savings > 0 ? `Você já economizou ${saved}.` : '';
  } else {
    title = currentIndex === 0 ? `Você desbloqueou ${current.percent}% OFF 🎉` : `Você já economizou ${saved}.`;
    const nextIsMax = tiers.indexOf(next) === last;
    if (nextIsMax) {
      hint =
        remaining === 1
          ? `Falta apenas 1 para chegar ao desconto máximo de ${next.percent}%.`
          : `Faltam apenas ${remaining} para chegar ao desconto máximo de ${next.percent}%.`;
    } else if (currentIndex === 0) {
      hint =
        remaining === 1
          ? `Adicione +1 miniatura e ganhe ${next.percent}% OFF.`
          : `Adicione +${remaining} miniaturas e ganhe ${next.percent}% OFF.`;
    } else {
      hint = `Adicione só mais ${remaining} para desbloquear ${next.percent}% OFF.`;
    }
  }

  return {
    nodes,
    fill,
    percent: current?.percent ?? 0,
    nextPercent: next?.percent ?? null,
    remaining,
    isMax,
    title,
    hint,
  };
}
