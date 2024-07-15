import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    const uri = process.env.DB_URI;
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;
    this.client.connect().then(() => {
      const database = process.env.DB_DATABASE || 'files_manager';
      this.db = this.client.db(database);
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
    });
  }

  async connect() {
    if (!this.db) {
      await this.client.connect();
      const database = process.env.DB_DATABASE || 'files_manager';
      this.db = this.client.db(database);
    }
  }

  async isAlive() {
    try {
      await this.connect();
      return this.client.topology.isConnected();
    } catch (err) {
      return false;
    }
  }

  async nbUsers() {
    await this.connect();
    const collection = this.db.collection('users');
    const count = await collection.countDocuments();
    return count;
  }

  async nbFiles() {
    await this.connect();
    const collection = this.db.collection('files');
    const count = await collection.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
export default dbClient;
