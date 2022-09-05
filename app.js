const express = require('express');
const {
  getTopics,
  getArticle,
  getUsers,
} = require('./controllers/news.controllers');
const {
  customError,
  psqlErrors,
  serverError,
} = require('./error-handling');

const app = express();

app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticle);
app.get('/api/users', getUsers);

app.use(customError);
app.use(psqlErrors);
app.use(serverError);

module.exports = app;
