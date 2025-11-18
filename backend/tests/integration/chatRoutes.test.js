import request from 'supertest';
import app from '../../app.js';

describe('Chat Routes', () => {
  it('should return API health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Echo Tree API is running',
    });
  });

  it('should reject unauthenticated chat list request', async () => {
    const response = await request(app).get('/api/chats');
    expect(response.status).toBe(401);
  });
});

