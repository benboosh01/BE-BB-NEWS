const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/index');

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
