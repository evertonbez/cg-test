import Redis, { type RedisOptions } from "ioredis";
import config from "../config.ts";

const { redisUrl, isDevelopment } = config;

const connectionOptions: RedisOptions = {
  enableReadyCheck: true,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  connectTimeout: isDevelopment ? 60000 : 20000,
  commandTimeout: isDevelopment ? 30000 : 15000,
  keepAlive: 30000,
  family: isDevelopment ? 4 : 6,
  autoResendUnfulfilledCommands: true,
  autoResubscribe: true,
  enableOfflineQueue: false,
};

export const redisConnection = new Redis.default(redisUrl!, connectionOptions);

redisConnection.on("connect", () => {
  console.info("Redis connected");
});

redisConnection.on("ready", () => {
  console.info("Redis ready");
});

redisConnection.on("error", (error: Error) => {
  console.error("Redis connection error", error);
});

redisConnection.on("close", () => {
  console.info("Redis connection closed");
});

redisConnection.on("reconnecting", (delay: number) => {
  console.info(`Redis reconnecting in ${delay}ms...`);
});

export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redisConnection.quit();
    console.log("Redis connection closed gracefully");
  } catch (error) {
    console.error("Error closing Redis connection:", error);
    redisConnection.disconnect();
  }
};

export default redisConnection;
