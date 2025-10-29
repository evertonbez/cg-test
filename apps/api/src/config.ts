const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  redisUrl: process.env.REDIS_URL,
  isDevelopment: process.env.ENVIRONMENT === "development",
};

export default config;
