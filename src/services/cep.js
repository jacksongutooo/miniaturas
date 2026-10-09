/**
 * BUSCA DE ENDEREÇO PELO CEP
 * ----------------------------------------------------------------------------
 * Usa o ViaCEP (gratuito, sem chave). Endpoint configurável em
 * storeConfig.checkout.cepLookup. Se falhar (sem internet, CEP inexistente), o cliente
 * preenche o endereço manualmente — a compra nunca trava por causa disso.
 */

import { storeConfig } from '../config/store.js';
import { onlyDigits } from '../utils/validators.js';

const cache = new Map();

/** @returns {Promise<{street:string, district:string, city:string, state:string}|null>} */
export async function lookupCep(cep) {
  const { enabled, endpoint } = storeConfig.checkout.cepLookup;
  const digits = onlyDigits(cep);
  if (!enabled || digits.length !== 8) return null;
  if (cache.has(digits)) return cache.get(digits);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(endpoint.replace('{cep}', digits), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) {
      cache.set(digits, null);
      return null;
    }
    const result = {
      street: data.logradouro ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
    cache.set(digits, result);
    return result;
  } catch {
    return null;
  }
}
