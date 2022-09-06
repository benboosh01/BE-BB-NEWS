const express = require('express');
const {
  getTopics,
  getArticle,
  getUsers,
  patchArticle,
} = require('./controllers/news.controllers');
const {
  customError,
  psqlErrors,
  serverError,
} = require('./controllers/error-handling.controllers');

const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticle);
app.get('/api/users', getUsers);
app.patch('/api/articles/:article_id', patchArticle);

app.use(customError);
app.use(psqlErrors);
app.use(serverError);

module.exports = app;
