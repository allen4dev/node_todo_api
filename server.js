require('./config');
require('./db/index');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

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

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.status(200).send({ todo });
    })
    .catch(() => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  const fields = ['text', 'completed'];

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  const body = fields.reduce(
    (obj, field) => ({
      ...obj,
      [field]: req.body[field],
    }),
    {}
  );

  if (typeof body.completed === 'boolean' && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, body, { new: true })
    .then(todo => {
      if (!todo) return res.status(404).send();
      res.status(200).send({ todo });
    })
    .catch(() => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) return res.status(404).send();

      res.status(200).send({ todo });
    })
    .catch(() => {
      res.status(400).send();
    });
});

server.listen(PORT, () => console.log(`Server running in port: ${PORT}`));

module.exports = { app };
