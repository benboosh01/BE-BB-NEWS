const express = require('express');
const {
  getTopics,
  getArticle,
  getUsers,
  patchArticle,
  getAllArticles,
  getComments,
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
app.get('/api/articles', getAllArticles);
app.get('/api/articles/:article_id/comments', getComments);

app.use(customError);
app.use(psqlErrors);
app.use(serverError);

module.exports = app;
