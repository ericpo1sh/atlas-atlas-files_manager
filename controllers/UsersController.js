import dbClient from '../utils/db.js';
import RedisClient from '../utils/redis';
const sha1 = require('sha1');
const { ObjectId } = require('mongodb');

class UserController {
  static async postUsers(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        console.log('Missing email');
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        console.log('Missing password');
        return res.status(400).json({ error: 'Missing password' });
      }

      await dbClient.connect();
      const user = await dbClient.db.collection('users').findOne({ email });
      if (user) {
        console.log('Already exist');
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashed_pw = sha1(password);
      const addedUser = { email, password: hashed_pw };
      const finishUser = await dbClient.db.collection('users').insertOne(addedUser);

      console.log('User added:', finishUser);
      return res.status(201).json({ id: finishUser.insertedId, email });
    } catch (error) {
      console.error('Error in postUsers:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        console.log('Token not provided');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      const userId = await RedisClient.get(key);

      if (!userId) {
        console.log(`Token not found in Redis: key=${key}`);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`Token found in Redis: key=${key}, userId=${userId}`);

      // Ensure userId is a valid MongoDB ObjectId
      if (!ObjectId.isValid(userId)) {
        console.log(`Invalid ObjectId format: userId=${userId}`);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const objectId = new ObjectId(userId);

      // Debug log for ObjectId conversion
      console.log(`Converted ObjectId: objectId=${objectId}, type=${typeof objectId}, value=${objectId.toHexString()}`);

      // Retrieve user from the database using the ObjectId
      const user = await dbClient.db.collection('users').findOne({ _id: objectId });

      // Debug log for user query result
      console.log(`Query result: user=${JSON.stringify(user)}`);

      if (!user) {
        console.log(`User not found in database: userId=${userId}`);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id.toString(), email: user.email });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UserController;
