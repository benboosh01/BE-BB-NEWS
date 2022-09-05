const db = require('../db/connection');

exports.selectTopics = () => {
  let queryStr = `SELECT * FROM topics;`;
  return db.query(queryStr).then(({ rows }) => rows);
};

exports.selectArticle = (article_id) => {
  let queryStr = `SELECT * FROM articles WHERE article_id = $1`;
  let selector = [article_id];
  return db.query(queryStr, selector).then(({ rows }) => {
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
