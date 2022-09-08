const express = require('express');
const {
  getTopics,
  getArticle,
  getUsers,
  patchArticle,
  getAllArticles,
  postComment,
  getComments,
  deleteComment,
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
app.post('/api/articles/:article_id/comments', postComment);
app.get('/api/articles/:article_id/comments', getComments);
app.delete('/api/comments/:comment_id', deleteComment);

app.all('*', (req, res) => {
  res.status(404).send({ msg: 'invalid URL' });
});

app.use(customError);
app.use(psqlErrors);
app.use(serverError);

module.exports = app;
