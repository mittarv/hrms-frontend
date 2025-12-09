import CryptoJS from "crypto-js";

export const decryptAESCBCData = (encryptedBase64) => {
    try {
      const key = import.meta.env
        .VITE_REACT_APP_AES_CBC_32_LENGTH_SYMMETRIC_ENCRYPTION_KEY; // 32 char long key
      const [ivBase64, encryptedDataBase64] = encryptedBase64.split(":"); // split the iv and encrypted data using the special charater " : " put when encrypting
      const iv = CryptoJS.enc.Base64.parse(ivBase64); // parse the iv from base64
      const encryptedData = CryptoJS.enc.Base64.parse(encryptedDataBase64); // parse the encrypted data from base64
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedData },
        CryptoJS.enc.Utf8.parse(key),
        { iv: iv }
      ); // decrypt data
      return decrypted.toString(CryptoJS.enc.Utf8); // return the decrypted data as string
    } catch (error) {
      console.log("Expection : ", error);
    }
  };