import { createClient, RedisClientType } from 'redis';

// Creating a typed connection
export const redisdb: RedisClientType = createClient({
  url: 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD // Good practice: use environment variables
});

// Connecting to the Redis server
async function connectRedis(): Promise<void> {
  await redisdb.connect();
  console.log('Successfully connected to Redis');
}
// Error handling
redisdb.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

connectRedis().catch(console.error);