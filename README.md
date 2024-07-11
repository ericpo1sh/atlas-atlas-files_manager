This project is a summary of this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

The objective is to build a simple platform to upload and view files:

- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

You will be guided step by step for building it, but you have some freedoms of implementation, split in more files etc… (`utils` folder will be your friend)

Of course, this kind of service already exists in the real life - it’s a learning purpose to assemble each piece and build a full product.

## Resources

**Read or watch**:

- [Node JS getting started](https://intranet.atlasschool.com/rltoken/oEu9lnRvNFYjRQW7KWjlXg)
- [Process API doc](https://intranet.atlasschool.com/rltoken/kyikU0Dq0L4Fbu1mIq8b8g)
- [Express getting started](https://intranet.atlasschool.com/rltoken/s9AVGonr-ECiLBxlS2SoWg)
- [Mocha documentation](https://intranet.atlasschool.com/rltoken/mTbxL6CHiCbYFRT-p5X_nQ)
- [Nodemon documentation](https://intranet.atlasschool.com/rltoken/p7edI8ByqoQOzdZ8r5gJyQ)
- [MongoDB](https://intranet.atlasschool.com/rltoken/Y1ll4M-Zd6NVe0_W9I8qqg)
- [Bull](https://intranet.atlasschool.com/rltoken/7Lgu2iCrCCm-qIYE7qSXug)
- [Image thumbnail](https://intranet.atlasschool.com/rltoken/XQIysBsLcTwWb5t_JpDv2g)
- [Mime-Types](https://intranet.atlasschool.com/rltoken/8t524seEbDRstwFn1pG8JA)
- [Redis](https://intranet.atlasschool.com/rltoken/leC5w0po5bWcvUW2H2o8Pw)

## Learning Objectives

At the end of this project, you are expected to be able to [explain to anyone](https://intranet.atlasschool.com/rltoken/rKNXYH0WbMKb51_h4XifOw), **without the help of Google**:

- how to create an API with Express
- how to authenticate a user
- how to store data in MongoDB
- how to store temporary data in Redis
- how to setup and use a background worker

## How to create an API with Express

Creating an API with Express, a popular Node.js framework, involves several steps. Here's a simple guide to get you started:

### 1. Setup Your Project

1. **Initialize a new Node.js project:**
    
    ```bash
    mkdir my-express-api
    cd my-express-api
    npm init -y
    ```
    
2. **Install Express:**
    
    ```bash
    npm install express
    ```
    

### 2. Create Your Express Server

1. **Create a new file named `app.js`:**
    
    ```jsx
    // app.js
    const express = require('express');
    const app = express();
    const port = 3000;
    
    // Middleware to parse JSON bodies
    app.use(express.json());
    
    // Simple route
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    ```
    
2. **Run your server:**
    
    ```bash
    node app.js
    ```
    
    You should see `Server is running on http://localhost:3000` in your terminal. Open a browser and go to `http://localhost:3000` to see "Hello World!".
    

### 3. Define API Routes

1. **Create additional routes for your API in `app.js`:**
    
    ```jsx
    // app.js
    const express = require('express');
    const app = express();
    const port = 3000;
    
    app.use(express.json());
    
    // Sample data
    let items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    
    // GET all items
    app.get('/api/items', (req, res) => {
      res.json(items);
    });
    
    // GET item by id
    app.get('/api/items/:id', (req, res) => {
      const item = items.find(i => i.id === parseInt(req.params.id));
      if (!item) return res.status(404).send('Item not found');
      res.json(item);
    });
    
    // POST create a new item
    app.post('/api/items', (req, res) => {
      const item = {
        id: items.length + 1,
        name: req.body.name
      };
      items.push(item);
      res.status(201).json(item);
    });
    
    // PUT update an item
    app.put('/api/items/:id', (req, res) => {
      const item = items.find(i => i.id === parseInt(req.params.id));
      if (!item) return res.status(404).send('Item not found');
      item.name = req.body.name;
      res.json(item);
    });
    
    // DELETE an item
    app.delete('/api/items/:id', (req, res) => {
      const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));
      if (itemIndex === -1) return res.status(404).send('Item not found');
      items.splice(itemIndex, 1);
      res.status(204).send();
    });
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    })
    ```
    

### 4. Test Your API

You can test your API using tools like [Postman](https://www.postman.com/) or [cURL](https://curl.se/).

- **Get all items:**
    
    ```bash
    curl http://localhost:3000/api/items
    ```
    
- **Get a single item by ID:**
    
    ```bash
    curl http://localhost:3000/api/items/1
    ```
    
- **Create a new item:**
    
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"name": "NewItem"}' http://localhost:3000/api/items
    ```
    
- **Update an item:**
    
    ```bash
    curl -X PUT -H "Content-Type: application/json" -d '{"name": "UpdatedItem"}' http://localhost:3000/api/items/1
    ```
    
- **Delete an item:**
    
    ```bash
    curl -X DELETE http://localhost:3000/api/items/1
    ```
    

## How to authenticate a user

To authenticate a user in an Express API, you typically use middleware to handle the authentication logic. A common approach involves using JSON Web Tokens (JWT) for stateless authentication. Here's a step-by-step guide to implement user authentication using JWT in an Express app:

### 1. Setup Your Project

If you haven't already, initialize a Node.js project and install the necessary packages:

```bash
npm init -y
npm install express jsonwebtoken bcryptjs
```

### 2. Create Your Express Server

1. **Create a new file named `app.js`:**
    
    ```jsx
    const express = require('express');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');
    
    const app = express();
    const port = 3000;
    
    // Middleware to parse JSON bodies
    app.use(express.json());
    
    // Secret key for JWT (in a real application, store this securely)
    const jwtSecret = 'your_jwt_secret';
    
    // Sample users (in a real application, use a database)
    let users = [
      {
        id: 1,
        username: 'user1',
        password: bcrypt.hashSync('password1', 8) // hashed password
      }
    ];
    
    // Register route
    app.post('/api/register', (req, res) => {
      const { username, password } = req.body;
      const hashedPassword = bcrypt.hashSync(password, 8);
    
      const user = {
        id: users.length + 1,
        username,
        password: hashedPassword
      };
    
      users.push(user);
      res.status(201).send('User registered');
    });
    
    // Login route
    app.post('/api/login', (req, res) => {
      const { username, password } = req.body;
      const user = users.find(u => u.username === username);
    
      if (!user) return res.status(404).send('User not found');
      if (!bcrypt.compareSync(password, user.password)) return res.status(401).send('Invalid password');
    
      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: 86400 }); // 24 hours
      res.status(200).json({ auth: true, token });
    });
    
    // Middleware to verify token
    const verifyToken = (req, res, next) => {
      const token = req.headers['x-access-token'];
      if (!token) return res.status(403).send('No token provided');
    
      jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token');
        req.userId = decoded.id;
        next();
      });
    };
    
    // Protected route
    app.get('/api/me', verifyToken, (req, res) => {
      const user = users.find(u => u.id === req.userId);
      if (!user) return res.status(404).send('User not found');
      res.status(200).json(user);
    });
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    ```
    

### 3. Test Your Authentication

You can test your authentication system using Postman or cURL.

- **Register a new user:**
    
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"username": "newuser", "password": "newpassword"}' http://localhost:3000/api/register
    ```
    
- **Login a user:**
    
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"username": "newuser", "password": "newpassword"}' http://localhost:3000/api/login
    ```
    
    The response will include a JWT token.
    
- **Access a protected route:**
    
    ```bash
    curl -H "x-access-token: YOUR_JWT_TOKEN" http://localhost:3000/api/me
    ```
    

### 4. Secure Your Application

For a production application, consider the following:

- Store JWT secret securely, for example, in environment variables.
- Use HTTPS to secure data transmission.
- Implement more robust error handling and logging.
- Use a database to store users and passwords securely.
- Implement additional security measures, such as rate limiting and input validation.

This is a basic implementation to get you started with user authentication using Express and JWT.

## How to store data in MongoDB

Storing data in MongoDB from an Express application involves a few steps, including setting up MongoDB, connecting to it from your Node.js application, and performing CRUD (Create, Read, Update, Delete) operations. Here’s a guide to get you started:

### 1. Set Up MongoDB

If you don’t have MongoDB installed, you can download and install it from the [official MongoDB website](https://www.mongodb.com/try/download/community). Alternatively, you can use a cloud-hosted MongoDB service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 2. Install Required Packages

You’ll need the `mongoose` package to interact with MongoDB:

```bash
npm install mongoose
```

### 3. Connect to MongoDB

Create a new file named `app.js` and set up the connection to MongoDB:

```jsx
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema and model
const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);

// Routes

// Create a new item
app.post('/api/items', async (req, res) => {
  const newItem = new Item({ name: req.body.name });
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get item by ID
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send('Item not found');
    res.json(item);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update an item
app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!updatedItem) return res.status(404).send('Item not found');
    res.json(updatedItem);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).send('Item not found');
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

### 4. Test Your Application

Use Postman or cURL to test your API endpoints:

- **Create a new item:**
    
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"name": "NewItem"}' http://localhost:3000/api/items
    ```
    
- **Get all items:**
    
    ```bash
    curl http://localhost:3000/api/items
    ```
    
- **Get a single item by ID:**
    
    ```bash
    curl http://localhost:3000/api/items/ITEM_ID
    ```
    
- **Update an item:**
    
    ```bash
    curl -X PUT -H "Content-Type: application/json" -d '{"name": "UpdatedItem"}' http://localhost:3000/api/items/ITEM_ID
    ```
    
- **Delete an item:**
    
    ```bash
    curl -X DELETE http://localhost:3000/api/items/ITEM_ID
    ```
    

### Notes

1. **Database Connection String:** Replace `'mongodb://localhost:27017/mydatabase'` with your actual MongoDB connection string if you’re using a cloud service like MongoDB Atlas.
2. **Error Handling:** Enhance error handling for production applications.
3. **Environment Variables:** Store sensitive information like the MongoDB URI in environment variables.

This setup gives you a basic Express API connected to a MongoDB database, allowing you to perform CRUD operations.

## How to store temporary data in Redis

Storing temporary data in Redis can be beneficial for caching, session management, and other scenarios where you need fast access to transient data. Here's how you can set up and use Redis with an Express application.

### 1. Install Redis

If you haven't already, install Redis on your system:

- **On macOS using Homebrew:**
    
    ```bash
    brew install redis
    brew services start redis
    ```
    
- **On Ubuntu:**
    
    ```bash
    sudo apt update
    sudo apt install redis-server
    sudo systemctl enable redis-server.service
    sudo systemctl start redis-server.service
    ```
    

Alternatively, you can use a cloud-hosted Redis service like [Redis Labs](https://redislabs.com/).

### 2. Install Redis Client for Node.js

You need to install a Redis client for Node.js. `redis` is a popular choice:

```bash
npm install redis
```

### 3. Connect to Redis

Create or update your `app.js` to include Redis connection and usage:

```jsx
const express = require('express');
const redis = require('redis');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Create a Redis client
const redisClient = redis.createClient();

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Routes

// Set data in Redis
app.post('/api/cache', (req, res) => {
  const { key, value } = req.body;
  // Set key-value pair with an expiration time (in seconds)
  redisClient.setex(key, 3600, value); // Expires in 1 hour
  res.send('Data cached');
});

// Get data from Redis
app.get('/api/cache/:key', (req, res) => {
  const key = req.params.key;
  redisClient.get(key, (err, value) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (value) {
      res.send(value);
    } else {
      res.status(404).send('Key not found');
    }
  });
});

// Delete data from Redis
app.delete('/api/cache/:key', (req, res) => {
  const key = req.params.key;
  redisClient.del(key, (err, response) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (response === 1) {
      res.send('Key deleted');
    } else {
      res.status(404).send('Key not found');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

### 4. Test Your Redis Integration

You can use Postman or cURL to test your Redis integration:

- **Set data in Redis:**
    
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"key": "myKey", "value": "myValue"}' http://localhost:3000/api/cache
    ```
    
- **Get data from Redis:**
    
    ```bash
    curl http://localhost:3000/api/cache/myKey
    ```
    
- **Delete data from Redis:**
    
    ```bash
    curl -X DELETE http://localhost:3000/api/cache/myKey
    ```
    

### Notes

1. **Error Handling:** Enhance error handling for production applications.
2. **Environment Variables:** Store sensitive information like Redis connection details in environment variables.
3. **Security:** Ensure your Redis instance is secured, especially if it's exposed to the internet. Use authentication and secure connections.

By following these steps, you can integrate Redis into your Express application for efficient temporary data storage and retrieval.

## How to setup and use a background worker

Setting up and using a background worker in a Node.js application can be beneficial for offloading time-consuming tasks to run asynchronously. This can improve the performance and responsiveness of your main application. A popular library for managing background jobs in Node.js is Bull, which works well with Redis for storing job queues.

### Steps to Set Up and Use a Background Worker with Bull

### 1. Install Required Packages

First, you need to install Bull and Redis:

```bash
npm install bull redis
```

### 2. Create a Job Queue

Create a file named `jobQueue.js` to set up your job queue:

```jsx
const Queue = require('bull');
const redisClient = require('redis').createClient();

// Create a queue named 'taskQueue'
const taskQueue = new Queue('taskQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
});

// Define a simple task processor
taskQueue.process(async (job) => {
  // Simulate a time-consuming task
  console.log(`Processing job ${job.id} with data:`, job.data);
  await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay
  console.log(`Job ${job.id} completed`);
});

module.exports = taskQueue;
```

### 3. Create an Express Server to Add Jobs to the Queue

Create or update your `app.js` to include endpoints for adding jobs to the queue:

```jsx
const express = require('express');
const taskQueue = require('./jobQueue');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to add a job to the queue
app.post('/api/task', (req, res) => {
  const taskData = req.body;
  taskQueue.add(taskData);
  res.send('Task added to the queue');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

### 4. Run Your Background Worker

To run the background worker, you can create a separate file named `worker.js` and require the `jobQueue.js` file. This way, you can start your worker independently of your main application.

```jsx
const taskQueue = require('./jobQueue');

console.log('Worker is running and waiting for jobs...');
```

### 5. Start Your Application and Worker

You need to run your main application and the worker process separately:

- **Start the Express server:**
    
    ```bash
    node app.js
    ```
    
- **Start the worker:**
    
    ```bash
    node worker.js
    ```
    

### 6. Test the Background Worker

You can use Postman or cURL to test adding jobs to the queue:

- **Add a task to the queue:**
    
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"task": "exampleTask", "details": "This is a test task"}' http://localhost:3000/api/task
    ```
    

### Additional Notes

1. **Error Handling:** Enhance error handling in your job processing logic.
2. **Concurrency:** Bull allows you to configure concurrency, so you can process multiple jobs in parallel.
3. **Persistence:** Redis stores the state of your jobs, so they can survive restarts.
4. **Monitoring:** Bull provides a UI for monitoring jobs, which can be useful for debugging and managing jobs.
5. **Environment Variables:** Store sensitive information like Redis connection details in environment variables.

This setup provides a basic framework for using background workers in a Node.js application with Bull and Redis. You can extend this to handle more complex use cases and integrate it with other parts of your application.
