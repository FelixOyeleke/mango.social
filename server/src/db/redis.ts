let createClient: any;
let hasRedis = true;

try {
  ({ createClient } = await import('redis'));
} catch (error) {
  hasRedis = false;
  console.warn('Redis client not installed or failed to load. Caching will be disabled.');
}

const redisClient =
  hasRedis && createClient
    ? createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              console.error('Redis: Too many reconnection attempts');
              return new Error('Redis reconnection failed');
            }
            return retries * 100;
          },
        },
      })
    : {
        connect: async () => undefined,
        on: () => undefined,
        get: async () => null,
        set: async () => undefined,
        setEx: async () => undefined,
        del: async () => undefined,
        keys: async () => [],
        incr: async () => undefined,
      } as any;

redisClient.on?.('error', (err: unknown) => {
  console.error('Redis Client Error:', err);
});

redisClient.on?.('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on?.('reconnecting', () => {
  console.log('Redis reconnecting...');
});

let isConnected = false;

export async function connectRedis() {
  if (!isConnected && hasRedis) {
    try {
      await redisClient.connect();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      hasRedis = false;
    }
  }
  return redisClient;
}

export class CacheService {
  private client = redisClient;
  private enabled = hasRedis;

  constructor() {
    redisClient.on?.('error', () => {
      this.enabled = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.enabled) return;
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, data);
      } else {
        await this.client.set(key, data);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string | string[]): Promise<void> {
    if (!this.enabled) return;
    try {
      if (Array.isArray(key)) {
        await this.client.del(key);
      } else {
        await this.client.del(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async getTrending() {
    return this.get<any[]>('trending:topics');
  }

  async setTrending(data: any[], ttl = 300) {
    await this.set('trending:topics', data, ttl);
  }

  async getCommunityStats() {
    return this.get<any>('stats:community');
  }

  async setCommunityStats(data: any, ttl = 600) {
    await this.set('stats:community', data, ttl);
  }

  async getSuggestedUsers() {
    return this.get<any[]>('suggested:users');
  }

  async setSuggestedUsers(data: any[], ttl = 900) {
    await this.set('suggested:users', data, ttl);
  }

  async getStory(id: string) {
    return this.get<any>(`story:${id}`);
  }

  async setStory(id: string, data: any, ttl = 300) {
    await this.set(`story:${id}`, data, ttl);
  }

  async invalidateStory(id: string) {
    await this.del(`story:${id}`);
  }

  async incrementViews(storyId: string): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.client.incr(`views:${storyId}`);
    } catch (error) {
      console.error('View increment error:', error);
    }
  }

  async getViewCounts(): Promise<Record<string, number>> {
    if (!this.enabled) return {};
    try {
      const keys = await this.client.keys('views:*');
      const counts: Record<string, number> = {};
      for (const key of keys) {
        const storyId = key.replace('views:', '');
        const count = await this.client.get(key);
        counts[storyId] = parseInt(count || '0');
      }
      return counts;
    } catch (error) {
      console.error('Get view counts error:', error);
      return {};
    }
  }
}

export const cache = new CacheService();
export { redisClient };
