import { createKeyv } from "@keyv/valkey";

const keyv = createKeyv("redis://localhost:6379");
keyv.on("error", (err) => console.log(err));

export const cacheDb = keyv;
