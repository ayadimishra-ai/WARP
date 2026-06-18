import { DecryptParams } from "@/types/interface.types";
import { createDecipheriv } from "crypto";

// export function decrypt1(
//   emailId: string,
//   encryptionKey: string,
//   encryptionIV: string
// ): string {
//   try {
//     // Convert hex string to buffer (matches C# byte array conversion)
//     const inputBytes = Buffer.alloc(emailId.length / 2);
//     for (let i = 0; i < emailId.length; i += 2) {
//       inputBytes[i / 2] = parseInt(emailId.substring(i, i + 2), 16);
//     }

//     // Get raw key and IV buffers (must match C# exactly)
//     const keyBytes = Buffer.from(encryptionKey, "utf8");

//     // Handle IV - pad with zeros if too short, truncate if too long
//     const ivBuffer = Buffer.alloc(16, 0); // Initialize 16-byte buffer with zeros
//     const ivSource = Buffer.from(encryptionIV, "utf8");
//     ivSource.copy(ivBuffer, 0, 0, Math.min(ivSource.length, 16));

//     // Create decipher with explicit C# settings
//     const decipher = createDecipheriv("aes-256-cbc", keyBytes, ivBuffer);

//     // Critical C# compatibility settings
//     decipher.setAutoPadding(true); // PKCS7 padding

//     // Perform decryption
//     let decrypted = decipher.update(inputBytes);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);

//     return decrypted.toString("utf8");
//   } catch (error) {
//     console.error("Decryption failed:", {
//       error,
//       input: emailId,
//       keyLength: encryptionKey?.length,
//       ivLength: encryptionIV?.length
//     });
//     return "";
//   }
// }

export function emailDecrypt(params: DecryptParams, emailId: string): string {
  const keyBytes = Buffer.from(params.encryptionKey, "utf8");
  const ivBytes = Buffer.from(params.encryptionIV, "utf8");

  // Convert hex string to buffer
  const inputBytes = Buffer.from(emailId, "hex");

  // Create decipher with AES-256-CBC
  const decipher = createDecipheriv("aes-256-cbc", keyBytes, ivBytes);
  decipher.setAutoPadding(true); // PKCS7 padding (same as PKCS#7 in C#)

  // Decrypt and convert to UTF-8 string
  const decrypted = Buffer.concat([
    decipher.update(inputBytes),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
