import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const loadSecrets = async () => {
  const region = "ap-south-1";
  const stage = process.env.APP_ENV || "local";
  const secretId = `snowkap-op-${stage}`;
  console.log({ secretId });

  const client = new SecretsManagerClient({ region });

  try {
    const res = await client.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );

    if (!res.SecretString) {
      throw new Error("SecretString is empty");
    }

    const secrets = JSON.parse(res.SecretString);

    // Transient injection — lives only for this process
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = String(value);
    }

    console.log(`✅ Secrets loaded for ${stage}`);
    return secrets;
  } catch (err) {
    console.error("❌ Failed to load secrets", err);
    process.exit(1);
  }
};

loadSecrets();

export default loadSecrets;
