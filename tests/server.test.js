const request = require('supertest');
const expect = require('expect');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const Todo = require('./../models/Todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First todo text',
    completed: false,
  },
  {
    _id: new ObjectID(),
    text: 'Second todo text',
    completed: true,
    completedAt: 123,
  },
];

beforeEach(done => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos).then(() => done());
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Todo test text';

    request(app)
      .post('/todos')
      .send({
        text,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull();
      })
      .end(err => {
        if (err) return done(err);

        Todo.find({ text })
          .then(docs => {
            expect(docs.length).toBe(1);
            expect(docs[0].text).toBe(text);
            done();
          })
          .catch(done);
      });
  });

  it('should not create a new todo with invalid data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end(err => {
        if (err) return done(err);

        Todo.find()
          .then(docs => {
            expect(docs.length).toBe(2);
            done();
          })
          .catch(done);
      });
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo when a correct id is passed', done => {
    const id = todos[0]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull();
      })
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    const id = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return 400 for non-object id', done => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update a todo if correct info is passed', done => {
    const id = todos[0]._id.toHexString();
    const text = 'Updated text for todo one';

    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: true,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeDefined();
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(id)
          .then(todo => {
            expect(todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeDefined();
            done();
          })
          .catch(done);
      });
  });

  it('should clear completedAt if todo is not completed', done => {
    const id = todos[1]._id.toHexString();
    const text = 'Updated text for todo 2';

    request(app)
      .patch(`/todos/${id}`)
      .send({ text, completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull();
      })
      .end(err => {
        if (err) return done(err);

        Todo.findById(id)
          .then(todo => {
            expect(todo.text).toBe(text);
            expect(todo.completed).toBe(false);
            expect(todo.completedAt).toBeNull();
            done();
          })
          .catch(done);
      });
  });

  it('should return 400 for non-object id', done => {
    request(app)
      .patch('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    const id = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end(err => {
        if (err) return done(err);

        Todo.findById(id)
          .then(todo => {
            expect(todo).toBeNull();
            done();
          })
          .catch(done);
      });
  });

  it('should return 404 if todo not found', done => {
    const id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if objectID is invalid', done => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});
