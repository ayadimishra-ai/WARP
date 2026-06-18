import { defineConfig } from "drizzle-kit";
import { getConnectionString } from "./connection";

const config = async () =>
  defineConfig({
    schema: "./utils/drizzle/schema/*",
    out: "./utils/drizzle/",
    dbCredentials: { url: await getConnectionString() },
    dialect: "postgresql",
    verbose: true,
    strict: true,
  });

export default config;
