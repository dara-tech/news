import express from 'express';

const app = express();
const PORT = 5002;

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// User login map route (simplified)
app.get('/api/admin/user-logins/map', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        country: 'United States',
        city: 'New York',
        region: 'New York',
        count: 5,
        userCount: 3,
        totalLogins: 5,
        users: [
          { _id: '1', username: 'user1', email: 'user1@example.com' }
        ],
        recentLogins: [
          { username: 'user1', loginTime: new Date(), device: 'desktop', browser: 'Chrome' }
        ]
      }
    ],
    total: 1,
    uniqueUsers: 1
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal test server running on port ${PORT}`);
  console.log(`📊 Test the route: http://localhost:${PORT}/api/admin/user-logins/map`);
}); 