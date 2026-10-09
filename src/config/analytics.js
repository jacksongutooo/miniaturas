/**
 * ANALYTICS / PIXELS
 * ----------------------------------------------------------------------------
 * Nada é carregado enquanto os IDs estiverem vazios — nenhum ID fictício foi instalado.
 * Quando preencher um ID, o script correspondente passa a ser carregado automaticamente
 * (depois que a página termina de carregar, para não atrasar a compra).
 *
 * Eventos internos disparados pela loja (ver src/services/analytics.js):
 *   ViewContent · AddToCart · InitiateCheckout · AddPaymentInfo · Purchase
 *
 * Além dos pixels abaixo, todo evento também vai para:
 *   • window.dataLayer (Google Tag Manager)
 *   • o evento do navegador "store:track" (window.addEventListener('store:track', e => e.detail))
 */
export const analyticsConfig = {
  // Mostra os eventos no console do navegador (útil para testar). Deixe false em produção.
  debug: false,

  // TODO: adicionar IDs quando existirem.
  metaPixelId: '', // Meta Pixel (Facebook/Instagram). Ex.: '123456789012345'
  ga4MeasurementId: '', // Google Analytics 4. Ex.: 'G-XXXXXXXXXX'
  gtmContainerId: '', // Google Tag Manager. Ex.: 'GTM-XXXXXXX'
  utmifyPixelId: '', // UTMify (confira no painel deles se o snippet mudou)

  // Outras tags: [{ src: 'https://...', async: true, attrs: { 'data-x': 'y' } }]
  customScripts: [],
};

export default analyticsConfig;
