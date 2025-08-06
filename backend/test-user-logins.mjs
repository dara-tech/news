import mongoose from "mongoose";
import dotenv from "dotenv";
import UserLogin from "./models/UserLogin.mjs";
import User from "./models/User.mjs";

dotenv.config();

async function testUserLogins() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");

    // Check existing user logins
    const existingLogins = await UserLogin.countDocuments();
    console.log(`📊 Existing user logins: ${existingLogins}`);

    if (existingLogins === 0) {
      console.log("🔧 No user logins found. Creating test data...");
      
      // Get some users to create logins for
      const users = await User.find().limit(5);
      console.log(`👥 Found ${users.length} users`);

      if (users.length === 0) {
        console.log("❌ No users found. Please create users first.");
        return;
      }

      // Create test login data
      const testLogins = [];
      const locations = [
        {
          country: 'United States',
          region: 'New York',
          city: 'New York',
          coordinates: [-74.0060, 40.7128] // [longitude, latitude]
        },
        {
          country: 'United Kingdom',
          region: 'England',
          city: 'London',
          coordinates: [-0.1278, 51.5074] // [longitude, latitude]
        },
        {
          country: 'France',
          region: 'Île-de-France',
          city: 'Paris',
          coordinates: [2.3522, 48.8566] // [longitude, latitude]
        },
        {
          country: 'Germany',
          region: 'Berlin',
          city: 'Berlin',
          coordinates: [13.4050, 52.5200] // [longitude, latitude]
        },
        {
          country: 'Japan',
          region: 'Tokyo',
          city: 'Tokyo',
          coordinates: [139.6503, 35.6762] // [longitude, latitude]
        }
      ];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const location = locations[i % locations.length];
        
        // Create multiple logins for each user
        for (let j = 0; j < 3; j++) {
          const loginTime = new Date(Date.now() - (j * 24 * 60 * 60 * 1000)); // Last 3 days
          
          testLogins.push({
            userId: user._id,
            username: user.username,
            email: user.email,
            loginTime,
            ipAddress: `192.168.1.${100 + i}`,
            location,
            device: ['desktop', 'mobile', 'tablet'][j % 3],
            browser: {
              name: ['Chrome', 'Safari', 'Firefox'][j % 3],
              version: '1.0.0',
              userAgent: 'Mozilla/5.0 (Test Browser)'
            },
            os: {
              name: ['Windows', 'macOS', 'Linux'][j % 3],
              version: '10.0',
              platform: 'desktop'
            },
            loginMethod: 'email',
            success: true,
            securityFlags: []
          });
        }
      }

      // Insert test data
      const result = await UserLogin.insertMany(testLogins);
      console.log(`✅ Created ${result.length} test login records`);
    }

    // Test the map endpoint data
    const mapData = await UserLogin.find({
      success: true,
      'location.coordinates': { $ne: null }
    })
    .populate('userId', 'username email profileImage')
    .sort({ loginTime: -1 })
    .lean();

    console.log(`🗺️ Found ${mapData.length} logins with coordinates`);

    // Group by location
    const locationGroups = {};
    mapData.forEach(login => {
      const [longitude, latitude] = login.location.coordinates;
      const key = `${latitude},${longitude}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          coordinates: { latitude, longitude },
          country: login.location.country,
          city: login.location.city,
          region: login.location.region,
          count: 0,
          users: [],
          recentLogins: []
        };
      }
      
      locationGroups[key].count++;
      
      // Add unique users
      const userExists = locationGroups[key].users.find(u => u._id === login.userId._id);
      if (!userExists) {
        locationGroups[key].users.push({
          _id: login.userId._id,
          username: login.userId.username,
          email: login.userId.email,
          profileImage: login.userId.profileImage
        });
      }
      
      // Add recent logins (max 5 per location)
      if (locationGroups[key].recentLogins.length < 5) {
        locationGroups[key].recentLogins.push({
          username: login.username,
          loginTime: login.loginTime,
          device: login.device,
          browser: login.browser.name
        });
      }
    });

    const finalData = Object.values(locationGroups).map(group => ({
      ...group,
      userCount: group.users.length,
      totalLogins: group.count
    }));

    console.log("🗺️ Map data structure:");
    console.log(JSON.stringify({
      success: true,
      data: finalData,
      total: mapData.length,
      uniqueUsers: new Set(mapData.map(l => l.userId._id.toString())).size
    }, null, 2));

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

testUserLogins(); 