/**
 * PÁGINAS INSTITUCIONAIS
 * ----------------------------------------------------------------------------
 * Cada chave vira uma página em  #/pagina/<chave>  (os links do rodapé apontam para elas).
 * Os textos abaixo são PROVISÓRIOS, apenas para a estrutura — revise com um
 * profissional (jurídico/contábil) antes de publicar.
 *
 * Cada parágrafo é um item do array "body". Use { h: 'Subtítulo' } para subtítulos.
 * {storeName} é trocado automaticamente pelo nome da loja.
 */

export const pages = {
  'politica-de-privacidade': {
    title: 'Política de privacidade',
    // TODO: revisar texto com assessoria jurídica (LGPD).
    body: [
      'Esta página explica, de forma geral, como {storeName} trata os dados pessoais informados durante a compra.',
      { h: 'Quais dados coletamos' },
      'Nome, e-mail, telefone, CPF e endereço de entrega, necessários para processar o pagamento, emitir o pedido e realizar o envio.',
      { h: 'Como usamos os dados' },
      'Os dados são usados apenas para processar o pedido, entrar em contato sobre a entrega e prestar atendimento.',
      { h: 'Seus direitos' },
      'Você pode solicitar acesso, correção ou exclusão dos seus dados pelos canais de atendimento.',
    ],
  },

  'termos-de-uso': {
    title: 'Termos de uso',
    // TODO: revisar texto com assessoria jurídica.
    body: [
      'Ao utilizar este site e realizar compras, você concorda com as condições descritas nesta página.',
      { h: 'Produtos e preços' },
      'As fotos são ilustrativas e pequenas variações de cor e acabamento podem ocorrer por se tratar de peças feitas à mão. Preços e promoções podem ser alterados sem aviso prévio.',
      { h: 'Pedidos' },
      'O pedido é confirmado após a aprovação do pagamento. Pedidos sujeitos à disponibilidade de estoque.',
    ],
  },

  'trocas-e-devolucoes': {
    title: 'Trocas e devoluções',
    // TODO: confirmar política de trocas e devoluções.
    body: [
      'Você pode solicitar a devolução em até 7 dias corridos após o recebimento, conforme o Código de Defesa do Consumidor.',
      { h: 'Produto com defeito ou avariado' },
      'Entre em contato pelos canais de atendimento com fotos do produto e da embalagem para que possamos resolver.',
      { h: 'Como solicitar' },
      'Envie o número do pedido e o motivo da solicitação para o nosso atendimento.',
    ],
  },

  'politica-de-envio': {
    title: 'Política de envio',
    // TODO: configurar frete e confirmar prazos.
    body: [
      'Enviamos para todo o Brasil. Os prazos e valores de frete são exibidos no checkout.',
      { h: 'Prazo de postagem' },
      'O pedido é preparado e postado após a confirmação do pagamento.',
      { h: 'Rastreamento' },
      'Assim que o pedido é postado, enviamos o código de rastreio para você acompanhar a entrega.',
    ],
  },

  contato: {
    title: 'Contato',
    // TODO: adicionar canais de atendimento reais (e-mail/horário em config/store.js).
    body: [
      'Fale com a gente pelo WhatsApp ou por e-mail. Respondemos em horário comercial.',
      'Informe o número do pedido para agilizar o atendimento.',
    ],
  },
};

export default pages;
