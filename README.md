# Loja de miniaturas — primeira versão

Página de vendas completa, mobile-first, com catálogo logo na primeira tela, carrinho lateral, **desconto progressivo**, **frete grátis a partir de 2 miniaturas**, oferta de **R$ 12,90** antes do checkout e checkout em 5 etapas. Tudo funciona com **placeholders**: trocar nome, logo, fotos, produtos, preços e textos **não exige mexer na estrutura**.

- JavaScript puro + [Vite](https://vite.dev). **Zero dependências em produção** (só o Vite para desenvolver/gerar o site).
- Medido em "3G rápido + CPU 4× mais lenta": primeira pintura ≈ 0,8 s, sem deslocamento de layout. JS ≈ 29 KB e CSS ≈ 10 KB (gzip); o código do checkout só é baixado quando necessário.

## Como rodar

```bash
npm install
npm run dev        # abre em http://localhost:5173 (também acessível pelo celular na mesma rede)
npm run build      # gera a pasta dist/ pronta para publicar
npm run preview    # serve o build para conferir
npm test           # testes das regras de preço/desconto/oferta/frete/busca
```

Publicação: qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages, GitHub Pages…). Build: `npm run build`, pasta: `dist`. O site usa rotas por `#` (ex.: `/#/produto/sao-bento`), então **não precisa configurar redirecionamentos**.

---

## O que editar (e onde)

| Quero trocar… | Arquivo |
|---|---|
| Nome da loja, logo, favicon, cor da barra, SEO | `src/config/store.js` (+ arquivos em `public/`) |
| Preço padrão (R$ 17,90), preço da oferta (R$ 12,90), limite da oferta, faixas de desconto | `src/config/store.js` → `productPrice`, `upsellPrice`, `upsellLimit`, `discountRules` |
| WhatsApp (número e mensagem), e-mail/horário de atendimento | `src/config/store.js` → `whatsapp`, `support` |
| Frete: valor de 1 unidade (R$ 5,90), a partir de quantas unidades é grátis (2), prazos, transportadora | `src/config/store.js` → `shipping` (`options`, `freeShipping`, `info`) |
| CNPJ, razão social, endereço (rodapé) | `src/config/store.js` → `company` |
| Produtos (nomes, fotos, medidas, material, estoque…) | `src/products/data/products.js` |
| Categorias | `src/products/data/categories.js` |
| Avaliações | `src/products/data/reviews.js` |
| Fotos de clientes ("Veja como elas ficam") | `src/products/data/gallery.js` |
| Textos da página (destaques, presente, embalagem, confiança, rodapé) | `src/config/content.js` |
| Privacidade, termos, trocas, política de envio, contato | `src/config/pages.js` |
| Pixels / Analytics (Meta, GA4, GTM, UTMify) | `src/config/analytics.js` |
| Cor de destaque, raios, sombras | `src/styles/tokens.css` (variável `--accent`) |

Para ver tudo que ainda é provisório: `grep -rn "TODO" src public index.html`.

### Fotos

**Os 6 modelos reais** (Jesus Sentado, Maria Sentada, São José Sentado, Sagrada Família, Divino Espírito Santo e Boneco de Neve Articulado) já têm 3 fotos padronizadas cada (900 × 900 px, JPG leve, sem dados de localização):

| Arquivo | O que é |
|---|---|
| `public/images/<modelo>-1.jpg` | **foto de estúdio**: fundo removido, peça centralizada, fundo off-white suave e sombra de contato |
| `public/images/<modelo>-2.jpg` | a **cena original**, recortada em quadrado |
| `public/images/<modelo>-3.jpg` | **medidas** (altura/largura) desenhadas sobre a peça |

Elas são geradas por `scripts/preparar-fotos.py` a partir das fotos guardadas em `fotos-originais/` (uma pasta por modelo; veja o `LEIA-ME.md` dela). Para refazer ou acrescentar fotos, sem enviar nada para serviços externos:

```bash
python3 -m venv .venv-fotos
.venv-fotos/bin/pip install -r scripts/requirements-fotos.txt
.venv-fotos/bin/python scripts/preparar-fotos.py                      # todos os modelos
.venv-fotos/bin/python scripts/preparar-fotos.py jesus-sentado        # só um
.venv-fotos/bin/python scripts/preparar-fotos.py --fundo branco       # fundo branco puro (padrão: estúdio)
```

> **Qualidade:** as fotos recebidas eram **capturas de tela de celular (~739 px)**, então o recorte e a nitidez têm limite. Quando houver as fotos originais da câmera (ou as imagens do anúncio, em tamanho cheio), é só colocá-las em `fotos-originais/` e rodar o script de novo — o resultado melhora sozinho.

Os **modelos provisórios** (ids 1, 2, 3, 6, 7 e 8) usam placeholders cinza com o nome do arquivo. As demais imagens também são provisórias; substitua mantendo o mesmo nome, ou altere os caminhos em `products.js`:

```
public/images/produto-01-1.jpg … produto-01-6.jpg   (até 6 fotos por produto; a 1ª é a capa)
public/images/clientes/cliente-01.jpg …              (galeria "Veja como elas ficam")
public/images/avaliacoes/avaliacao-01.jpg …          (fotos nas avaliações)
public/images/embalagem.jpg · presente.jpg · compartilhamento.jpg (1200×630)
public/images/logo.svg · public/favicon.svg
```

Recomendação: fotos **quadradas (1:1)**, ~800–1000 px, JPG/WebP otimizados (< 150 KB). Foto que não existir vira um espaço reservado neutro (nada quebra). Toque na foto abre a ampliação com zoom por pinça.

### Adicionar um produto

1. Ponha a foto em `fotos-originais/<slug>/cena.jpeg` e acrescente uma linha em `PRODUTOS` no `scripts/preparar-fotos.py` (slug e medidas); rode o script. *(Se já tiver as fotos prontas, pule este passo e copie-as para `public/images/`.)*
2. Copie um bloco em `products.js` e mude `id`, `slug`, `name`, `category` e `images`. Catálogo, busca, página do produto, relacionados e sugestões da oferta passam a incluí-lo automaticamente.

Exemplos prontos no arquivo (modelos provisórios): **Nossa Senhora de Fátima** (`stock: 0` → "Esgotado") e **Santo Antônio** (`stock: 4` → "Restam apenas 4 unidades"). Os modelos provisórios têm `upsellEligible: false`, para a oferta de R$ 12,90 só sugerir modelos reais.

---

## Regras de preço (o coração da loja)

- **Desconto progressivo** pela quantidade de miniaturas **regulares** no carrinho (modelos diferentes se combinam): 2 → 5%, 3 → 10%, 4 → 15%, 5+ → 20%. Aplicado automaticamente; a barra de progresso e as mensagens ("Você desbloqueou 5% OFF 🎉", "Falta apenas 1…") são geradas a partir de `discountRules`.
- **Miniatura promocional (R$ 12,90)** é marcada internamente com `bump: true`: **não conta** para o desconto e **não recebe** desconto. Limite por pedido: `upsellLimit` (1). Só existe se houver ao menos 1 miniatura regular no carrinho.
- **Sugestões da oferta**: nunca repetem o que já está no carrinho; só modelos em estoque; prioriza complementares (`related` no produto) → mais vendidos → destaques, evitando repetir categoria.
- Exemplo do briefing (testado): 3 normais = R$ 53,70 → 10% → **R$ 48,33** + promocional R$ 12,90 = **R$ 61,23**. 4 normais = R$ 71,60 − R$ 10,74 = **R$ 60,86**.
- **Frete**: **grátis a partir da 2ª unidade** (2 miniaturas, de modelos iguais ou diferentes). Com **1 miniatura**, frete fixo de **R$ 5,90** pelo **Correios Mini** (Mini Envios). A miniatura promocional de R$ 12,90 também conta como unidade para o frete (`freeShipping.countPromoUnits`; ponha `false` para contar só as regulares) — por isso a oferta "libera" o frete grátis de quem tem 1 item e isso é avisado na etapa "Antes de finalizar...". Dá para mudar a quantidade (`minUnits`), liberar também por valor do pedido (`minOrderValue`) ou desligar (`enabled: false`).
- Exemplos (testados): 1 × R$ 17,90 + frete R$ 5,90 = **R$ 23,80** · 2 × R$ 17,90 − 5% = **R$ 34,01 com frete grátis** · 1 + promocional = R$ 30,80 com frete grátis.
- Valores são calculados em **centavos** (sem erro de arredondamento). Lógica pura em `src/utils/pricing.js`, `src/utils/discount.js` e `src/utils/freeShipping.js`.
- O carrinho fica no `localStorage` (ids + quantidades; os preços sempre vêm da config atual). Sincroniza entre abas.

## Fluxo de compra

Vitrine (os produtos já aparecem no topo, sem banner) → **Adicionar** (aviso com quanto falta para o próximo desconto e para o frete grátis; barra fixa no celular) → carrinho lateral/tela cheia com barra de progresso, aviso de frete grátis e o frete já somado ao total → **Finalizar compra** → **"Antes de finalizar..."** (oferta de R$ 12,90; "Não, quero continuar") → checkout: Dados → Endereço (CEP preenche via ViaCEP) → Entrega → Pagamento → Confirmação. Não há cadastro obrigatório. O botão "voltar" do celular fecha o carrinho/galeria e navega entre as etapas do checkout.

## O que ainda falta ligar (de propósito)

| Item | Estado atual | Onde ligar |
|---|---|---|
| **Pagamento** | `demo`: nada é cobrado; o checkout mostra aviso de "modo demonstração" e os pixels **não** registram `Purchase` de pedidos demo | `src/services/payment.js` (crie um endpoint seu que recalcula os valores no servidor — nunca confie nos totais do navegador — e use campos hospedados/redirecionamento do gateway para cartão) |
| **Frete** | regra definida: grátis a partir de 2 unidades, 1 unidade = R$ 5,90 (Correios Mini). **Prazo de entrega ainda provisório** (5 a 10 dias úteis) — confirme o prazo real do Mini Envios | `storeConfig.shipping` (prazos em `options[].minDays/maxDays` e `info.deliveryTime`). Para cobrar por CEP/região: `src/services/shipping.js` |
| **Estoque** | vem do campo `stock` do produto | `src/services/inventory.js` |
| **Pedidos** | só ficam na sessão do navegador (não há backend) | seu endpoint de pedidos |
| **Avaliações / fotos / textos legais** | exemplos inventados | `reviews.js`, `gallery.js`, `pages.js` (revisar com jurídico/contador) |

## Analytics

Eventos internos: `ViewContent`, `AddToCart`, `InitiateCheckout`, `AddPaymentInfo`, `Purchase` (`src/services/analytics.js`). Preencha os IDs em `src/config/analytics.js` e os scripts passam a carregar sozinhos (após o carregamento da página). Todo evento também vai para `window.dataLayer` (GTM) e para o evento do navegador `store:track`. Parâmetros `utm_*`, `fbclid`, `gclid` são guardados e anexados ao pedido. Ative `debug: true` para ver os eventos no console.

## Estrutura

```
src/
  config/      store.js · content.js · pages.js · analytics.js     ← você edita aqui
  products/    data/ (products, categories, reviews, gallery) · catalog.js · upsell.js
  app/         router · cart · favorites · actions · overlays · shopping · handlers
  components/  Header, ProductCard, Catalog, Gallery, Lightbox, CartDrawer, DiscountProgress, Reviews, Sections…
  pages/       HomePage · ProductPage · CheckoutPage (+ checkout/) · Search · Favorites · Info · NotFound
  services/    analytics · cep · shipping · payment · inventory
  utils/       pricing · discount · freeShipping · format · html (escape automático) · icons · storage · validators · pinchZoom…
  styles/      tokens · base · header · catalog · product · cart · checkout · sections · lightbox
public/        favicon.svg · images/
scripts/       preparar-fotos.py (tira o fundo e padroniza as fotos) · requirements-fotos.txt
fotos-originais/  fotos recebidas, uma pasta por modelo (+ LEIA-ME.md; não vão para o site)
tests/         pricing.test.js · shipping.test.js · catalog.test.js
```

## Acessibilidade e responsividade

Testado em 320, 360, 375, 390, 414, 768, 1024 e 1440 px: sem rolagem horizontal nem botões cortados na vitrine, produto, busca, favoritos, carrinho, oferta e nas 5 etapas do checkout. Campos com 16 px (sem zoom automático no iPhone), botões principais com ≥ 44 px de altura, foco visível, navegação por teclado, `aria-live` nas mensagens do carrinho e respeito a `prefers-reduced-motion`.
