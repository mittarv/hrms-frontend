// Encryption/decryption utility for sensitive data
// Uses Web Crypto API for production-grade security
// IMPORTANT: Store VITE_ENCRYPTION_KEY in environment variables (.env file)

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

// Validate encryption key on module load
if (!SECRET_KEY) {
  console.error('CRITICAL: VITE_ENCRYPTION_KEY is not set in environment variables!');
}

// Convert hex string to Uint8Array
const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

// Convert Uint8Array to hex string
const bytesToHex = (bytes) => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Base64 encode with URL-safe characters
const encodeBase64Url = (str) => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Base64 decode with URL-safe characters
const decodeBase64Url = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
};

// Simple XOR cipher for obfuscation (fallback for non-crypto operations)
const xorCipher = (str, key) => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

// Cryptographically secure random string generator
const generateSecureRandom = (length = 16) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(36)).join('').substring(0, length);
};

/**
 * Encrypt sensitive data using Web Crypto API (AES-GCM)
 * Falls back to XOR cipher if Web Crypto API is not available
 * @param {string} data - Data to encrypt
 * @returns {Promise<string>} - Encrypted string
 */
export const encryptData = async (data) => {
  try {
    if (!data) return '';
    if (!SECRET_KEY) {
      console.error('Encryption key not available');
      return '';
    }

    // Check if Web Crypto API is available
    if (window.crypto && window.crypto.subtle) {
      // Use AES-GCM for strong encryption
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate a random IV (Initialization Vector)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Import the key
      const keyData = hexToBytes(SECRET_KEY.substring(0, 64)); // Use first 32 bytes (256 bits)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        dataBuffer
      );
      
      // Combine IV + encrypted data
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      // Convert to base64url
      return encodeBase64Url(bytesToHex(combined));
    } else {
      // Fallback to XOR cipher for older browsers
      console.warn('Web Crypto API not available, using fallback encryption');
      const encrypted = xorCipher(data, SECRET_KEY);
      return encodeBase64Url(encrypted);
    }
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypt sensitive data using Web Crypto API (AES-GCM)
 * Falls back to XOR cipher if Web Crypto API is not available
 * @param {string} encryptedData - Encrypted string
 * @returns {Promise<string>} - Decrypted data
 */
export const decryptData = async (encryptedData) => {
  try {
    if (!encryptedData) return '';
    if (!SECRET_KEY) {
      console.error('Decryption key not available');
      return '';
    }

    // Check if Web Crypto API is available
    if (window.crypto && window.crypto.subtle) {
      // Decode from base64url
      const decoded = decodeBase64Url(encryptedData);
      const combined = hexToBytes(decoded);
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encryptedArray = combined.slice(12);
      
      // Import the key
      const keyData = hexToBytes(SECRET_KEY.substring(0, 64)); // Use first 32 bytes (256 bits)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        encryptedArray
      );
      
      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } else {
      // Fallback to XOR cipher for older browsers
      console.warn('Web Crypto API not available, using fallback decryption');
      const decoded = decodeBase64Url(encryptedData);
      return xorCipher(decoded, SECRET_KEY);
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Encrypt sensitive data for URL parameters (legacy - kept for backward compatibility)
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted string
 */
export const encryptUrlParam = (data) => {
  try {
    if (!data) return '';
    const encrypted = xorCipher(data, SECRET_KEY || 'fallback-key');
    return encodeBase64Url(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypt sensitive data from URL parameters (legacy - kept for backward compatibility)
 * @param {string} encryptedData - Encrypted string
 * @returns {string} - Decrypted data
 */
export const decryptUrlParam = (encryptedData) => {
  try {
    if (!encryptedData) return '';
    const decoded = decodeBase64Url(encryptedData);
    return xorCipher(decoded, SECRET_KEY || 'fallback-key');
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Store sensitive payroll context in session storage with encryption
 * @param {object} context - Payroll context data
 * @returns {Promise<string>} - Session key
 */
export const storePayrollContext = async (context) => {
  const sessionKey = `payroll_ctx_${Date.now()}_${generateSecureRandom(16)}`;
  
  const contextData = {
    ...context,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
  };
  
  // Encrypt the context data before storing
  const encryptedData = await encryptData(JSON.stringify(contextData));
  
  sessionStorage.setItem(sessionKey, encryptedData);
  return sessionKey;
};

/**
 * Retrieve payroll context from session storage with decryption
 * @param {string} sessionKey - Session key
 * @returns {Promise<object|null>} - Payroll context or null if expired/not found
 */
export const getPayrollContext = async (sessionKey) => {
  try {
    const encryptedData = sessionStorage.getItem(sessionKey);
    if (!encryptedData) return null;
    
    // Decrypt the context data
    const decryptedData = await decryptData(encryptedData);
    if (!decryptedData) return null;
    
    const context = JSON.parse(decryptedData);
    
    // Check if expired
    if (new Date(context.expiresAt) < new Date()) {
      sessionStorage.removeItem(sessionKey);
      return null;
    }
    
    return context;
  } catch (error) {
    console.error('Error retrieving payroll context:', error);
    return null;
  }
};

/**
 * Clear payroll context from session storage
 * @param {string} sessionKey - Session key
 */
export const clearPayrollContext = (sessionKey) => {
  if (sessionKey) {
    sessionStorage.removeItem(sessionKey);
  }
};

/**
 * Clear all expired payroll contexts from session storage
 */
export const clearExpiredContexts = () => {
  const keysToRemove = [];
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('payroll_ctx_')) {
      keysToRemove.push(key);
    }
  }
  
  // Remove identified keys
  keysToRemove.forEach(key => {
    try {
      const data = sessionStorage.getItem(key);
      if (data) {
        // Try to check if expired (this will be encrypted, so we just remove old ones)
        const timestamp = parseInt(key.split('_')[2]);
        const age = Date.now() - timestamp;
        // Remove if older than 30 minutes
        if (age > 30 * 60 * 1000) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      // If any error, remove the key
      sessionStorage.removeItem(key);
    }
  });
};
