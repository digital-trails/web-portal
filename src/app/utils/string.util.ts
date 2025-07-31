import CryptoJS from 'crypto-js';


export function md5Hash(input: string): string {
  return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
}

