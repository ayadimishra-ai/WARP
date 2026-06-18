import { defineConfig } from "drizzle-kit";
import { getServerEnv } from "./src/lib/env/env.server";

const env = await getServerEnv();

export default defineConfig({
  out: "./src/lib/drizzle",
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
