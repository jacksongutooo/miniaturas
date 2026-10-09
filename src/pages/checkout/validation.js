/**
 * Validação por etapa do checkout. Cada função devolve { campo: 'mensagem' } (vazio = válido).
 */

import { storeConfig } from '../../config/store.js';
import {
  isValidCep,
  isValidCpf,
  isValidEmail,
  isValidFullName,
  isValidPhone,
  STATES,
} from '../../utils/validators.js';

export function validatePersonal(f) {
  const e = {};
  if (!isValidFullName(f.name)) e.name = 'Digite seu nome e sobrenome.';
  if (!isValidEmail(f.email)) e.email = 'Digite um e-mail válido, como nome@email.com.';
  if (!isValidPhone(f.phone)) e.phone = 'Digite um telefone com DDD, como (11) 91234-5678.';
  if (storeConfig.checkout.requireCpf && !isValidCpf(f.cpf)) e.cpf = 'Digite um CPF válido.';
  return e;
}

export function validateAddress(f) {
  const e = {};
  if (!isValidCep(f.cep)) e.cep = 'Digite um CEP com 8 números.';
  if (f.street.trim().length < 3) e.street = 'Digite o nome da rua.';
  if (!f.noNumber && f.number.trim() === '') e.number = 'Digite o número ou marque “Sem número”.';
  if (f.district.trim().length < 2) e.district = 'Digite o bairro.';
  if (f.city.trim().length < 2) e.city = 'Digite a cidade.';
  if (!STATES.some(([uf]) => uf === f.state)) e.state = 'Selecione o estado.';
  return e;
}

export function validateShipping(f) {
  return f.shippingId ? {} : { shippingId: 'Escolha uma forma de entrega.' };
}

export function validatePayment(f) {
  const methods = storeConfig.checkout.paymentMethods.map((m) => m.id);
  return methods.includes(f.paymentMethod) ? {} : { paymentMethod: 'Escolha uma forma de pagamento.' };
}
