// const dbconfig = {
//   DB_USER: "developer",
//   DB_PASSWORD: "JbdQceKtoyRq",
//   DB_HOST: "snowkap-op-module-hasura.c4aw5i8qexqs.ap-south-1.rds.amazonaws.com",
//   DB_PORT: 5432,
//   DB_NAME: "snowkap-op-module-hasura",
// };

// const dbconfig = {
//   DB_USER: "beta-user",
//   DB_PASSWORD: "uns9ihamfOH",
//   DB_HOST:
//     "snowkap-beta-op-module-hasura.c4aw5i8qexqs.ap-south-1.rds.amazonaws.com",
//   DB_PORT: 5432,
//   DB_NAME: "snowkap-beta-op-module-hasura",
// };

// const dbconfig = {
//   DB_USER: "demo-user",
//   DB_PASSWORD: "RQxGSwYBDHvt",
//   DB_HOST:
//     "snowkap-demo-op-module-hasura.c4aw5i8qexqs.ap-south-1.rds.amazonaws.com",
//   DB_PORT: 5432,
//   DB_NAME: "snowkap-demo-op-module-hasura",
// };

// const dbconfig = {
//   DB_USER: "live-user",
//   DB_PASSWORD: "jLXRstdKJnrp",
//   DB_HOST:
//     "snowkap-live-op-module-hasura.c4aw5i8qexqs.ap-south-1.rds.amazonaws.com",
//   DB_PORT: 5432,
//   DB_NAME: "snowkap-live-op-module-hasura",
// };

import { getServerEnv } from "../env/env.server";

export const getConnectionString = async () => {
  const env = await getServerEnv();
  return env.DATABASE_URL;
};
