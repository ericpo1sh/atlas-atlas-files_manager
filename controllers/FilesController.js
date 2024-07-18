import dbClient from '../utils/db.js';
import RedisClient from '../utils/redis';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

class FilesController {
  static async postUpload(req, res) {
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

      const { name, type, parentId = 0, isPublic = false, data } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const fileDocument = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? '0' : new ObjectId(parentId),
      };

      if (type === 'file' || type === 'image') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const localPath = path.join(folderPath, uuidv4());
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
        fileDocument.localPath = localPath;
      }

      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      fileDocument.id = result.insertedId;
      delete fileDocument._id;

      return res.status(201).json(fileDocument);
    } catch (error) {
      console.error('Error in postUpload:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
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

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      file.id = file._id;
      delete file._id;
      return res.status(200).json(file);
    } catch (error) {
      console.error('Error in getShow:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
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

      const parentId = req.query.parentId || '0';
      const page = parseInt(req.query.page) || 0;
      const pageSize = 20;

      const query = { userId: new ObjectId(userId) };
      if (parentId !== '0') {
        query.parentId = new ObjectId(parentId);
      } else {
        query.parentId = '0';
      }

      const files = await dbClient.db.collection('files')
        .find(query)
        .skip(page * pageSize)
        .limit(pageSize)
        .toArray();

      files.forEach(file => {
        file.id = file._id;
        delete file._id;
      });

      return res.status(200).json(files);
    } catch (error) {
      console.error('Error in getIndex:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
