require('./config');
require('./db/index');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const Todo = require('./models/Todo');

const { PORT } = process.env;

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => {
      res.status(200).send({ todos });
    })
    .catch(() => res.status(400).send());
});

app.post('/todos', (req, res) => {
  const { text } = req.body;

  const todo = new Todo({ text });

  todo
    .save()
    .then(doc => {
      res.status(200).send({ todo: doc });
    })
    .catch(() => res.status(400).send());
});

server.listen(PORT, () => console.log(`Server running in port: ${PORT}`));

module.exports = { app };
