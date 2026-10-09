/**
 * TEXTOS DA LOJA (copy)
 * ----------------------------------------------------------------------------
 * Todos os textos das seções da página ficam aqui. Altere à vontade — nenhum
 * outro arquivo precisa ser editado. O campo "icon" usa os nomes definidos em
 * src/utils/icons.js.
 *
 * Evite promessas religiosas/espirituais, selos inventados e frases como
 * "100% garantido". O produto já comunica o nicho; a loja fica neutra.
 */

export const content = {
  // Faixa fina acima do cabeçalho.
  topBar: ['Envio para todo Brasil', 'Compra segura', 'Descontos progressivos'],

  catalog: {
    title: 'Escolha sua miniatura',
    searchPlaceholder: 'Buscar miniaturas...',
    empty: 'Nenhuma miniatura encontrada.',
    // Botão do carrinho vazio e do bloco de presente.
    browseCta: 'Ver miniaturas',
  },

  highlights: {
    title: 'Detalhes que fazem a diferença',
    items: [
      { icon: 'sparkle', title: 'Acabamento detalhado', text: 'Cada peça é cuidadosamente finalizada.' },
      { icon: 'grid', title: 'Vários modelos disponíveis', text: 'Novos modelos entram no catálogo.' },
      { icon: 'layers', title: 'Combine seus favoritos', text: 'Misture modelos no mesmo pedido.' },
      { icon: 'percent', title: 'Desconto progressivo', text: 'Quanto mais unidades, maior o desconto.' },
      { icon: 'box', title: 'Enviado com proteção', text: 'Embalagem pensada para o transporte.' },
      { icon: 'lock', title: 'Compra segura', text: 'Seus dados protegidos no pagamento.' },
    ],
  },

  reviews: {
    title: 'Avaliações de clientes',
    filters: { all: 'Todas', photo: 'Com foto', recent: 'Mais recentes' },
    showMore: 'Ver mais avaliações',
    empty: 'Ainda não há avaliações neste filtro.',
    none: 'Este modelo ainda não tem avaliações.',
    shown: 'Mostrando {n} de {total}',
    source: 'Avaliações de clientes dos anúncios no TikTok Shop',
  },

  customerGallery: {
    title: 'Veja como elas ficam',
    subtitle: 'Fotos enviadas por clientes.',
  },

  gift: {
    title: 'Uma lembrança especial para presentear',
    text: 'Uma opção delicada para presentear familiares, amigos ou alguém especial.',
    occasions: ['Aniversário', 'Batizado', 'Primeira comunhão', 'Crisma', 'Dia das Mães', 'Natal'],
    cta: 'Escolher um presente',
    // TODO: adicionar fotos reais → public/images/presente.jpg
    image: '/images/presente.jpg',
    imageAlt: 'Miniatura embalada para presente',
  },

  packaging: {
    title: 'Embalagem e envio',
    text: 'Seu pedido é preparado com cuidado e proteção para chegar em segurança até você.',
    // TODO: adicionar foto real da embalagem → public/images/embalagem.jpg
    image: '/images/embalagem.jpg',
    imageAlt: 'Embalagem de envio do pedido',
    // Rótulos dos campos configuráveis (valores em storeConfig.shipping.info).
    labels: {
      handlingTime: 'Prazo de postagem',
      carrier: 'Transportadora',
      deliveryTime: 'Prazo de entrega',
      tracking: 'Rastreio',
      freeShipping: 'Frete',
    },
  },

  // Faixa de confiança antes do rodapé. Não inclua certificações que você não tenha.
  trust: [
    { icon: 'shield', title: 'Compra segura', text: 'Pagamento processado em ambiente protegido.' },
    { icon: 'route', title: 'Pedido acompanhado', text: 'Você recebe o código de rastreio.' },
    { icon: 'headset', title: 'Atendimento ao cliente', text: 'Tire dúvidas pelo WhatsApp ou e-mail.' },
    { icon: 'truck', title: 'Envio para todo Brasil', text: 'Entregamos em todos os estados.' },
  ],

  footer: {
    about: 'Miniaturas com acabamento detalhado, enviadas para todo o Brasil.',
    // Links para as páginas institucionais (conteúdo em config/pages.js).
    links: [
      { label: 'Política de privacidade', slug: 'politica-de-privacidade' },
      { label: 'Termos de uso', slug: 'termos-de-uso' },
      { label: 'Trocas e devoluções', slug: 'trocas-e-devolucoes' },
      { label: 'Política de envio', slug: 'politica-de-envio' },
      { label: 'Contato', slug: 'contato' },
    ],
  },
};

export default content;
