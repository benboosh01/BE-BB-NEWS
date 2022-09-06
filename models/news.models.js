const db = require('../db/connection');

exports.selectTopics = () => {
  let queryStr = `SELECT * FROM topics;`;
  return db.query(queryStr).then(({ rows }) => rows);
};

exports.selectArticle = (article_id) => {
  let queryStr = `
  SELECT a.article_id, a.created_at, a.votes, a.body, a.author, 
  a.title, a.topic, COUNT(c.article_id) AS comment_count 
  FROM articles a 
  LEFT JOIN comments c ON a.article_id = c.article_id
  WHERE a.article_id = $1
  GROUP BY a.article_id
  `;
  const queryVals = [article_id];
  return db.query(queryStr, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'article id not found',
      });
    } else {
      return rows[0];
    }
  });
};

exports.selectUsers = () => {
  let queryStr = `SELECT * FROM users`;
  return db.query(queryStr).then(({ rows }) => rows);
};

exports.updateArticle = (article_id, votes) => {
  if (!votes) {
    return Promise.reject({
      status: 400,
      msg: 'invalid input',
    });
  }
  let queryStr = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
    `;
  const queryVals = [votes, article_id];
  return db.query(queryStr, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'article id not found',
      });
    } else {
      return rows[0];
    }
  });
};
