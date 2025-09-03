/**
 * Token Management Service
 * Automatically monitors and refreshes social media tokens
 */

import logger from '../utils/logger.mjs';
import Settings from '../models/Settings.mjs';
import axios from 'axios';

class TokenManager {
  constructor() {
    this.checkInterval = null;
    this.checkFrequency = 24 * 60 * 60 * 1000; // 24 hours
    this.warningThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Start automatic token monitoring
   */
  async start() {
    if (this.checkInterval) {
      logger.warn('Token manager already running');
      return;
    }

    logger.info('🔐 Starting token monitoring service');
    
    // Initial check
    await this.checkAllTokens();
    
    // Schedule regular checks
    this.checkInterval = setInterval(async () => {
      await this.checkAllTokens();
    }, this.checkFrequency);

    logger.info(`Token monitoring scheduled every ${this.checkFrequency / (60 * 60 * 1000)} hours`);
  }

  /**
   * Stop token monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('🔐 Token monitoring service stopped');
    }
  }

  /**
   * Check all platform tokens
   */
  async checkAllTokens() {
    logger.info('🔍 Checking all platform tokens...');
    
    const results = {
      facebook: await this.checkFacebookToken(),
      linkedin: await this.checkLinkedInToken(),
      twitter: await this.checkTwitterToken(),
      telegram: await this.checkTelegramToken()
    };

    const summary = this.generateSummary(results);
    logger.info('📊 Token Status Summary:', summary);

    return results;
  }

  /**
   * Check Facebook token status
   */
  async checkFacebookToken() {
    try {
      const settings = await Settings.getCategorySettings('integrations');
      const token = settings.facebookPageAccessToken;
      
      if (!token) {
        return { status: 'not_configured', message: 'No Facebook token configured' };
      }

      const response = await axios.get(`https://graph.facebook.com/v20.0/debug_token`, {
        params: {
          input_token: token,
          access_token: token
        }
      });

      const tokenData = response.data.data;
      const expiresAt = tokenData.expires_at;
      const now = Math.floor(Date.now() / 1000);

      if (expiresAt === 0) {
        return { status: 'valid', message: 'Token never expires', expiresAt: null };
      }

      const timeUntilExpiry = expiresAt - now;
      const daysUntilExpiry = Math.floor(timeUntilExpiry / (24 * 60 * 60));

      if (timeUntilExpiry <= 0) {
        return { status: 'expired', message: 'Token has expired', expiresAt: new Date(expiresAt * 1000) };
      } else if (timeUntilExpiry <= this.warningThreshold / 1000) {
        return { 
          status: 'expiring_soon', 
          message: `Token expires in ${daysUntilExpiry} days`, 
          expiresAt: new Date(expiresAt * 1000),
          daysUntilExpiry
        };
      } else {
        return { 
          status: 'valid', 
          message: `Token valid for ${daysUntilExpiry} days`, 
          expiresAt: new Date(expiresAt * 1000),
          daysUntilExpiry
        };
      }
    } catch (error) {
      logger.error('Facebook token check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Check LinkedIn token status
   */
  async checkLinkedInToken() {
    try {
      const settings = await Settings.getCategorySettings('integrations');
      const token = settings.linkedinAccessToken;
      
      if (!token) {
        return { status: 'not_configured', message: 'No LinkedIn token configured' };
      }

      const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      return { status: 'valid', message: 'LinkedIn token is valid' };
    } catch (error) {
      if (error.response?.status === 401) {
        return { status: 'expired', message: 'LinkedIn token has expired' };
      }
      logger.error('LinkedIn token check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Check Twitter token status
   */
  async checkTwitterToken() {
    try {
      const settings = await Settings.getCategorySettings('integrations');
      const token = settings.twitterAccessToken;
      
      if (!token) {
        return { status: 'not_configured', message: 'No Twitter token configured' };
      }

      const response = await axios.get('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return { status: 'valid', message: 'Twitter token is valid' };
    } catch (error) {
      if (error.response?.status === 401) {
        return { status: 'expired', message: 'Twitter token has expired' };
      }
      logger.error('Twitter token check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Check Telegram token status
   */
  async checkTelegramToken() {
    try {
      const settings = await Settings.getCategorySettings('integrations');
      const token = settings.telegramBotToken;
      
      if (!token) {
        return { status: 'not_configured', message: 'No Telegram token configured' };
      }

      const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);

      if (response.data.ok) {
        return { status: 'valid', message: 'Telegram token is valid' };
      } else {
        return { status: 'invalid', message: 'Telegram token is invalid' };
      }
    } catch (error) {
      logger.error('Telegram token check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Generate summary of token statuses
   */
  generateSummary(results) {
    const summary = {
      total: Object.keys(results).length,
      valid: 0,
      expiring_soon: 0,
      expired: 0,
      not_configured: 0,
      error: 0
    };

    Object.values(results).forEach(result => {
      summary[result.status] = (summary[result.status] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get detailed token status for admin dashboard
   */
  async getDetailedStatus() {
    const results = await this.checkAllTokens();
    const summary = this.generateSummary(results);

    return {
      summary,
      details: results,
      lastChecked: new Date().toISOString(),
      nextCheck: new Date(Date.now() + this.checkFrequency).toISOString()
    };
  }

  /**
   * Force refresh Facebook token
   */
  async refreshFacebookToken() {
    try {
      logger.info('🔄 Refreshing Facebook token...');
      
      const settings = await Settings.getCategorySettings('integrations');
      const appId = settings.facebookAppId;
      const appSecret = settings.facebookAppSecret;
      const currentToken = settings.facebookPageAccessToken;

      if (!appId || !appSecret || !currentToken) {
        throw new Error('Missing Facebook credentials for token refresh');
      }

      // Step 1: Get long-lived user token
      const userTokenResponse = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: currentToken
        }
      });

      const longLivedToken = userTokenResponse.data.access_token;

      // Step 2: Get page access token
      const pageTokenResponse = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
        params: {
          access_token: longLivedToken
        }
      });

      const pageToken = pageTokenResponse.data.data[0].access_token;

      // Step 3: Update settings
      await Settings.updateCategorySettings('integrations', {
        facebookPageAccessToken: pageToken
      }, 'system');

      logger.info('✅ Facebook token refreshed successfully');
      return { success: true, message: 'Token refreshed successfully' };
    } catch (error) {
      logger.error('❌ Facebook token refresh failed:', error.message);
      return { success: false, message: error.message };
    }
  }
}

export default new TokenManager();
