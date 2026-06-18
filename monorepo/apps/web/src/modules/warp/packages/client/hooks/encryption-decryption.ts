import * as endec from "crypto";
const algorithm = "aes-256-cbc";
// const key = Buffer.from(String(process.env.ENCRYPT_KEY));
// const iv = Buffer.from(String(process.env.ENCRYPT_IV));
const key = Buffer.from("b14ca5898a4e4133bbce2ea2315a1916");
const iv = Buffer.from("b14ca5898a4e4133");
let returnarray: any = [];
let encrypteddecryptedstring: string = "";
export const encryptionDecryption = () => {
  const encryption = async (encryptDecryptString: string) => {
    returnarray = [];
    try {
      const cipher = endec.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(encryptDecryptString, "utf8", "hex");
      encrypted += cipher.final("hex");
      encrypteddecryptedstring = encrypted;
    } catch (error) {
      console.log("encryption-error", error);
    }
  };
  const bulkencryption = async (encryptDecryptString: any = []) => {
    returnarray = [];
    try {
      for (let i = 0; i < encryptDecryptString.length; i++) {
        const cipher = endec.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(encryptDecryptString[i], "utf8", "hex");
        encrypted += cipher.final("hex");
        returnarray.push({
          email: encryptDecryptString[i],
          encryptedString: encrypted,
        });
      }
    } catch (error) {
      console.log("encryption-error", error);
    }
  };
  const decryption = async (encryptDecryptString: string) => {
    returnarray = [];
    try {
      const decipher = endec.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptDecryptString, "hex", "utf8");
      decrypted += decipher.final("utf8");
      encrypteddecryptedstring = decrypted;
    } catch (error) {
      console.log("decryption-error", error);
    }
  };
  const bulkdecryption = async (encryptDecryptString: any = []) => {
    returnarray = [];
    try {
      for (let i = 0; i < encryptDecryptString.length; i++) {
        const decipher = endec.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptDecryptString[i], "hex", "utf8");
        decrypted += decipher.final("utf8");
        returnarray.push({
          email: encryptDecryptString[i],
          decryptedString: decrypted,
        });
      }
    } catch (error) {
      console.log("decryption-error", error);
    }
  };
  const choosemethod = async (
    encryptDecryptString: any = [],
    method: string
  ) => {
    switch (method.toLowerCase()) {
      case "encrypt":
        encryption(encryptDecryptString);
        return encrypteddecryptedstring;
      case "decrypt":
        decryption(encryptDecryptString);
        return encrypteddecryptedstring;
      case "bulkencrypt":
        bulkencryption(encryptDecryptString);
        return returnarray;
      case "bulkdecrypt":
        bulkdecryption(encryptDecryptString);
        return returnarray;
    }
  };

  const decryptionForMultiple = (encryptDecryptString: string) => {
    returnarray = [];
    try {
      const decipher = endec.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptDecryptString, "hex", "utf8");
      decrypted += decipher.final("utf8");
      encrypteddecryptedstring = decrypted;
    } catch (error) {
      console.log("decryption-error", error);
    }
  };
  const encryptionForMultiple = (encryptDecryptString: string) => {
    returnarray = [];
    try {
      const cipher = endec.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(encryptDecryptString, "utf8", "hex");
      encrypted += cipher.final("hex");
      encrypteddecryptedstring = encrypted;
    } catch (error) {
      console.log("encryption-error", error);
    }
  };
  const choosemethodForMultiple = (
    encryptDecryptString: any = [],
    method: string
  ) => {
    switch (method.toLowerCase()) {
      case "decryptformultiple":
        decryptionForMultiple(encryptDecryptString);
        return encrypteddecryptedstring;
      case "encryptformultiple":
        encryptionForMultiple(encryptDecryptString);
        return encrypteddecryptedstring;
    }
  };
  return { choosemethod, choosemethodForMultiple };
};
