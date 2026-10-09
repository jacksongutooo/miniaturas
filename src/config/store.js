/**
 * CONFIGURAÇÃO CENTRAL DA LOJA
 * ----------------------------------------------------------------------------
 * Este é o arquivo que você mais vai editar. Tudo o que é "dado da loja"
 * (nome, logo, preços, regras de desconto, frete, WhatsApp, empresa) mora aqui.
 *
 * Importante: este arquivo é lido também pelo Vite (vite.config.js) e pelos
 * testes, então ele NÃO pode usar nada do navegador (window, document...).
 *
 * Textos de seções (destaques, presente, envio etc.) ficam em ./content.js.
 * Páginas institucionais (privacidade, termos...) ficam em ./pages.js.
 * IDs de Pixel/Analytics ficam em ./analytics.js.
 * Produtos ficam em ../products/data/products.js.
 */

export const storeConfig = {
  // ── IDENTIDADE ────────────────────────────────────────────────────────────
  // TODO: adicionar nome oficial da loja.
  name: 'Nome da Loja',
  // Versão curta, usada onde falta espaço (ex.: cabeçalho no celular).
  shortName: 'Nome da Loja',

  // TODO: adicionar logo.
  // Troque o arquivo public/images/logo.svg (ou aponte para outro: .png/.webp).
  // showName: true → mostra o nome ao lado da logo. Use false se a sua logo já
  // contém o nome escrito.
  logo: {
    src: '/images/logo.svg',
    alt: 'Logo da loja',
    height: 34, // altura em px no cabeçalho
    showName: true,
  },

  // TODO: adicionar favicon. (Também é aplicado no <head> pelo Vite.)
  favicon: '/favicon.svg',
  // Cor da barra do navegador no celular.
  themeColor: '#b8532f',

  // SEO / compartilhamento
  seo: {
    titleSuffix: 'Miniaturas', // título da aba: "Nome da Loja | Miniaturas"
    description:
      'Miniaturas com acabamento detalhado. Combine modelos diferentes e ganhe desconto progressivo. Envio para todo o Brasil.',
    // TODO: adicionar imagem de compartilhamento (1200x630).
    shareImage: '/images/compartilhamento.jpg',
  },

  // ── PREÇOS E REGRAS COMERCIAIS ───────────────────────────────────────────
  locale: 'pt-BR',
  currency: 'BRL',

  // Preço padrão de cada miniatura (os produtos usam este valor).
  productPrice: 17.9,

  // Preço da oferta antes do checkout (order bump).
  upsellPrice: 12.9,

  // Quantas miniaturas promocionais cada pedido pode ter. Para liberar 2, troque por 2.
  upsellLimit: 1,

  // Quantas sugestões aparecem na tela "Antes de finalizar..." (recomendado: 3 ou 4).
  upsellSuggestions: 3,

  // Desconto progressivo — { quantidade mínima: % de desconto }.
  // A contagem considera só miniaturas REGULARES (a promocional de R$ 12,90 não conta
  // e não recebe desconto). Pode adicionar degraus: { 2: 5, 3: 10, 4: 15, 5: 20, 8: 25 }.
  discountRules: {
    2: 5,
    3: 10,
    4: 15,
    5: 20,
  },

  // Máximo de unidades de um mesmo modelo por pedido (além do limite de estoque).
  maxQtyPerItem: 20,

  // Estoque: avisa "Restam X unidades" quando o estoque é igual ou menor que isso.
  lowStockThreshold: 5,

  // ── ATENDIMENTO ──────────────────────────────────────────────────────────
  // TODO: adicionar WhatsApp.
  whatsapp: {
    enabled: true,
    // Formato internacional, só números. Ex.: 5511999999999 (55 + DDD + número).
    // Vazio = botão aparece em modo de visualização e avisa que ainda não foi configurado.
    number: '',
    message: 'Olá! Vim pelo site e gostaria de tirar uma dúvida sobre as miniaturas.',
  },

  support: {
    // TODO: adicionar e-mail e horário de atendimento reais.
    email: 'atendimento@exemplo.com.br',
    hours: 'Segunda a sexta, das 9h às 18h',
  },

  // ── ENVIO ────────────────────────────────────────────────────────────────
  shipping: {
    // TODO: configurar frete.
    // Política atual: FRETE GRÁTIS A PARTIR DA 2ª UNIDADE. Com 1 só miniatura, frete fixo de R$ 5,90
    // pelo Correios Mini (embalagem pequena, cabe no Mini Envios).
    //
    // 'flat' = usa a tabela "options" abaixo, igual para todo o Brasil.
    // Para calcular por CEP (Correios, Melhor Envio, Frenet...), implemente o provedor
    // em src/services/shipping.js e troque este valor.
    provider: 'flat',

    // Opções de entrega do checkout. O "price" é o valor cobrado quando NÃO há frete grátis.
    // TODO: confirmar o prazo do Correios Mini (minDays/maxDays e info.deliveryTime abaixo são provisórios).
    options: [
      { id: 'correios-mini', name: 'Correios Mini', carrier: 'Correios (Mini Envios)', price: 5.9, minDays: 5, maxDays: 10 },
    ],

    // Frete grátis.
    //  minUnits        → grátis a partir desta quantidade de miniaturas no pedido (2 = a partir da 2ª unidade).
    //  countPromoUnits → true: a miniatura promocional de R$ 12,90 também conta como unidade para o frete
    //                    (ela é uma miniatura enviada). Use false para contar só as regulares.
    //  minOrderValue   → opcional: também libera o frete grátis por valor do pedido (ex.: 150 = R$ 150,00,
    //                    já com descontos). null = não usar.
    // A regra libera o frete grátis na opção mais barata. Para desligar tudo: enabled: false.
    freeShipping: {
      enabled: true,
      minUnits: 2,
      countPromoUnits: true,
      minOrderValue: null,
    },

    // Informações exibidas na seção "Embalagem e envio".
    // Deixe um campo vazio ('') para ele não aparecer.
    info: {
      handlingTime: 'Até 2 dias úteis após a confirmação do pagamento', // prazo de postagem
      carrier: 'Correios (Mini Envios)', // transportadora
      deliveryTime: 'De 5 a 10 dias úteis, conforme a região', // prazo de entrega — TODO: confirmar
      tracking: 'Enviamos o código de rastreio por e-mail e WhatsApp assim que o pedido é postado', // rastreio
    },
  },

  // ── CHECKOUT ─────────────────────────────────────────────────────────────
  checkout: {
    // TODO: confirmar com o gateway se o CPF é obrigatório. (Pix e cartão normalmente exigem.)
    requireCpf: true,
    // Busca de endereço pelo CEP (ViaCEP, gratuito). Em caso de falha o cliente preenche à mão.
    cepLookup: { enabled: true, endpoint: 'https://viacep.com.br/ws/{cep}/json/' },
    // TODO: configurar gateway. Enquanto 'demo', NENHUM pagamento real é processado.
    // Veja src/services/payment.js para integrar.
    paymentProvider: 'demo',
    paymentMethods: [
      { id: 'pix', label: 'Pix', description: 'Pague pelo app do seu banco com QR Code ou código copia e cola.' },
      { id: 'card', label: 'Cartão de crédito', description: 'Você preenche os dados do cartão no ambiente seguro do gateway.' },
      // { id: 'boleto', label: 'Boleto bancário', description: 'Compensação em até 2 dias úteis.' },
    ],
  },

  // ── EMPRESA (rodapé) ─────────────────────────────────────────────────────
  // TODO: adicionar CNPJ e dados da empresa.
  company: {
    legalName: 'Razão Social da Empresa LTDA',
    cnpj: '00.000.000/0000-00',
    address: 'Rua Exemplo, 000 — Bairro, Cidade/UF — CEP 00000-000',
  },

  // ── OUTROS ───────────────────────────────────────────────────────────────
  // Prefixo das chaves salvas no navegador (carrinho, favoritos). Troque se tiver mais de uma loja no mesmo domínio.
  storageKey: 'loja-miniaturas',
};

export default storeConfig;
