import { PasswordEncryptDecryptParams } from "@/types/interface.types";
import { passwordEncrypt } from "@/util/passwordEncrypt";
import { passwordDecrypt } from "@/util/passwordDecrypt";

export async function getPasswordEncryptDecrypt({
  password,
  type
}: PasswordEncryptDecryptParams) {
  try {
    if (type === "encrypt") {
      const encryptedPassword = passwordEncrypt(password);

      return { status200OK: 200, saveresult: encryptedPassword };
    } else if (type === "decrypt") {
      const decryptedPassword = passwordDecrypt(password);

      return { status200OK: 200, saveresult: decryptedPassword };
    }

    return { status200OK: 400, saveresult: "Invalid type parameter" };
  } catch (error) {
    console.error("Password encrypt/decrypt error:", error);
    return {
      status200OK: 500,
      saveresult: "An error occurred while processing the password."
    };
  }
}
