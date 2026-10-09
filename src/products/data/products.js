/**
 * CATÁLOGO DE PRODUTOS — único lugar onde os modelos são cadastrados.
 * ----------------------------------------------------------------------------
 * Esta lista tem duas partes:
 *   1. MODELOS REAIS — com as fotos enviadas (padronizadas por scripts/preparar-fotos.py).
 *   2. MODELOS PROVISÓRIOS — só para testar o layout, com foto-modelo cinza. Apague-os
 *      (ou troque por modelos reais) quando quiser.
 *
 * TODO: adicionar modelos reais.   (nomes, categorias, descrições — hoje: nomes do anúncio de referência)
 * TODO: adicionar fotos reais.     (os modelos reais usam /images/<slug>-1..3.jpg; as fotos vieram de
 *                                   capturas de tela — o ideal é substituir por fotos da peça que você envia)
 * TODO: confirmar tamanhos.        (height / width / weight — medidas vieram do anúncio de referência)
 * TODO: confirmar materiais.       (material / finish — deixados em branco nos modelos reais)
 * TODO: adicionar avaliações reais. (rating / reviewsCount abaixo são de exemplo)
 *
 * Como adicionar um modelo: copie um bloco, mude id/slug/name e as fotos. É só isso.
 * O restante do site (catálogo, busca, página do produto, carrinho, sugestões da
 * oferta) lê esta lista automaticamente.
 *
 * Campos:
 *   id, slug         identificadores (slug aparece na URL: #/produto/<slug>)
 *   name             nome exibido
 *   category         uma das categorias de ./categories.js (campo "match")
 *   price            preço regular — vem de storeConfig.productPrice (R$ 17,90)
 *   rating           nota média (0–5) e reviewsCount: quantidade de avaliações
 *   images           de 1 a 6 fotos (a primeira é a capa). Proporção quadrada (1:1) recomendada.
 *   description      texto da página do produto
 *   height, width, weight, material, finish   ficha técnica (null = a linha some da página)
 *   featured         true = aparece primeiro na vitrine
 *   bestSeller       true = entra na categoria "Mais vendidos" (+ selo no card)
 *   sales            nº de vendas — usado para ordenar "Mais vendidos" e sugerir na oferta
 *   stock            unidades em estoque (0 = esgotado). TODO: ligar a um backend de estoque
 *                    (ver src/services/inventory.js)
 *   related          ids de modelos complementares — priorizados na oferta de R$ 12,90
 *   upsellEligible   false = nunca sugerir este modelo na oferta (usado nos provisórios)
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

// Ficha técnica dos modelos reais: só o que veio do anúncio de referência (o resto fica em branco).
const semFichaExtra = { width: null, weight: null, material: null, finish: null };

const list = [
  // ── MODELOS REAIS ─────────────────────────────────────────────────────────
  {
    id: 5,
    slug: 'jesus-sentado',
    name: 'Jesus Sentado',
    category: 'Jesus',
    rating: 4.9,
    reviewsCount: 52,
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
    rating: 4.8,
    reviewsCount: 41,
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
    rating: 4.8,
    reviewsCount: 37,
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
    rating: 4.9,
    reviewsCount: 66,
    images: ['/images/sagrada-familia-1.jpg', '/images/sagrada-familia-2.jpg', '/images/sagrada-familia-3.jpg'],
    ...semFichaExtra,
    height: '5 cm',
    // TODO: confirmar se é um conjunto com as 3 peças (Jesus, Maria e José) e o preço do conjunto.
    description:
      'Sagrada Família em miniatura, com Jesus, Maria e José. Acabamento colorido, ideal para decoração, presente ou espaço de devoção.',
    featured: true,
    related: [5, 9, 11],
  },
  {
    id: 10,
    slug: 'divino-espirito-santo',
    name: 'Divino Espírito Santo',
    category: 'Espírito Santo',
    rating: 4.8,
    reviewsCount: 29,
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
    rating: 4.7,
    reviewsCount: 24,
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

  // ── MODELOS PROVISÓRIOS (só para testar o layout; foto-modelo cinza) ──────
  {
    id: 1,
    slug: 'nossa-senhora-aparecida',
    name: 'Nossa Senhora Aparecida',
    category: 'Nossa Senhora',
    rating: 4.9,
    reviewsCount: 123,
    images: [
      '/images/produto-01-1.jpg',
      '/images/produto-01-2.jpg',
      '/images/produto-01-3.jpg',
      '/images/produto-01-4.jpg',
      '/images/produto-01-5.jpg',
      '/images/produto-01-6.jpg',
    ],
    bestSeller: true,
    sales: 482,
    related: [6, 9, 4],
    upsellEligible: false,
  },
  {
    id: 2,
    slug: 'sao-bento',
    name: 'São Bento',
    category: 'Santos',
    rating: 4.8,
    reviewsCount: 96,
    images: ['/images/produto-02-1.jpg', '/images/produto-02-2.jpg', '/images/produto-02-3.jpg', '/images/produto-02-4.jpg'],
    bestSeller: true,
    sales: 431,
    related: [3, 8, 7],
    upsellEligible: false,
  },
  {
    id: 3,
    slug: 'sao-jorge',
    name: 'São Jorge',
    category: 'Santos',
    rating: 4.9,
    reviewsCount: 88,
    images: ['/images/produto-03-1.jpg', '/images/produto-03-2.jpg', '/images/produto-03-3.jpg', '/images/produto-03-4.jpg', '/images/produto-03-5.jpg'],
    bestSeller: true,
    sales: 377,
    related: [2, 8, 12],
    upsellEligible: false,
  },
  {
    // Exemplo de modelo ESGOTADO (stock: 0): aparece no catálogo, mas não pode ser comprado
    // nem é sugerido na oferta. Troque o stock para testar.
    id: 6,
    slug: 'nossa-senhora-de-fatima',
    name: 'Nossa Senhora de Fátima',
    category: 'Nossa Senhora',
    rating: 4.7,
    reviewsCount: 58,
    images: ['/images/produto-06-1.jpg', '/images/produto-06-2.jpg', '/images/produto-06-3.jpg', '/images/produto-06-4.jpg'],
    sales: 187,
    stock: 0,
    related: [1, 9, 7],
    upsellEligible: false,
  },
  {
    // Exemplo de ESTOQUE BAIXO (aparece "Restam apenas 4 unidades" na página do produto).
    id: 7,
    slug: 'santo-antonio',
    name: 'Santo Antônio',
    category: 'Santos',
    rating: 4.8,
    reviewsCount: 52,
    images: ['/images/produto-07-1.jpg', '/images/produto-07-2.jpg', '/images/produto-07-3.jpg', '/images/produto-07-4.jpg'],
    sales: 164,
    stock: 4,
    related: [12, 2, 6],
    upsellEligible: false,
  },
  {
    id: 8,
    slug: 'sao-miguel-arcanjo',
    name: 'São Miguel Arcanjo',
    category: 'Santos',
    rating: 4.9,
    reviewsCount: 79,
    images: ['/images/produto-08-1.jpg', '/images/produto-08-2.jpg', '/images/produto-08-3.jpg', '/images/produto-08-4.jpg'],
    bestSeller: true,
    sales: 256,
    related: [3, 2, 10],
    upsellEligible: false,
  },
];

export const products = list.map((p) => ({ ...defaults, featured: false, ...p }));

export default products;
