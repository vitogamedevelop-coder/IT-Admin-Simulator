export const HEX_DIGITS = '0123456789ABCDEF';
export const OCTET_BIT_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];

export function decimalToBinary(value, width = 0) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error('Ungültige Dezimalzahl');
  return number.toString(2).padStart(width, '0');
}

export function binaryToDecimal(value) {
  const normalized = String(value).replace(/[\s.]/g, '');
  if (!/^[01]+$/.test(normalized)) throw new Error('Ungültige Binärzahl');
  return Number.parseInt(normalized, 2);
}

export function decimalToHex(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error('Ungültige Dezimalzahl');
  return number.toString(16).toUpperCase();
}

export function hexToDecimal(value) {
  const normalized = String(value).replace(/\s/g, '').toUpperCase();
  if (!/^[0-9A-F]+$/.test(normalized)) throw new Error('Ungültige Hexadezimalzahl');
  return Number.parseInt(normalized, 16);
}

export function binaryToHex(value) {
  const normalized = String(value).replace(/\s/g, '');
  if (!/^[01]+$/.test(normalized)) throw new Error('Ungültige Binärzahl');
  const padded = normalized.padStart(Math.ceil(normalized.length / 4) * 4, '0');
  return padded.match(/.{4}/g).map((group) => HEX_DIGITS[Number.parseInt(group, 2)]).join('');
}

export function hexToBinary(value) {
  const normalized = String(value).replace(/\s/g, '').toUpperCase();
  if (!/^[0-9A-F]+$/.test(normalized)) throw new Error('Ungültige Hexadezimalzahl');
  return [...normalized].map((digit) => decimalToBinary(HEX_DIGITS.indexOf(digit), 4)).join('');
}

export function decimalToOctal(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error('Ungültige Dezimalzahl');
  return number.toString(8);
}

export function octalToDecimal(value) {
  const normalized = String(value).replace(/\s/g, '');
  if (!/^[0-7]+$/.test(normalized)) throw new Error('Ungültige Oktalzahl');
  return Number.parseInt(normalized, 8);
}

export function decimalToIpv4Binary(value) {
  const octets = String(value).split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) throw new Error('Ungültige IPv4-Adresse');
  return octets.map((octet) => decimalToBinary(octet, 8)).join('.');
}

export function ipv4BinaryToDecimal(value) {
  const octets = String(value).trim().split('.');
  if (octets.length !== 4 || octets.some((octet) => !/^[01]{8}$/.test(octet))) throw new Error('Ungültige binäre IPv4-Adresse');
  return octets.map(binaryToDecimal).join('.');
}
