/**
 * AVALIAÇÕES DE CLIENTES
 * ----------------------------------------------------------------------------
 * TODO: adicionar avaliações reais.
 * As avaliações abaixo são EXEMPLOS inventados só para testar o layout.
 * Apague todas e cole as reais — a nota média, a quantidade e a distribuição
 * por estrelas são calculadas automaticamente a partir desta lista.
 *
 * Campos:
 *   id        único
 *   name      só o primeiro nome do cliente
 *   rating    1 a 5
 *   date      'AAAA-MM-DD'
 *   text      comentário
 *   product   slug do modelo comprado (products.js) — liga a avaliação à página do produto
 *   photos    fotos enviadas pelo cliente (opcional). Ex.: ['/images/avaliacoes/avaliacao-01.jpg']
 */
export const reviews = [
  {
    id: 1,
    name: 'Mariana',
    rating: 5,
    date: '2026-09-28',
    text: 'Chegou bem embalada e o acabamento é muito bonito. Combinou direitinho com a estante da sala.',
    product: 'maria-sentada',
    photos: ['/images/avaliacoes/avaliacao-01.jpg', '/images/avaliacoes/avaliacao-02.jpg'],
  },
  {
    id: 2,
    name: 'Carlos',
    rating: 5,
    date: '2026-09-25',
    text: 'Comprei três para dar de presente e já ganhei o desconto automático. Todas vieram iguais às fotos.',
    product: 'sao-jose-sentado',
    photos: ['/images/avaliacoes/avaliacao-03.jpg'],
  },
  {
    id: 3,
    name: 'Juliana',
    rating: 5,
    date: '2026-09-19',
    text: 'Os detalhes da pintura são ótimos, ainda mais pelo preço. A entrega foi dentro do prazo.',
    product: 'jesus-sentado',
    photos: [],
  },
  {
    id: 4,
    name: 'Rafael',
    rating: 4,
    date: '2026-09-14',
    text: 'Peça bem feita. Esperava um pouco maior, mas o tamanho está igual ao descrito no anúncio.',
    product: 'sagrada-familia',
    photos: ['/images/avaliacoes/avaliacao-04.jpg'],
  },
  {
    id: 5,
    name: 'Patrícia',
    rating: 5,
    date: '2026-09-09',
    text: 'Fácil de comprar pelo celular e o atendimento respondeu minha dúvida rapidinho.',
    product: 'jesus-sentado',
    photos: [],
  },
  {
    id: 6,
    name: 'Eduardo',
    rating: 5,
    date: '2026-09-02',
    text: 'Embalagem muito bem protegida, nada quebrou no transporte. Recomendo.',
    product: 'sagrada-familia',
    photos: ['/images/avaliacoes/avaliacao-05.jpg', '/images/avaliacoes/avaliacao-06.jpg'],
  },
  {
    id: 7,
    name: 'Fernanda',
    rating: 5,
    date: '2026-08-27',
    text: 'Comprei para a minha mãe e ela adorou o presente. Veio bem acabado.',
    product: 'maria-sentada',
    photos: [],
  },
  {
    id: 8,
    name: 'Lucas',
    rating: 4,
    date: '2026-08-21',
    text: 'Gostei bastante. O código de rastreio chegou no mesmo dia da postagem.',
    product: 'sao-jose-sentado',
    photos: [],
  },
  {
    id: 9,
    name: 'Beatriz',
    rating: 5,
    date: '2026-08-15',
    text: 'Pedi cinco modelos diferentes e o desconto foi aplicado certinho no carrinho. Ficaram lindas juntas.',
    product: 'maria-sentada',
    photos: ['/images/avaliacoes/avaliacao-07.jpg'],
  },
  {
    id: 10,
    name: 'André',
    rating: 5,
    date: '2026-08-08',
    text: 'Ótimo custo-benefício. A peça é leve e o acabamento é bem caprichado.',
    product: 'divino-espirito-santo',
    photos: [],
  },
  {
    id: 11,
    name: 'Camila',
    rating: 3,
    date: '2026-07-30',
    text: 'A miniatura é bonita, mas a entrega demorou um pouco mais do que o previsto na minha região.',
    product: 'boneco-de-neve-articulado',
    photos: [],
  },
  {
    id: 12,
    name: 'Thiago',
    rating: 5,
    date: '2026-07-22',
    text: 'Já é a segunda compra. Gosto de poder combinar modelos diferentes no mesmo pedido.',
    product: 'jesus-sentado',
    photos: ['/images/avaliacoes/avaliacao-08.jpg'],
  },
];

export default reviews;
