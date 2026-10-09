/**
 * NOTAS E TOTAIS DE AVALIAÇÃO (funções puras)
 * ----------------------------------------------------------------------------
 * Os números oficiais de cada modelo vêm do anúncio de origem (products.js):
 *   rating           nota média
 *   reviewsCount     total de avaliações
 *   ratingBreakdown  (opcional) quantas avaliações de 5, 4, 3, 2 e 1 estrela
 *   ratingListing    (opcional) identifica o anúncio: modelos que são variações do MESMO anúncio
 *                    (ex.: São Bento e São José) usam o mesmo valor e são contados uma vez só no geral
 * Sem reviewsCount = sem avaliações reais ainda: o site não mostra nota.
 */

const STARS = [5, 4, 3, 2, 1];

/**
 * A distribuição por estrelas só vale se somar exatamente o total
 * (senão as barras mostrariam números que não existem).
 */
export function normalizeDistribution(breakdown, total) {
  if (!breakdown) return null;
  const distribution = {};
  let sum = 0;
  for (const star of STARS) {
    const value = Number(breakdown[star] ?? 0);
    if (!Number.isInteger(value) || value < 0) return null;
    distribution[star] = value;
    sum += value;
  }
  return sum === total ? distribution : null;
}

/** Resumo de um modelo, ou null quando ele ainda não tem avaliações reais. */
export function productReviewStats(product) {
  const total = Number(product?.reviewsCount) || 0;
  const average = Number(product?.rating);
  if (!total || !Number.isFinite(average) || average <= 0) return null;
  return { average, total, distribution: normalizeDistribution(product.ratingBreakdown, total) };
}

/**
 * Resumo geral da loja: média ponderada dos anúncios com nota (cada anúncio conta uma vez).
 * A distribuição só aparece se todos os anúncios tiverem a sua.
 */
export function overallReviewStats(products) {
  const byListing = new Map();
  for (const product of products) {
    const stats = productReviewStats(product);
    if (stats) byListing.set(product.ratingListing ?? product.slug, stats);
  }
  const all = [...byListing.values()];
  if (!all.length) return null;

  const total = all.reduce((sum, s) => sum + s.total, 0);
  const average = all.reduce((sum, s) => sum + s.average * s.total, 0) / total;
  const distribution = all.every((s) => s.distribution)
    ? Object.fromEntries(STARS.map((star) => [star, all.reduce((sum, s) => sum + s.distribution[star], 0)]))
    : null;
  return { average, total, distribution };
}
