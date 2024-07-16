const express = require('express');
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = 5000 || process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
