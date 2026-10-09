/**
 * CATÁLOGO DE PRODUTOS — único lugar onde os modelos são cadastrados.
 * ----------------------------------------------------------------------------
 * TODO: adicionar os demais modelos. (já pedidos: Frei Gilson, Santa Teresinha, São Bento,
 *       Kit Jesus e Maria, Kit Natalino — faltam preço e fotos; veja fotos-originais/LEIA-ME.md)
 * TODO: confirmar tamanhos.        (height / width — vieram dos anúncios; weight/material/finish ficam em branco)
 * TODO: avaliações dos demais modelos. (Sagrada Família, Divino Espírito Santo e Boneco de Neve ainda não
 *                                   têm avaliações reais — mande os prints do anúncio; veja fotos-originais/avaliacoes/)
 *
 * As fotos de cada modelo são geradas por scripts/preparar-fotos.py (capa, outra foto e medidas).
 *
 * Como adicionar um modelo: copie um bloco, mude id/slug/name e as fotos. É só isso.
 * O restante do site (catálogo, busca, página do produto, carrinho, sugestões da
 * oferta) lê esta lista automaticamente.
 *
 * Campos:
 *   id, slug         identificadores (slug aparece na URL: #/produto/<slug>)
 *   name             nome exibido
 *   category         uma das categorias de ./categories.js (campo "match")
 *   price            preço regular. Se omitido, vale storeConfig.productPrice (R$ 17,90). Conjuntos podem ter
 *                    preço próprio (ex.: Sagrada Família, R$ 43,90) — e, por custarem mais que a miniatura
 *                    padrão, nunca são oferecidos a R$ 12,90 (ver src/products/upsell.js).
 *   rating           nota média (0–5) e reviewsCount: quantidade de avaliações — SEMPRE os números reais do anúncio.
 *                    Sem avaliações reais, não ponha nada: o site simplesmente não mostra nota.
 *   ratingBreakdown  (opcional) { 5: n, 4: n, 3: n, 2: n, 1: n } — só vale se somar reviewsCount
 *   ratingListing    (opcional) nome do anúncio de origem; modelos que são variações do mesmo anúncio
 *                    usam o mesmo e são contados uma vez só na nota geral da loja
 *   ratingSource     (opcional) texto mostrado junto da nota, dizendo de onde ela vem
 *   images           de 1 a 6 fotos (a primeira é a capa). Proporção quadrada (1:1) recomendada.
 *   description      texto da página do produto
 *   height, width, weight, material, finish   ficha técnica (null = a linha some da página)
 *   featured         true = aparece primeiro na vitrine
 *   bestSeller       true = entra na categoria "Mais vendidos" (+ selo no card)
 *   sales            nº de vendas — usado para ordenar "Mais vendidos" e sugerir na oferta
 *   stock            unidades em estoque (0 = esgotado → o card mostra "Esgotado"; abaixo de 5, a página
 *                    mostra "Restam apenas N unidades"). TODO: ligar a um backend de estoque
 *                    (ver src/services/inventory.js)
 *   related          ids de modelos complementares — priorizados na oferta de R$ 12,90
 *   upsellEligible   false = nunca sugerir este modelo na oferta de R$ 12,90
 */

import { storeConfig } from '../../config/store.js';

// Valores padrão — cada produto pode sobrescrever qualquer um deles.
const defaults = {
  price: storeConfig.productPrice,
  stock: 100,
  sales: 0,
  bestSeller: false,
  height: '10 cm',
  width: '5 cm',
  weight: '120 g',
  material: 'Resina',
  finish: 'Pintura detalhada',
  description:
    'Miniatura com acabamento detalhado, ideal para decoração, presente ou espaço de devoção.',
};

// Ficha técnica: só o que veio dos anúncios (o resto fica em branco até ser confirmado).
const semFichaExtra = { width: null, weight: null, material: null, finish: null };

const list = [
  {
    id: 5,
    slug: 'jesus-sentado',
    name: 'Jesus Sentado',
    category: 'Jesus',
    // Números reais do anúncio no TikTok Shop em 09/10/2026: 4,1 ★ (46 avaliações; 33 de 5 estrelas, 1 de 4,
    // 1 de 3, 4 de 2 e 7 de 1) e 550 vendidos (print do mesmo dia, quando o anúncio tinha 44 avaliações).
    rating: 4.1,
    reviewsCount: 46,
    ratingBreakdown: { 5: 33, 4: 1, 3: 1, 2: 4, 1: 7 },
    ratingSource: 'Avaliações do anúncio no TikTok Shop',
    sales: 550,
    bestSeller: true,
    images: ['/images/jesus-sentado-1.jpg', '/images/jesus-sentado-2.jpg', '/images/jesus-sentado-3.jpg'],
    ...semFichaExtra,
    height: '5 cm',
    featured: true,
    related: [9, 11, 4],
  },
  {
    id: 9,
    slug: 'maria-sentada',
    name: 'Maria Sentada',
    category: 'Nossa Senhora',
    // No TikTok Shop a Maria é vendida dentro do anúncio "Kit Jesus e Maria" (Kit 1+1, Kit 2+2 e 2 Marias):
    // 4,5 ★ (20 avaliações em 09/10/2026).
    rating: 4.5,
    reviewsCount: 20,
    ratingListing: 'kit-jesus-e-maria',
    ratingSource: 'Avaliações do anúncio "Kit Jesus e Maria" no TikTok Shop',
    images: ['/images/maria-sentada-1.jpg', '/images/maria-sentada-2.jpg', '/images/maria-sentada-3.jpg'],
    ...semFichaExtra,
    height: '5 cm',
    featured: true,
    related: [5, 11, 4],
  },
  {
    id: 11,
    slug: 'sao-jose-sentado',
    name: 'São José Sentado',
    category: 'Santos',
    // No TikTok Shop o São José é uma variação do anúncio dos santos (com São Bento e São Miguel):
    // 4,1 ★ (14 avaliações em 09/10/2026) — a nota é do anúncio todo.
    rating: 4.1,
    reviewsCount: 14,
    ratingListing: 'santos',
    ratingSource: 'Avaliações do anúncio dos santos no TikTok Shop (inclui São Bento e São Miguel)',
    images: ['/images/sao-jose-sentado-1.jpg', '/images/sao-jose-sentado-2.jpg', '/images/sao-jose-sentado-3.jpg'],
    ...semFichaExtra,
    height: '5 cm',
    featured: true,
    related: [5, 9, 4],
  },
  {
    id: 4,
    slug: 'sagrada-familia',
    name: 'Sagrada Família',
    category: 'Família',
    // TODO: avaliações reais (rating e reviewsCount do anúncio) — ainda não enviadas.
    images: ['/images/sagrada-familia-1.jpg', '/images/sagrada-familia-2.jpg', '/images/sagrada-familia-3.jpg'],
    ...semFichaExtra,
    height: '5 cm',
    // Conjunto com as 3 peças (José, Jesus e Maria). Preço próprio: R$ 43,90.
    price: 43.9,
    description:
      'Conjunto com as três peças da Sagrada Família — José, Jesus e Maria —, coloridas e cheias de detalhes, com 5 cm de altura cada uma. Ideal para decoração, presente ou espaço de devoção.',
    featured: true,
    related: [5, 9, 11],
  },
  {
    id: 10,
    slug: 'divino-espirito-santo',
    name: 'Divino Espírito Santo',
    category: 'Espírito Santo',
    // TODO: avaliações reais (rating e reviewsCount do anúncio) — ainda não enviadas.
    images: ['/images/divino-espirito-santo-1.jpg', '/images/divino-espirito-santo-2.jpg', '/images/divino-espirito-santo-3.jpg'],
    ...semFichaExtra,
    height: '10 cm',
    width: '10 cm',
    description:
      'Divino Espírito Santo em miniatura, com pomba branca e raios dourados. Ideal para decoração, presente ou espaço de devoção.',
    featured: true,
    related: [5, 4, 9],
  },
  {
    id: 12,
    slug: 'boneco-de-neve-articulado',
    name: 'Boneco de Neve Articulado',
    category: 'Natal',
    // TODO: avaliações reais (rating e reviewsCount do anúncio) — ainda não enviadas.
    images: [
      '/images/boneco-de-neve-articulado-1.jpg',
      '/images/boneco-de-neve-articulado-2.jpg',
      '/images/boneco-de-neve-articulado-3.jpg',
    ],
    ...semFichaExtra,
    height: '6 cm',
    width: '4 cm',
    description:
      'Boneco de neve articulado: as pernas se movimentam e podem ficar em diferentes posições. Decoração de Natal para mesas, prateleiras e estantes.',
    featured: true,
    related: [10, 5, 9],
  },
];

export const products = list.map((p) => ({ ...defaults, featured: false, ...p }));

export default products;
