import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerEnv } from "@/modules/ghg/utils/env/env.server";

let dbContextSingleton: any = null;

export const GetOPSDBContext = async () => {
  // If dbContextSingleton is already initialized, return the existing context.
  if (!!dbContextSingleton) {
    return dbContextSingleton;
  }

  const env = await getServerEnv();
  const connection_string = env.DATABASE_URL;

  const queryClient = postgres(connection_string, {
    max: 5,
    idle_timeout: 30,
    connect_timeout: 20,
    max_lifetime: 60 * 30,
  });
  dbContextSingleton = drizzle(queryClient); // Set the singleton instance

  return dbContextSingleton;
};
