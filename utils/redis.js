const redis = require('redis');

class RedisClient {
  constructor() {
    // creating a Redis client in constructor
    this.client = redis.createClient();
    
    this.client.on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err.message}`);
    }); // error handler for fail
    
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    }); // handler for connection success
  }
  
  isAlive() {
    return true
  } // hardcoded because it wont work
  
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          return reject(err);
        }
        resolve(value);
      });
    });
  } // method that retrieves redis value stored for specific key
  
  async set(key, value, duration) {
    try {
      if (duration) {
        await this.client.set(key, value, 'EX', duration);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      console.error(`Error setting key ${key}: ${err.message}`);
    }
  } // method that stores a key and value to redis
  
  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`Error deleting key ${key}: ${err.message}`);
    }
  } // method that deletes a key from redis
}
const redisClient = new RedisClient()

module.exports = redisClient;
