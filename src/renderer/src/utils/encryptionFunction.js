import { SECRET_KEY } from "./config.js";
import CryptoJS from "crypto-js";

export function encryptData(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decryptData(encryptedString) {
    const bytes = CryptoJS.AES.decrypt(encryptedString, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}