const request = require('supertest');
const app = require('./app');
const { User } = require('../models');

describe('Auth Endpoints', () => {
  let userData = { email: 'test@user.com', password: 'secure@123', name: 'Test' };

  test('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(userData.email);
  });

  test('should not register duplicate email', async () => {
    const res = await request(app).post('/auth/register').send(userData);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email already in use');
  });

  test('should login with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send({ email: userData.email, password: userData.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  test('should not login with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({ email: userData.email, password: 'wrong' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('should refresh token', async () => {
    const loginRes = await request(app).post('/auth/login').send({ email: userData.email, password: userData.password });
    const refreshToken = loginRes.body.refreshToken;
    const res = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
});