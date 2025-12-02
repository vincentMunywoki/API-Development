const request = require('supertest');
const app = require('./app');
const { User } = require('../models');

describe('Users CRUD', () => {
  let token, userId;

  beforeAll(async () => {
    const loginRes = await request(app).post('/auth/login').send({ email: 'test@user.com', password: 'secure@123' });
    token = loginRes.body.accessToken;
    const newUser = await User.create({ email: 'crud@test.com', password: 'pass@123', name: 'CRUD' });
    userId = newUser.id;
  });

  test('should get users list', async () => {
    const res = await request(app).get('/users?limit=10').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toBeInstanceOf(Array);
  });

  test('should update user', async () => {
    const res = await request(app).put(`/users/${userId}`).set('Authorization', `Bearer ${token}`).send({ name: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  test('should delete user', async () => {
    const res = await request(app).delete(`/users/${userId}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
});