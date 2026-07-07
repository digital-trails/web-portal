import CryptoJS from 'crypto-js';


export function md5Hash(input: string): string {
  return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
}

export const isDebug = window.location.origin.includes('localhost');

export const apiBaseUrl = isDebug ? '' : 'https://api.digital-trails.org';