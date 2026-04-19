const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redisConnectTimeoutMs = Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000);

const client = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: redisConnectTimeoutMs,
  },
});

client.on("error", function (err) {
  throw err;
});

let connectPromise = null;

async function ensureConnection() {
  if (client.isReady) {
    return client;
  }

  if (!connectPromise) {
    connectPromise = client.connect().finally(() => {
      connectPromise = null;
    });
  }

  await connectPromise;
  return client;
}

async function getJsonCache(key) {
  const redisClient = await ensureConnection();
  const value = await redisClient.get(key);
  if (!value) {
    return null;
  }

  return JSON.parse(value);
}

async function setJsonCache(key, value, ttlSeconds = 60) {
  const redisClient = await ensureConnection();
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
  return true;
}

async function deleteCacheKey(key) {
  const redisClient = await ensureConnection();
  return redisClient.del(key);
}

async function deleteCachePattern(pattern) {
  const redisClient = await ensureConnection();
  const keys = [];

  for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    keys.push(key);
  }

  if (keys.length === 0) {
    return 0;
  }

  return redisClient.del(keys);
}

module.exports = {
  client,
  getJsonCache,
  setJsonCache,
  deleteCacheKey,
  deleteCachePattern,
};
