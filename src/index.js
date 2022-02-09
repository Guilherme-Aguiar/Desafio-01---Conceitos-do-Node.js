const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => {
  return user.username === username;
  });

  if(!user) {
    return response.status(400).json({"error": "User does not exists!"})
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const {username, name} = request.body;

  const userRepeated = users.find(user => {
    return user.username === username;
  });

  if (userRepeated) {
    return response.status(400).json({"error": "User already exists!"})
  }

  newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  todoIndex = user.todos.findIndex(todo => {
    return todo.id === id;
  });

  if (todoIndex === -1) {
    return response.status(404).json({"error": "TODO not found"});
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = deadline;

  return response.status(201).json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  todoIndex = user.todos.findIndex(todo => {
    return todo.id === id;
  });

  if (todoIndex === -1) {
    return response.status(404).json({"error": "TODO not found"});
  }

  user.todos[todoIndex].done = true;

  return response.status(201).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  todoIndex = user.todos.findIndex(todo => {
    return todo.id === id;
  });

  if (todoIndex === -1) {
    return response.status(404).json({"error": "TODO not found"});
  }
  
  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;