const request = require('supertest');
const app = require('./app');

describe('Permissions', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/auth/login').send({ email: 'test@user.com', password: 'secure@123' });
    token = res.body.accessToken;
  });

  test('should allow access to protected route with token', async () => {
    const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('should deny access without token', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(401);
  });

  test('should deny with invalid token', async () => {
    const res = await request(app).get('/users').set('Authorization', 'Bearer invalid');
    expect(res.statusCode).toBe(403);
  });

  test('should allow own profile update', async () => {
    const res = await request(app).put('/profiles').set('Authorization', `Bearer ${token}`).send({ bio: 'Test bio' });
    expect(res.statusCode).toBe(200);
  });
});