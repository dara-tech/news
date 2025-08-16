import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';

dotenv.config();

class FacebookTokenManager {
  constructor() {
    this.settings = null;
    this.isRunning = false;
    this.checkInterval = null;
  }

  async connect() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    this.settings = await Settings.getCategorySettings('social-media');
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async checkTokenStatus() {
    try {
      const response = await axios.get(`https://graph.facebook.com/v20.0/me`, {
        params: {
          access_token: this.settings.facebookPageAccessToken,
          fields: 'id,name'
        }
      });
      
      return {
        valid: true,
        pageName: response.data.name,
        pageId: response.data.id
      };
    } catch (error) {
      return {
        valid: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async getTokenInfo() {
    try {
      const response = await axios.get(`https://graph.facebook.com/v20.0/debug_token`, {
        params: {
          input_token: this.settings.facebookPageAccessToken,
          access_token: `${this.settings.facebookAppId}|${this.settings.facebookAppSecret}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  async refreshToken() {
    console.log('🔄 Refreshing Facebook token...');
    
    try {
      // Step 1: Get long-lived user token
      const userTokenResponse = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.settings.facebookAppId,
          client_secret: this.settings.facebookAppSecret,
          fb_exchange_token: this.settings.facebookPageAccessToken
        }
      });
      
      const longLivedUserToken = userTokenResponse.data.access_token;
      console.log('✅ Got long-lived user token');
      
      // Step 2: Get page access token using the correct endpoint
      const pageTokenResponse = await axios.get(`https://graph.facebook.com/v20.0/${this.settings.facebookPageId}`, {
        params: {
          fields: 'access_token',
          access_token: longLivedUserToken
        }
      });
      
      const pageToken = pageTokenResponse.data.access_token;
      console.log('✅ Got page access token');
      
      // Step 3: Get long-lived page token
      const longLivedPageResponse = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.settings.facebookAppId,
          client_secret: this.settings.facebookAppSecret,
          fb_exchange_token: pageToken
        }
      });
      
      const newLongLivedToken = longLivedPageResponse.data.access_token;
      console.log('✅ Got long-lived page token');
      
      // Step 4: Update database
      await Settings.updateCategorySettings('social-media', {
        facebookPageAccessToken: newLongLivedToken
      });
      
      // Step 5: Update local settings
      this.settings = await Settings.getCategorySettings('social-media');
      
      console.log('✅ Token updated in database');
      
      return {
        success: true,
        newToken: newLongLivedToken,
        expiresIn: longLivedPageResponse.data.expires_in
      };
      
    } catch (error) {
      console.error('❌ Failed to refresh token:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️  Token manager is already running');
      return;
    }

    console.log('🚀 Starting Facebook Token Manager...');
    console.log('⏰ Will check token every 24 hours');
    console.log('🔄 Will auto-refresh when ≤10 days left');
    console.log('✅ Auto-posting will never expire!\n');

    this.isRunning = true;

    // Initial check
    await this.performCheck();

    // Set up daily check
    this.checkInterval = setInterval(async () => {
      await this.performCheck();
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('✅ Token manager is now running continuously!');
    console.log('💡 Press Ctrl+C to stop\n');
  }

  async performCheck() {
    try {
      await this.connect();
      
      console.log(`\n🔍 [${new Date().toLocaleString()}] Checking Facebook token...`);
      
      const status = await this.checkTokenStatus();
      
      if (status.valid) {
        console.log('✅ Token is valid');
        
        // Get token info
        const tokenInfo = await this.getTokenInfo();
        const expiresAt = tokenInfo.expires_at;
        
        if (expiresAt) {
          const expiryDate = new Date(expiresAt * 1000);
          const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
          
          console.log(`📅 Token expires in ${daysLeft} days (${expiryDate.toLocaleDateString()})`);
          
          if (daysLeft <= 10) {
            console.log('🔄 Token expires soon, refreshing automatically...');
            const refreshResult = await this.refreshToken();
            
            if (refreshResult.success) {
              console.log('✅ Token refreshed successfully!');
              console.log(`🆕 New expiry: ${refreshResult.expiresIn} seconds`);
            } else {
              console.log('❌ Failed to refresh token automatically');
              console.log('💡 You may need to refresh manually');
            }
          } else {
            console.log('✅ Token is good for a while!');
          }
        }
        
      } else {
        console.log('❌ Token is invalid or expired');
        console.log(`Error: ${status.error}`);
        
        console.log('🔄 Attempting to refresh token...');
        const refreshResult = await this.refreshToken();
        
        if (refreshResult.success) {
          console.log('✅ Token refreshed successfully!');
        } else {
          console.log('❌ Failed to refresh token');
          console.log('💡 You need to generate a new token manually');
        }
      }
      
    } catch (error) {
      console.error('❌ Error in token check:', error.message);
    } finally {
      await this.disconnect();
    }
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Token manager stopped');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down token manager...');
  if (global.tokenManager) {
    global.tokenManager.stopMonitoring();
  }
  process.exit(0);
});

async function main() {
  console.log('🔑 Facebook Token Manager - Never Expire Again!');
  console.log('===============================================\n');
  
  global.tokenManager = new FacebookTokenManager();
  
  try {
    await global.tokenManager.connect();
    
    console.log('📋 Current Configuration:');
    console.log(`App ID: ${global.tokenManager.settings.facebookAppId}`);
    console.log(`Page ID: ${global.tokenManager.settings.facebookPageId}`);
    console.log(`Token Set: ${global.tokenManager.settings.facebookPageAccessToken ? 'Yes' : 'No'}`);
    console.log(`Enabled: ${global.tokenManager.settings.facebookEnabled}\n`);
    
    if (!global.tokenManager.settings.facebookPageAccessToken) {
      console.log('❌ No Facebook token found!');
      console.log('💡 Please get a token first, then run this manager.');
      return;
    }
    
    // Start the monitoring service
    await global.tokenManager.startMonitoring();
    
    // Keep the process running
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Error starting token manager:', error.message);
  }
}

// Run the main function
main();
