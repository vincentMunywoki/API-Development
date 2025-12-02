const request = require('supertest');
const app = require('./app');
const { Post, User } = require('../models');

describe('Posts CRUD', () => {
  let token, postId, userId;

  beforeAll(async () => {
    const user = await User.findOne({ where: { email: 'test@user.com' } });
    userId = user.id;
    const loginRes = await request(app).post('/auth/login').send({ email: 'test@user.com', password: 'secure@123' });
    token = loginRes.body.accessToken;
    const newPost = await Post.create({ title: 'Test Post', content: 'Content', userId });
    postId = newPost.id;
  });

  test('should create post', async () => {
    const res = await request(app).post('/posts').set('Authorization', `Bearer ${token}`).send({ title: 'New Post', content: 'New', userId });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('New Post');
  });

  test('should get posts list with pagination', async () => {
    const res = await request(app).get('/posts?limit=5&offset=0').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toBeInstanceOf(Array);
  });

  test('should delete post', async () => {
    const res = await request(app).delete(`/posts/${postId}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
});