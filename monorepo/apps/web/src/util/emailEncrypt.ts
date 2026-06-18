import crypto from "crypto";

export function emailEncrypt(
  configSettings: { encryptionKey: string; encryptionIV: string },
  emailId: string
): string {
  try {
    // Validate input lengths
    if (configSettings.encryptionKey.length !== 32) {
      throw new Error(
        "Encryption key must be exactly 32 characters long for AES-256"
      );
    }
    if (configSettings.encryptionIV.length !== 16) {
      throw new Error(
        "Encryption IV must be exactly 16 characters long for AES-CBC"
      );
    }
    const keyBytes = Buffer.from(configSettings.encryptionKey, "utf-8");
    const ivBytes = Buffer.from(configSettings.encryptionIV, "utf-8");
    const inputBytes = Buffer.from(emailId, "utf-8");

    console.log("Encryption Key:", configSettings.encryptionKey);
    console.log("Encryption IV:", configSettings.encryptionIV);

    const cipher = crypto.createCipheriv("aes-256-cbc", keyBytes, ivBytes);
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(inputBytes);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString("hex").toUpperCase();
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error; // Re-throw to be handled by caller
  }
}
