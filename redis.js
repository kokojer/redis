import IORedis from "ioredis";

export const client = new IORedis({
  maxRetriesPerRequest: null,
});
