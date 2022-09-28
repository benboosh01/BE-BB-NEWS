const db = require('../db/connection');
const { checkExists } = require('../db/seeds/utils');
const fs = require('fs');
const { Cipher } = require('crypto');
const endpoints = require('../endpoints.json');

exports.selectTopics = () => {
  let queryStr = `SELECT * FROM topics;`;
  return db.query(queryStr).then(({ rows }) => rows);
};

exports.selectArticle = (article_id) => {
  const queryStr = `
  SELECT 
  articles.author, 
  articles.title,
  articles.article_id,
  articles.topic,
  articles.created_at,
  articles.votes,
  COUNT(comments.article_id) AS comment_count,
  articles.body
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id;
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
  const queryStr = `
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

exports.selectAllArticles = (topic, sort_by = 'created_at', order = 'DESC') => {
  let queryStr = `
    SELECT 
    articles.author, 
    articles.title,
    articles.article_id,
    articles.topic,
    articles.created_at,
    articles.votes,
    COUNT(comments.article_id) AS comment_count 
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    `;

  const queryVals = [];

  if (topic) {
    queryVals.push(topic);
    queryStr += `WHERE articles.topic = $1`;
  }

  queryStr += `
  GROUP BY articles.article_id`;

  const validOrder = ['ASC', 'DESC'];
  const validColumns = [
    'author',
    'title',
    'article_id',
    'topic',
    'created_at',
    'votes',
    'comment_count',
  ];

  if (
    !validColumns.includes(sort_by) ||
    !validOrder.includes(order.toUpperCase())
  ) {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  queryStr += ` ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return checkExists('topics', 'slug', topic);
    } else {
      return rows;
    }
  });
};

exports.selectComments = (article_id) => {
  const queryStr = `
      SELECT
      article_id,  
      comment_id,
      votes,
      created_at,
      author,
      body
      FROM comments 
      WHERE article_id = $1
      ORDER BY created_at DESC;
    `;

  const queryVals = [article_id];

  return db.query(queryStr, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return checkExists('articles', 'article_id', article_id);
    } else {
      return rows;
    }
  });
};

exports.insertComment = (article_id, comment) => {
  const { username, body } = comment;
  if (!username) {
    return Promise.reject({
      status: 400,
      msg: 'missing username from request',
    });
  } else if (!body) {
    return Promise.reject({
      status: 400,
      msg: 'missing comments from request',
    });
  }
  const queryStr = `
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

exports.removeComment = (comment_id) => {
  const queryStr = `DELETE FROM comments WHERE comment_id = $1 RETURNING *;`;
  const queryVals = [comment_id];
  return db.query(queryStr, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'comment id not found',
      });
    }
  });
};

exports.returnEndpoints = () => {
  return endpoints;
};
