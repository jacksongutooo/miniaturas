/**
 * AVALIAÇÕES DE CLIENTES — REAIS, copiadas dos anúncios do TikTok Shop
 * ----------------------------------------------------------------------------
 * Origem: prints enviados em 09/10/2026 (ficam em fotos-originais/avaliacoes/).
 *  • Os textos estão como o cliente escreveu (com os erros de digitação) e os nomes aparecem
 *    mascarados, como o próprio TikTok mostra ("M**a S**i").
 *  • O TikTok mostra a data como "há 1d" ou "1 sem."; aqui viraram datas aproximadas, contadas
 *    a partir do dia dos prints (2026-10-09).
 *  • Avaliações cortadas no print, sem data legível ou sem texto não entraram.
 *  • Não há fotos de clientes (o ideal é pedir autorização a cada cliente antes de usar).
 *
 * REGRA: só entra avaliação de cliente de verdade. Nunca escreva, "melhore" ou invente avaliações —
 * isso é propaganda enganosa (Código de Defesa do Consumidor, art. 37) e as plataformas punem.
 *
 * Esta lista é só uma AMOSTRA. A nota, o total e a distribuição oficiais de cada modelo
 * (rating, reviewsCount, ratingBreakdown) ficam em products.js e vêm do anúncio.
 *
 * Campos:
 *   id        único
 *   name      como aparece no anúncio
 *   rating    1 a 5
 *   date      'AAAA-MM-DD'
 *   text      comentário
 *   product   slug do modelo (products.js) — a avaliação aparece na página dele
 *   variant   opção que o cliente comprou, quando ajuda (ex.: 'Kit 1 Jesus + 1 Maria')
 *   photos    (opcional) fotos enviadas pelo cliente — só com autorização dele
 */

const JESUS = 'jesus-sentado';
// A Maria é vendida no TikTok Shop dentro do anúncio "Kit Jesus e Maria" (Kit 1+1, Kit 2+2 e 2 Marias).
const MARIA = 'maria-sentada';
const JOSE = 'sao-jose-sentado';
const KIT_1_1 = 'Kit 1 Jesus + 1 Maria';
const KIT_2_2 = 'Kit 2 Jesus + 2 Marias';

export const reviews = [
  { id: 1, name: 'W**n A**s', rating: 5, date: '2026-10-09', text: 'Muito lindo, entrega rápida. Perfeito. Certeza que irei comprar mais', product: MARIA, variant: KIT_1_1 },
  { id: 2, name: 'm**e i**s', rating: 5, date: '2026-10-08', text: 'achei lindo, é bem pequeno mas achei lindo', product: JESUS },
  { id: 3, name: 'C**a R**a', rating: 5, date: '2026-10-08', text: 'Lindinho , tamanho bom vou colocar no espelho do carro , mas pensei que ele já vinha com a fita dupla face', product: JESUS },
  { id: 4, name: 'j**_', rating: 5, date: '2026-10-08', text: 'Perfeitooooooo', product: JESUS },
  { id: 5, name: 'G**u S**r', rating: 5, date: '2026-10-08', text: 'Muito fofinho! Bem embalado e veio com cheirinho! Sao bem pequeninos mas muito fofos', product: MARIA, variant: KIT_2_2 },
  { id: 6, name: 't**a', rating: 4, date: '2026-10-08', text: 'Bacana. Só achei que o produto fosse um pouco maior, mas eles são muito bonitinhos.', product: MARIA, variant: KIT_2_2 },
  { id: 7, name: 'A** C**e', rating: 5, date: '2026-10-08', text: 'Muito boa qualidade', product: MARIA, variant: '2 Marias' },
  { id: 8, name: 'e**a', rating: 5, date: '2026-10-08', text: 'Muito bom', product: MARIA, variant: KIT_1_1 },
  { id: 9, name: 'B**o B**n', rating: 5, date: '2026-10-08', text: 'Lindos..', product: MARIA, variant: KIT_1_1 },
  { id: 10, name: 'M**a S**i', rating: 5, date: '2026-10-08', text: 'Lindoooo', product: JOSE },
  { id: 11, name: 'J**a C**a', rating: 5, date: '2026-10-06', text: 'Eu simplesmente amei', product: MARIA, variant: KIT_1_1 },
  { id: 12, name: 'C**s', rating: 5, date: '2026-10-05', text: 'Ele é como esperado, simples e bonitinho.', product: JESUS },
  { id: 13, name: 'P**a G**e', rating: 5, date: '2026-10-04', text: 'Produto chegou na data certa e perfeito', product: JESUS },
  { id: 14, name: 'a**', rating: 5, date: '2026-10-02', text: 'É lindo delicado valeu mto a compra', product: JESUS },
  { id: 15, name: 'A** S**p', rating: 5, date: '2026-10-02', text: 'Lindos, um é meu e outro de presente.', product: JESUS },
  { id: 16, name: 'K**n C**s', rating: 5, date: '2026-10-02', text: 'Muito lindo, perfeito', product: JOSE },
  { id: 17, name: 'S**i F**a', rating: 5, date: '2026-09-29', text: 'Imaginei que fossem maiores... mas são lindos', product: MARIA, variant: KIT_2_2 },
  { id: 18, name: 'A**y A**i ✨**', rating: 5, date: '2026-09-28', text: 'Muito bom e entrega rápida! 🫶🏼', product: JESUS },
  { id: 19, name: 'H**n J**a', rating: 5, date: '2026-09-28', text: 'Poderia variar a cor do cabelo, mais o restante tudo ok recomendo a comprar', product: JESUS },
  { id: 20, name: 'L**💞', rating: 5, date: '2026-09-28', text: 'Excelente acabamento muito bem feito, amei', product: JESUS },
  { id: 21, name: 'P**a M**s', rating: 5, date: '2026-09-28', text: 'Amei a miniatura,de jesus e Maria Super indico', product: MARIA, variant: KIT_2_2 },
  { id: 22, name: 'N**a O**a', rating: 5, date: '2026-09-25', text: 'Tudo certo com a entrega. Muito fofo', product: JESUS },
  { id: 23, name: 'c**o', rating: 5, date: '2026-09-25', text: 'Gostei, recomendo. Satisfeito', product: JESUS },
  {
    id: 24,
    name: 'A**s d** M**a e** c**ê',
    rating: 5,
    date: '2026-09-25',
    text: 'Estou apaixonada, é uma perfeição o boneco, com riqueza de detalhes.A entrega foi rápida e com toda certeza irei comprar mais para presentear meus familiares,super indico.Ficou lindo no meu ateliê,e o diferencial da novidade,eu não conhecia nada com essa técnica de 3D. Comprarei mais vezes !',
    product: JESUS,
  },
  { id: 25, name: 'J**a P**s', rating: 5, date: '2026-09-17', text: 'Ótima qualidade, perfeito', product: MARIA, variant: KIT_2_2 },
];

export default reviews;
