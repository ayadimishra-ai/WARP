import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerEnv } from "~/utils/env/env.server";

let dbContextSingleton: any = null;

export const GetOPSDBContext = async () => {
  // If dbContextSingleton is already initialized, return the existing context.
  if (!!dbContextSingleton) {
    return dbContextSingleton;
  }

  const env = await getServerEnv();
  const connection_string = env.DATABASE_URL;

  // Create query client and db context
  const queryClient = postgres(connection_string, { max: 15});
  dbContextSingleton = drizzle(queryClient); // Set the singleton instance

  return dbContextSingleton;
};
