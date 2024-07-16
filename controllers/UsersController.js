import dbClient from '../utils/db.js';
const sha1 = require('sha1')

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
}

module.exports = UserController;
