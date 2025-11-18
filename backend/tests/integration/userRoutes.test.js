import request from 'supertest';
import app from '../../app.js';

describe('User Routes', () => {
  it('should reject profile access when unauthenticated', async () => {
    const response = await request(app).get('/api/users/123');
    expect(response.status).toBe(401);
  });

  it('should validate registration payload', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ username: '', password: '' });

    expect(response.status).toBe(400);
  });
});

