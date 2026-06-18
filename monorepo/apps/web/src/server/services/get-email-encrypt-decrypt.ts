import { EmailEncryptDecryptParams } from "@/types/interface.types";
import { emailEncrypt } from "@/util/emailEncrypt";
import { emailDecrypt } from "@/util/emailDecrypt";
import { getServerEnv } from "@/lib/env/env.server";

export async function getEmailEncryptDecrypt({
  email,
  type
}: EmailEncryptDecryptParams) {
  try {
    const env = await getServerEnv();

    if (type === "encrypt") {
      const encryptedEmail = emailEncrypt(
        {
          encryptionKey: env.ENCRYPTION_KEY,
          encryptionIV: env.ENCRYPTION_IV
        },
        email
      );
      return { status200OK: 200, saveresult: encryptedEmail };
    } else if (type === "decrypt") {
      const decryptedEmail = emailDecrypt(
        {
          encryptionKey: env.ENCRYPTION_KEY,
          encryptionIV: env.ENCRYPTION_IV
        },
        email
      );
      return { status200OK: 200, saveresult: decryptedEmail };
    }
    return { status200OK: 400, saveresult: "Invalid type parameter" };
  } catch (error) {
    console.error("Email encrypt/decrypt error:", error);
    return {
      status200OK: 500,
      saveresult: "An error occurred while processing the email."
    };
  }
}
