import * as endec from "crypto";
import { bulkEncryptionDecryptionResult } from "@/modules/ghg/shared/constants/input.constant";
const algorithm = "aes-256-cbc";
// const key = Buffer.from(String(process.env.ENCRYPT_KEY));
// const iv = Buffer.from(String(process.env.ENCRYPT_IV));
const key = Buffer.from("b14ca5898a4e4133bbce2ea2315a1916");
const iv = Buffer.from("b14ca5898a4e4133");
export const encryptionDecryption = () => {
  const encryption = (encryptDecryptString: string) => {
    try {
      const cipher = endec.createCipheriv(
        algorithm as endec.CipherGCMTypes,
        key as endec.CipherKey,
        iv as endec.BinaryLike
      );
      let encrypted = cipher.update(encryptDecryptString, "utf8", "hex");
      encrypted += cipher.final("hex");
      return encrypted;
    } catch (error) {
      console.log("encryption-error", error);
    }
  };
  const bulkencryption = (encryptDecryptString: any = []) => {
    let encryptedData: bulkEncryptionDecryptionResult[] = [];
    try {
      for (let i = 0; i < encryptDecryptString.length; i++) {
        const cipher = endec.createCipheriv(
          algorithm as endec.CipherGCMTypes,
          key as endec.CipherKey,
          iv as endec.BinaryLike
        );
        let encrypted = cipher.update(encryptDecryptString[i], "utf8", "hex");
        encrypted += cipher.final("hex");
        encryptedData.push({
          email: encryptDecryptString[i],
          encryptedString: encrypted,
        });
      }
      return encryptedData;
    } catch (error) {
      console.log("encryption-error", error);
    }
  };
  const decryption = (encryptDecryptString: string) => {
    try {
      const decipher = endec.createDecipheriv(
        algorithm as endec.CipherGCMTypes,
        key as endec.CipherKey,
        iv as endec.BinaryLike
      );
      let decrypted = decipher.update(encryptDecryptString, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      console.log("decryption-error", error);
    }
  };
  const bulkdecryption = (encryptDecryptString: any = []) => {
    let decryptedDate: bulkEncryptionDecryptionResult[] = [];
    try {
      for (let i = 0; i < encryptDecryptString.length; i++) {
        const decipher = endec.createDecipheriv(
          algorithm as endec.CipherGCMTypes,
          key as endec.CipherKey,
          iv as endec.BinaryLike
        );
        let decrypted = decipher.update(encryptDecryptString[i], "hex", "utf8");
        decrypted += decipher.final("utf8");
        decryptedDate.push({
          email: encryptDecryptString[i],
          decryptedString: decrypted,
        });
      }
      return decryptedDate;
    } catch (error) {
      console.log("decryption-error", error);
    }
  };
  const choosemethod = (
    encryptDecryptString: string | string[] = [],
    method: string
  ) => {
    switch (method.toLowerCase()) {
      case "encrypt":
        return encryption(encryptDecryptString as string);
      case "decrypt":
        return decryption(encryptDecryptString as string);
      case "bulkencrypt":
        return bulkencryption(encryptDecryptString);
      case "bulkdecrypt":
        return bulkdecryption(encryptDecryptString);
    }
  };
  return { choosemethod };
};
