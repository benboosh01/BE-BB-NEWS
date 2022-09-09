const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/index');
const sorted = require('jest-sorted');

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe('GET /api/topics', () => {
  test('status 200: responds with object with correct keys', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty('slug');
          expect(topic).toHaveProperty('description');
        });
      });
  });
});

describe('GET /api/articles/:article_id', () => {
  test('status 200: responds with object with correct keys for specific article id', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty('author');
        expect(body.article).toHaveProperty('title');
        expect(body.article).toHaveProperty(
          'article_id',
          1
        );
        expect(body.article).toHaveProperty('body');
        expect(body.article).toHaveProperty('topic');
        expect(body.article).toHaveProperty('created_at');
        expect(body.article).toHaveProperty('votes');
      });
  });
  test('status 404: responds with an error when passed an article_id that does not exist', () => {
    return request(app)
      .get('/api/articles/99')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('article id not found');
      });
  });
  test('status 400: responds with an error when passed an invalid article_id type', () => {
    return request(app)
      .get('/api/articles/notANumber')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid input');
      });
  });
});

describe('GET /api/users', () => {
  test('status: 200: responds with array of objects containing the correct properties', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('avatar_url');
        });
      });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  test('status 200: responds with article updated with newVote quantity', () => {
    const patch = { inc_votes: 10 };
    return request(app)
      .patch('/api/articles/1')
      .send(patch)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: expect.any(String),
            topic: 'mitch',
            author: 'butter_bridge',
            body: expect.any(String),
            created_at: expect.any(String),
            votes: 110,
          })
        );
      });
  });
  test('status 404: responds with an error when article_id does not exist', () => {
    const patch = { inc_votes: 10 };
    return request(app)
      .patch('/api/articles/99')
      .send(patch)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('article id not found');
      });
  });
  test('status 400: responds with an error when passed an invalid article_id type', () => {
    const patch = { inc_votes: 10 };
    return request(app)
      .patch('/api/articles/notANumber')
      .send(patch)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid input');
      });
  });
  test('status 400: responds with an error when inc_votes as an invalid data type', () => {
    const patch = { inc_votes: 'ten' };
    return request(app)
      .patch('/api/articles/1')
      .send(patch)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid input');
      });
  });
  test('status 400: responds with an error if inc_votes not present in request', () => {
    const patch = {};
    return request(app)
      .patch('/api/articles/1')
      .send(patch)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid input');
      });
  });
});

describe('GET /api/articles/:article_id (comment count)', () => {
  test('returns article from specified article_id with correct comment count', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty(
          'comment_count',
          '11'
        );
      });
  });
  test('handles articles with no comments appropriately by including the column and the value 0', () => {
    return request(app)
      .get('/api/articles/10')
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty(
          'comment_count',
          '0'
        );
      });
  });
});

describe('GET /api/articles', () => {
  test('status 200: returns an array of articles with specified keys in descending order by date created', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
        expect(body.articles).toBeSortedBy('created_at', {
          descending: true,
        });
      });
  });
  test('status 200: accepts a query which filters articles by provided topic', () => {
    return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toHaveProperty('topic', 'mitch');
        });
      });
  });
  test('status 404: responds with an error when topic does not exist', () => {
    return request(app)
      .get('/api/articles?topic=aliens')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('aliens not found');
      });
  });
  test('status 404: responds with an empty arrary when no articles for topic however topic does exist', () => {
    return request(app)
      .get('/api/articles?topic=paper')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  test('status 200: returns an array of comments for specified article_id', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(11);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              article_id: 1,
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
        expect(body.comments[0]).toEqual(
          expect.objectContaining({
            article_id: 1,
            comment_id: 2,
            votes: 14,
            created_at: expect.any(String),
            author: 'butter_bridge',
            body: 'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
          })
        );
      });
  });
  test('status 404: responds with error when article_id does not exist', () => {
    return request(app)
      .get('/api/articles/99/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('99 not found');
      });
  });
  test('status 400: responds with an error when article_id is an invalid data type', () => {
    return request(app)
      .get('/api/articles/ten/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('invalid input');
      });
  });
  test('status 200: article exists with no comments', () => {
    return request(app)
      .get('/api/articles/10/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
});

describe('POST /api/articles/:article_id/comments', () => {
  test('status 201: succesfully completes request and responds with the posted comment', () => {
    const postComment = {
      username: 'lurker',
      body: 'I am a comment',
    };
    const response = {
      article_id: 1,
      author: 'lurker',
      body: 'I am a comment',
      comment_id: 19,
      created_at: expect.any(String),
      votes: 0,
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(postComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(response);
      });
  });
  test('status 404: article_id does not exist', () => {
    const postComment = {
      username: 'lurker',
      body: 'I am a comment',
    };
    return request(app)
      .post('/api/articles/99/comments')
      .send(postComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('article id not found');
      });
  });
  test('status 404: username does not exist on the database', () => {
    const postComment = {
      username: 'Imposter',
      body: 'I am a comment',
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(postComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('username not found');
      });
  });
  test('status 400: invalid data type entered for article_id', () => {
    const postComment = {
      username: 'Imposter',
      body: 'I am a comment',
    };
    return request(app)
      .post('/api/articles/ten/comments')
      .send(postComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('invalid input');
      });
  });
  test('status 400: missing comments from request body', () => {
    const postComment = {
      username: 'Imposter',
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(postComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          'missing comments from request'
        );
      });
  });
  test('status 400: missing username from request body', () => {
    const postComment = {
      body: 'I am a comment',
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(postComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          'missing username from request'
        );
      });
  });
});

describe('/api/articles (queries)', () => {
  test('status 200: articles are sorted by specified column', () => {
    return request(app)
      .get('/api/articles?sort_by=author')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('author', {
          descending: true,
        });
      });
  });
  test('status 200: articles are sorted by specified column and by specified order', () => {
    return request(app)
      .get('/api/articles?sort_by=author&order=asc')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('author', {
          descending: false,
        });
      });
  });
  test('status 400: responds with an error if column name not valid', () => {
    return request(app)
      .get('/api/articles?sort_by=notAColumn')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('bad request');
      });
  });
  test('', () => {
    return request(app)
      .get('/api/articles?order=random')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('bad request');
      });
  });
});

describe('DELETE /api/comments/:comment_id', () => {
  test('status 204: comment no longer exists in database', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204)
      .then(() => {
        return db.query(`SELECT * FROM comments`);
      })
      .then(({ rows }) => {
        rows.forEach((row) => {
          expect(row.comment_id).not.toBe(1);
        });
        expect(rows.length).toBe(17);
      })
      .then(() => {
        return db.query(
          `SELECT * FROM comments WHERE comment_id = 1;`
        );
      })
      .then(({ rows }) => {
        expect(rows).toEqual([]);
      });
  });
  test('status 404: responds with error if comment_id does not exist', () => {
    return request(app)
      .delete('/api/comments/99')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('comment id not found');
      });
  });
  test('status 400: responds with error if invalid comment_id data type', () => {
    return request(app)
      .delete('/api/comments/ten')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('invalid input');
      });
  });
});

describe('GET /api', () => {
  test('status 200: returns the JSON file', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toEqual('object');
      });
  });
});
