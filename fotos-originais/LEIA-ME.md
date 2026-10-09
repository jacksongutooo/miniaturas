# Fotos originais

Aqui ficam as fotos **como foram recebidas**, organizadas em uma pasta por modelo. Nada desta pasta vai para o site: o script `scripts/preparar-fotos.py` lê estes arquivos e gera as imagens finais em `public/images/`.

> As fotos chegaram como **capturas de tela de celular (~739 px de largura)**, com barra de status e faixas pretas. O script recorta isso sozinho, mas a nitidez final tem limite. Com fotos maiores (1500 px ou mais) o resultado fica bem melhor.

## O que tem em cada pasta

| Pasta / arquivo | Nome original (WhatsApp, 09/10/2026) | O que é | Uso |
|---|---|---|---|
| `jesus-sentado/cena.jpeg` | `…at 11.56.33.jpeg` | Jesus sentado na borda do monitor | ✅ gera as 3 fotos |
| `maria-sentada/cena.jpeg` | `…at 11.56.33 (2).jpeg` | Maria sentada | ✅ gera as 3 fotos |
| `sao-jose-sentado/cena.jpeg` | `…at 11.56.33 (1).jpeg` | São José sentado | ✅ gera as 3 fotos |
| `sagrada-familia/cena-escritorio.jpeg` | `…at 11.56.34 (8).jpeg` | José, Jesus e Maria juntos, no monitor | ✅ gera as 3 fotos |
| `sagrada-familia/cena-biblia-com-titulo.jpeg` | `…at 11.56.34 (5).jpeg` | Cena com título escrito por cima | não usada (texto sobre a foto) |
| `sagrada-familia/infografico.jpeg` | `…at 11.56.34 (7).jpeg` | Infográfico do anúncio | referência |
| `espirito-santo/cena.jpeg` | `…at 11.56.34 (1).jpeg` | Pomba branca com raios dourados | ✅ gera as 3 fotos |
| `espirito-santo/cena-com-medidas-do-anuncio.jpeg` | `…at 11.56.34 (3).jpeg` | A mesma peça com as medidas do anúncio (10 × 10 cm) | referência |
| `boneco-de-neve/cena.jpeg` | `…at 11.56.34 (2).jpeg` | Boneco de neve articulado | ✅ gera as 3 fotos |
| `boneco-de-neve/infografico.jpeg` | `…at 11.56.34 (6).jpeg` | Infográfico do anúncio (6 × 4 cm) | referência |
| `boneco-de-neve/infografico-duvidas.jpeg` | `…at 11.56.34 (4).jpeg` | Perguntas e respostas do anúncio | referência |
| `outros/nossos-santos-infografico.jpeg` | `…at 11.56.34.jpeg` | "Nossos Santos": São Bento, Frei Gilson, São José, Jesus, Maria e Santa Teresinha | referência — mostra modelos que ainda **não** estão no catálogo |
| `outros/pagina-do-anuncio-1.jpeg` · `-2` · `-3` | `…at 11.56.35 (1).jpeg` · `(2)` · `.jpeg` | Capturas do anúncio "Mini Jesus Sentado 3D Decorativo 5 cm" | referência (nome, tamanho) |

"Referência" = serviu para conferir nome, tamanho e descrição; não vira foto de produto.

## Como adicionar ou trocar uma foto

1. Coloque a foto em `fotos-originais/<slug-do-modelo>/cena.jpeg` (jpg, png, webp ou heic).
2. Se for um modelo novo, acrescente uma linha em `PRODUTOS` no `scripts/preparar-fotos.py` (slug, nome do arquivo e medidas em cm).
3. Rode o script (instruções no começo do arquivo e no `README.md`, seção "Fotos").
4. Em `src/products/data/products.js`, aponte `images` para `/images/<slug>-1.jpg`, `-2.jpg` e `-3.jpg`.

Dica: a foto de estúdio (`-1`) é a capa do produto. Se o recorte de alguma peça ficar com falha (auréola, coroa, detalhes finos), mande uma foto maior ou com fundo mais liso e rode o script só para aquele modelo.
