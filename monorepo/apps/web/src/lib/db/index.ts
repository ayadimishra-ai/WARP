import { drizzle } from "drizzle-orm/node-postgres";
import { getServerEnv } from "../env/env.server";

// Database connection with lazy initialization
let db: ReturnType<typeof drizzle> | null = null;

export const getDb = async () => {
  if (!db) {
    const env = await getServerEnv();
    db = drizzle(env.DATABASE_URL);
  }
  return db;
};

// Export the async getter as default
export default getDb;
