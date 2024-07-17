const express = require('express');
const route = require('./routes/index');
const bodyParser = require('body-parser');
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = 5000 || process.env.PORT;

app.use(bodyParser.json({ limit: '5gb' }));
app.use('/', route);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app;
