import { storeConfig } from '../config/store.js';

const currency = new Intl.NumberFormat(storeConfig.locale, {
  style: 'currency',
  currency: storeConfig.currency,
});

/** Converte reais (17.9) para centavos inteiros (1790). */
export const toCents = (value) => Math.round(Number(value) * 100);

/** Formata centavos como moeda. 1790 → "R$ 17,90" */
export const money = (cents) => currency.format(cents / 100);

/** Formata reais (number) como moeda. */
export const moneyFromReais = (value) => money(toCents(value));

/** 'AAAA-MM-DD' → '28/09/2026' (sem depender de fuso horário). */
export function formatDate(iso) {
  const [y, m, d] = String(iso).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

/** plural(1, 'item', 'itens') → "1 item" · plural(3, ...) → "3 itens" */
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Remove acentos, deixa minúsculo — usado na busca. "São Bento" → "sao bento" */
export const normalizeText = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
