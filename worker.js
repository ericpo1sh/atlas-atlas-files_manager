const Bull = require('bull');
const dbClient = require('../utils/db');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
    const { userId, fileId } = job.data;

    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId });
    if (!file) throw new Error('File not found');

    const sizes = [100, 250, 500];
    const filePath = file.localPath;

    for (const size of sizes) {
        const thumbnail = await imageThumbnail(filePath, { width: size });
        const thumbnailPath = `${filePath}_${size}`;
        fs.writeFileSync(thumbnailPath, thumbnail);
    }
});
