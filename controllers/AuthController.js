import dbClient from '../utils/db.js';
import RedisClient from '../utils/redis';
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');

class AuthController {
  static async getConnect(req, res) {
    // console.log(req.headers.authorization.split(' '))
    const [auth_type, base64_pw] = req.headers.authorization.split(' ');
      if (!auth_type || auth_type != 'Basic') {
        return res.status(500).json({ error: 'no auth type provided or invalid auth type'})
      }
      const decoded_pw = Buffer.from(base64_pw, 'base64').toString('utf-8');
      // console.log(decoded_pw)
      const [email, password] = decoded_pw.split(':')
      // console.log(email)
      // console.log(password)
      const hashed_pw = sha1(password)
      const searchByPW = await dbClient.client.db().collection('users').findOne({
        email,
        password: hashed_pw
      });
      if (!searchByPW) {
        return res.status(401).json({ error: 'Unauthorized'})
      }
      const token = uuidv4();
      const key = 'auth_' + token;
      const addToRedis = await RedisClient.set(key, searchByPW._id.toString(), 24 * 60 * 60)
      return res.status(200).json({ token })
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token']
    const key = 'auth_' + token;
    const checkForKey = await RedisClient.get(key);
    if (!checkForKey) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    await RedisClient.del(key)
    res.status(204).send()
    console.log('Disconnected Succesfully')
  }
}

module.exports = AuthController;
