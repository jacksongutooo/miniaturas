// Catálogo mínimo, só para testar as regras de preço e de frete.
// Não depende dos modelos reais da loja (src/products/data/products.js): trocar nomes ou
// preços lá não quebra estes testes. Os modelos 1 a 4 custam R$ 17,90 (miniatura padrão);
// o 9 é um conjunto de R$ 43,90.
const table = new Map([
  [1, { id: 1, name: 'Modelo A', price: 17.9 }],
  [2, { id: 2, name: 'Modelo B', price: 17.9 }],
  [3, { id: 3, name: 'Modelo C', price: 17.9 }],
  [4, { id: 4, name: 'Modelo D', price: 17.9 }],
  [9, { id: 9, name: 'Conjunto', price: 43.9 }],
]);

export const getProduct = (id) => table.get(Number(id));
