interface RedisConfig {
  host: string;
  port: number;
}

export default {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
} as RedisConfig;
