# Fotos originais

Aqui ficam as fotos **como foram recebidas**, organizadas em uma pasta por modelo. Nada desta pasta vai para o site: o script `scripts/preparar-fotos.py` lê estes arquivos e gera as imagens finais em `public/images/`.

> As fotos dos produtos chegaram como **capturas de tela de celular (~739 px de largura)**, com barra de status e faixas pretas. O script recorta isso sozinho, mas a nitidez final tem limite. Com fotos maiores (1500 px ou mais) o resultado fica bem melhor.

## O que tem em cada pasta

| Pasta / arquivo | Nome original (WhatsApp, 09/10/2026) | O que é | Uso |
|---|---|---|---|
| `jesus-sentado/cena.jpeg` | `…at 11.56.33.jpeg` | Jesus sentado na borda do monitor | ✅ gera as 3 fotos |
| `maria-sentada/cena.jpeg` | `…at 11.56.33 (2).jpeg` | Maria sentada | ✅ gera as 3 fotos |
| `sao-jose-sentado/cena.jpeg` | `…at 11.56.33 (1).jpeg` | São José sentado | ✅ gera as 3 fotos |
| `sagrada-familia/cena-escritorio.jpeg` | `…at 11.56.34 (8).jpeg` | José, Jesus e Maria juntos, no monitor (escritório) | ✅ gera as 3 fotos |
| `sagrada-familia/cena-biblia-com-titulo.jpeg` | `…at 11.56.34 (5).jpeg` | Os três sobre uma Bíblia, com o título escrito por cima | não usada (texto sobre a foto; sem o título seria uma ótima capa) |
| `sagrada-familia/infografico.jpeg` | `…at 11.56.34 (7).jpeg` | Infográfico do anúncio: "Leve Jesus, Maria e José", 5 cm de altura | referência |
| `espirito-santo/cena.jpeg` | `…at 11.56.34 (1).jpeg` | Pomba branca com raios dourados | ✅ gera as 3 fotos |
| `espirito-santo/cena-com-medidas-do-anuncio.jpeg` | `…at 11.56.34 (3).jpeg` | A mesma peça com as medidas do anúncio (10 × 10 cm) | referência |
| `boneco-de-neve/cena.jpeg` | `…at 11.56.34 (2).jpeg` | Boneco de neve articulado | ✅ gera as 3 fotos |
| `boneco-de-neve/infografico.jpeg` | `…at 11.56.34 (6).jpeg` | Infográfico do anúncio (6 × 4 cm) | referência |
| `boneco-de-neve/infografico-duvidas.jpeg` | `…at 11.56.34 (4).jpeg` | Perguntas e respostas do anúncio | referência |
| `outros/nossos-santos-infografico.jpeg` | `…at 11.56.34.jpeg` | "Nossos Santos": São Bento, Frei Gilson, São José, Jesus, Maria e Santa Teresinha | referência — mostra modelos que ainda **não** estão no catálogo |
| `outros/pagina-do-anuncio-1.jpeg` · `-2` · `-3` | `…at 11.56.35 (1).jpeg` · `(2)` · `.jpeg` | Capturas do anúncio "Mini Jesus Sentado 3D Decorativo 5 cm" (4,2 ★ · 44 avaliações · 550 vendidos) | referência (nome, tamanho, números do anúncio) |
| `outros-produtos/` (13 arquivos `WhatsApp Image 2026-10-01 at 23.15.*.jpeg`) | `…2026-10-01 at 23.15.15` a `23.15.27` | Fotos de clientes de **outro produto** (sprays corporais "Bodyman", marca Primacial), sem texto de avaliação | não usadas — não são das miniaturas |

"Referência" = serviu para conferir nome, tamanho e descrição; não vira foto de produto.

A pasta `avaliacoes/` é onde entram os prints das avaliações reais das miniaturas (veja o `LEIA-ME.md` dela).

## Capas dos anúncios do TikTok Shop (`anuncios-tiktok/`)

Baixadas em 09/10/2026 a partir dos links de compartilhamento dos 4 anúncios (630 × 630 px). **São as imagens de capa, com texto desenhado por cima** — servem de referência, não de foto de produto.

| Arquivo | Anúncio | Já está no site? |
|---|---|---|
| `kit-jesus-e-maria.png` | [Kit Mini Jesus e Maria Sentados – Decoração Religiosa 3D para Monitor, Prateleira e Presente](https://shop.tiktok.com/br/pdp/1737357347135456692) | não — falta preço e foto limpa |
| `santos-que-inspiram.png` | [Santos que inspiram 3D: Jesus, Maria, José, Frei Gilson e Santa Teresinha, 3,5 cm](https://shop.tiktok.com/br/pdp/1737592339012158572) | só Jesus, Maria e José (os de 5 cm); faltam Frei Gilson, Santa Teresinha (e São Bento, que aparece na imagem) |
| `kit-natalino.png` | [Kit Natalino Mini Boneco de Neve Articulado & Cia, 7 cm](https://shop.tiktok.com/br/pdp/1737582379031037434) | não — a capa tem uma peça tampada com "CENSURADO" |
| `boneco-de-neve-articulado.png` | [Boneco de Neve Articulado | Enfeite de Natal Decorativo](https://shop.tiktok.com/br/pdp/1737760385788905420) | sim: "Boneco de Neve Articulado" |

As páginas desses anúncios abrem uma **verificação anti-robô (captcha)**; por isso só o título e a capa (que vêm no próprio link compartilhado) foram obtidos. Para trazer as fotos completas e os preços: abra o anúncio no navegador do computador, salve cada foto (botão direito → *Salvar imagem como…*) — ou baixe pelo Seller Center — e suba na pasta do modelo (ex.: `fotos-originais/frei-gilson/cena.jpeg`) pelo GitHub (*Add file → Upload files*).

## Como adicionar ou trocar uma foto

1. Coloque a foto em `fotos-originais/<slug-do-modelo>/cena.jpeg` (jpg, png, webp ou heic).
2. Se for um modelo novo, acrescente uma linha em `PRODUTOS` no `scripts/preparar-fotos.py` (slug, nome do arquivo, medidas em cm e `capa`: `'cena'` se a foto tem ambiente bonito, `'estudio'` se o fundo é liso).
3. Rode o script (instruções no começo do arquivo e no `README.md`, seção "Fotos").
4. Em `src/products/data/products.js`, aponte `images` para `/images/<slug>-1.jpg`, `-2.jpg` e `-3.jpg`.

Dica: se o recorte de alguma peça ficar com falha (auréola, coroa, detalhes finos), mande uma foto maior ou com fundo mais liso e rode o script só para aquele modelo.
