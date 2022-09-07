const db = require('../db/connection');
const { checkExists } = require('../db/seeds/utils');

exports.selectTopics = () => {
  let queryStr = `SELECT * FROM topics;`;
  return db.query(queryStr).then(({ rows }) => rows);
};

exports.selectArticle = (article_id) => {
  let queryStr = `
  SELECT 
  a.author, 
  a.title,
  a.article_id,
  a.topic,
  a.created_at,
  a.votes,
  COUNT(c.article_id) AS comment_count,
  a.body
  FROM articles a 
  LEFT JOIN comments c ON a.article_id = c.article_id
  WHERE a.article_id = $1
  GROUP BY a.article_id;
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

exports.selectAllArticles = (topic) => {
  let queryStr = `
    SELECT 
    a.author, 
    a.title,
    a.article_id,
    a.topic,
    a.created_at,
    a.votes,
    COUNT(c.article_id) AS comment_count 
    FROM articles a 
    LEFT JOIN comments c ON a.article_id = c.article_id
    `;

  const queryVals = [];

  if (topic) {
    queryVals.push(topic);
    queryStr += `WHERE a.topic = $1`;
  }

  queryStr += `
      GROUP BY a.article_id
      ORDER BY a.created_at DESC;`;

  return db.query(queryStr, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return checkExists('topics', 'slug', topic);
    } else {
      return rows;
    }
  });
};

exports.insertComment = (article_id, comment) => {
  const { username, body } = comment;
  let queryStr = `
        INSERT INTO comments (
            article_id,
            author,
            body
        )
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
  const queryVals = [article_id, username, body];
  return db.query(queryStr, queryVals).then(({ rows }) => {
    return rows[0];
  });
};
