const request = require('supertest');
const mongoose = require('mongoose');

// Import your app (adjust path as needed)
let app;

beforeAll(async () => {
  // Connect to test database
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/news_test';
  await mongoose.connect(mongoUri);
  
  // Import app after database connection
  const { default: expressApp } = await import('../server.mjs');
  app = expressApp;
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

describe('Server Health', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.environment).toBeDefined();
  });

  it('should respond to root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body.message).toBe('News API Server');
    expect(response.body.version).toBeDefined();
  });
});

describe('API Routes', () => {
  it('should handle 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });
});

