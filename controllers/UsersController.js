import dbClient from '../utils/db.js';
import RedisClient from '../utils/redis';
const sha1 = require('sha1');
const mongo = require('mongodb');

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
      return res.status(201).json({ Id: finishUser.insertedId, email });
    } catch (error) {
      console.error('Error in postUsers:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];
      console.log('Token:', token);
      const key = 'auth_' + token;
      const userId = await RedisClient.get(key);

      if (!userId) {
        console.log('Unauthorized: No userId found');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await dbClient.connect();
      const getUser = await dbClient.db.collection('users').findOne({
        _id: new mongo.ObjectId(userId)
      });

      console.log('User found:', getUser);
      return res.status(200).json({ id: getUser._id, email: getUser.email });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UserController;
