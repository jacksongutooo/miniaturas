/**
 * CATÁLOGO DE PRODUTOS — único lugar onde os modelos são cadastrados.
 * ----------------------------------------------------------------------------
 * TODO: adicionar modelos reais.   (nomes, categorias, descrições)
 * TODO: adicionar fotos reais.     (substitua os arquivos em public/images/ mantendo os nomes,
 *                                   ou altere os caminhos em "images")
 * TODO: confirmar tamanhos.        (height / width / weight)
 * TODO: confirmar materiais.       (material / finish)
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
 *   height, width, weight, material, finish   ficha técnica
 *   featured         true = aparece primeiro na vitrine
 *   bestSeller       true = entra na categoria "Mais vendidos" (+ selo no card)
 *   sales            nº de vendas — usado para ordenar "Mais vendidos" e sugerir na oferta
 *   stock            unidades em estoque (0 = esgotado). TODO: ligar a um backend de estoque
 *                    (ver src/services/inventory.js)
 *   related          ids de modelos complementares — priorizados na oferta de R$ 12,90
 */

import { storeConfig } from '../../config/store.js';

// Valores padrão — cada produto pode sobrescrever qualquer um deles.
const defaults = {
  price: storeConfig.productPrice,
  stock: 100,
  height: '10 cm',
  width: '5 cm',
  weight: '120 g',
  material: 'Resina',
  finish: 'Pintura detalhada',
  description:
    'Miniatura com acabamento detalhado, ideal para decoração, presente ou espaço de devoção.',
};

const list = [
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
    featured: true,
    bestSeller: true,
    sales: 482,
    related: [6, 9, 4],
  },
  {
    id: 2,
    slug: 'sao-bento',
    name: 'São Bento',
    category: 'Santos',
    rating: 4.8,
    reviewsCount: 96,
    images: ['/images/produto-02-1.jpg', '/images/produto-02-2.jpg', '/images/produto-02-3.jpg', '/images/produto-02-4.jpg'],
    featured: true,
    bestSeller: true,
    sales: 431,
    related: [3, 8, 7],
  },
  {
    id: 3,
    slug: 'sao-jorge',
    name: 'São Jorge',
    category: 'Santos',
    rating: 4.9,
    reviewsCount: 88,
    images: ['/images/produto-03-1.jpg', '/images/produto-03-2.jpg', '/images/produto-03-3.jpg', '/images/produto-03-4.jpg', '/images/produto-03-5.jpg'],
    featured: true,
    bestSeller: true,
    sales: 377,
    related: [2, 8, 12],
  },
  {
    id: 4,
    slug: 'sagrada-familia',
    name: 'Sagrada Família',
    category: 'Família',
    rating: 4.8,
    reviewsCount: 64,
    images: ['/images/produto-04-1.jpg', '/images/produto-04-2.jpg', '/images/produto-04-3.jpg', '/images/produto-04-4.jpg'],
    featured: true,
    bestSeller: false,
    sales: 215,
    related: [11, 1, 5],
  },
  {
    id: 5,
    slug: 'jesus-misericordioso',
    name: 'Jesus Misericordioso',
    category: 'Jesus',
    rating: 4.9,
    reviewsCount: 71,
    images: ['/images/produto-05-1.jpg', '/images/produto-05-2.jpg', '/images/produto-05-3.jpg', '/images/produto-05-4.jpg'],
    bestSeller: true,
    sales: 298,
    related: [10, 4, 1],
  },
  {
    id: 6,
    slug: 'nossa-senhora-de-fatima',
    name: 'Nossa Senhora de Fátima',
    category: 'Nossa Senhora',
    rating: 4.7,
    reviewsCount: 58,
    images: ['/images/produto-06-1.jpg', '/images/produto-06-2.jpg', '/images/produto-06-3.jpg', '/images/produto-06-4.jpg'],
    bestSeller: false,
    sales: 187,
    related: [1, 9, 7],
  },
  {
    id: 7,
    slug: 'santo-antonio',
    name: 'Santo Antônio',
    category: 'Santos',
    rating: 4.8,
    reviewsCount: 52,
    images: ['/images/produto-07-1.jpg', '/images/produto-07-2.jpg', '/images/produto-07-3.jpg', '/images/produto-07-4.jpg'],
    bestSeller: false,
    sales: 164,
    related: [12, 2, 6],
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
  },
  {
    id: 9,
    slug: 'nossa-senhora-das-gracas',
    name: 'Nossa Senhora das Graças',
    category: 'Nossa Senhora',
    rating: 4.7,
    reviewsCount: 41,
    images: ['/images/produto-09-1.jpg', '/images/produto-09-2.jpg', '/images/produto-09-3.jpg', '/images/produto-09-4.jpg'],
    bestSeller: false,
    sales: 132,
    related: [1, 6, 4],
  },
  {
    id: 10,
    slug: 'sagrado-coracao-de-jesus',
    name: 'Sagrado Coração de Jesus',
    category: 'Jesus',
    rating: 4.8,
    reviewsCount: 47,
    images: ['/images/produto-10-1.jpg', '/images/produto-10-2.jpg', '/images/produto-10-3.jpg', '/images/produto-10-4.jpg'],
    bestSeller: false,
    sales: 141,
    related: [5, 4, 9],
  },
  {
    // Exemplo de modelo ESGOTADO (stock: 0): aparece no catálogo, mas não pode ser comprado
    // nem é sugerido na oferta. Troque o stock para testar.
    id: 11,
    slug: 'sao-jose',
    name: 'São José',
    category: 'Família',
    rating: 4.8,
    reviewsCount: 33,
    images: ['/images/produto-11-1.jpg', '/images/produto-11-2.jpg', '/images/produto-11-3.jpg', '/images/produto-11-4.jpg'],
    bestSeller: false,
    sales: 98,
    stock: 0,
    related: [4, 1, 12],
  },
  {
    // Exemplo de ESTOQUE BAIXO (aparece "Restam 4 unidades" na página do produto).
    id: 12,
    slug: 'sao-francisco-de-assis',
    name: 'São Francisco de Assis',
    category: 'Santos',
    rating: 4.9,
    reviewsCount: 29,
    images: ['/images/produto-12-1.jpg', '/images/produto-12-2.jpg', '/images/produto-12-3.jpg', '/images/produto-12-4.jpg'],
    bestSeller: false,
    sales: 87,
    stock: 4,
    related: [7, 3, 6],
  },
];

export const products = list.map((p) => ({ ...defaults, featured: false, ...p }));

export default products;
