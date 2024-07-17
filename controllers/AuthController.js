import dbClient from '../utils/db.js';
import RedisClient from '../utils/redis';
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const [authType, base64Credentials] = authHeader.split(' ');
      if (!authType || authType !== 'Basic') {
        return res.status(401).json({ error: 'Invalid authentication type' });
      }

      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [email, password] = decodedCredentials.split(':');
      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hashedPassword = sha1(password);
      
      // Debug log to ensure we are looking up the correct credentials
      console.log(`Looking up user: email=${email}, password=${hashedPassword}`);
      
      // Check for user in the database
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
      
      // If no user is found, return unauthorized
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await RedisClient.set(key, user._id.toString(), 24 * 60 * 60); // Store for 24 hours

      console.log(`Token stored in Redis: key=${key}, userId=${user._id.toString()}`);

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      const userId = await RedisClient.get(key);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await RedisClient.del(key);
      console.log('Disconnected Successfully');
      return res.status(204).send();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
