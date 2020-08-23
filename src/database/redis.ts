import { createClient, RedisClient } from 'redis';
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterAbstract,
  IRateLimiterOptions,
} from 'rate-limiter-flexible';
import { createClient as mockClient } from 'redis-mock';

import config from '../config/redis';


const redis = (() => {
  if (process.env.NODE_ENV === 'test') {
    return mockClient();
  }

  return createClient(config);
})();

export function RateLimiter(opts: IRateLimiterOptions): RateLimiterAbstract {
  if (process.env.NODE_ENV === 'test') {
    return new RateLimiterMemory(opts);
  }

  return new RateLimiterRedis({ storeClient: redis, ...opts });
}

export default redis;
