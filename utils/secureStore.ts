
// In a real mobile app, you would use native secure storage (like Keychain on iOS or Keystore on Android).
// This is a simplified simulation using XOR encryption for demonstration in a web environment.
const key = 'moonpath-secret-key-for-demonstration';

const encrypt = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  // btoa is used to handle binary data from encryption
  return btoa(result);
};

const decrypt = (encryptedText: string): string => {
  const decodedText = atob(encryptedText);
  let result = '';
  for (let i = 0; i < decodedText.length; i++) {
    const charCode = decodedText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};

export const secureSetItem = (storageKey: string, value: any) => {
  try {
    const stringValue = JSON.stringify(value);
    const encryptedValue = encrypt(stringValue);
    localStorage.setItem(storageKey, encryptedValue);
  } catch (error) {
    console.error(`Error setting secure item for key "${storageKey}":`, error);
  }
};

export const secureGetItem = <T>(storageKey: string, defaultValue: T): T => {
  try {
    const encryptedValue = localStorage.getItem(storageKey);
    if (encryptedValue === null) {
      return defaultValue;
    }
    const decryptedValue = decrypt(encryptedValue);
    return JSON.parse(decryptedValue) as T;
  } catch (error) {
    console.error(`Error getting secure item for key "${storageKey}":`, error);
    // If decryption or parsing fails, return the default value for safety
    return defaultValue;
  }
};