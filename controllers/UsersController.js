import dbClient from '../utils/db.js';
import RedisClient from '../utils/redis';
const sha1 = require('sha1')
const mongo = require('mongodb')

class UserController {
  static async postUsers(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    };
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    };
    const user = await dbClient.client.db().collection('users').findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    };
    const hashed_pw = sha1(password);
    const addedUser = { email, password: hashed_pw };
    const finishUser = await dbClient.client.db().collection('users').insertOne(addedUser);
    return res.status(201).json({ Id: finishUser.insertedId, email })
  }

  static async getMe(req, res) {
    const token = req.headers['x-token']
    console.log(token);
    const key = 'auth_' + token;
    const userId = await RedisClient.get(key);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    // console.log(checkForKey + ' <--- this is the key')
    const getUser = await dbClient.client.db().collection('users').findOne({
      _id: new mongo.ObjectId(userId)
    })
    res.status(200).json({ id: getUser._id, email: getUser.email})
  }
}

module.exports = UserController;
