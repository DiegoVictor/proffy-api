import { createClient, RedisClient } from 'redis';
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterAbstract,
  IRateLimiterOptions,
} from 'rate-limiter-flexible';
import ExpressBruteFlexible from 'rate-limiter-flexible/lib/ExpressBruteFlexible';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createClient as mockClient } from 'redis-mock';

import config from '../config/redis';

interface ExpressBruteFlexibleOptions {
  freeRetries: number;
  prefix: string;
  storeClient?: RedisClient;
}

interface ExpressBruteFlexibleLimiter {
  prevent: () => void;
}

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

export function BruteForce(
  opts: ExpressBruteFlexibleOptions,
): ExpressBruteFlexibleLimiter {
  if (process.env.NODE_ENV === 'test') {
    return new ExpressBruteFlexible(
      ExpressBruteFlexible.LIMITER_TYPES.MEMORY,
      opts,
    );
  }

  return new ExpressBruteFlexible(ExpressBruteFlexible.LIMITER_TYPES.REDIS, {
    ...opts,
    storeClient: redis,
  });
}

export default redis;
