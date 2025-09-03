import Settings from '../models/Settings.mjs';
import axios from 'axios';
import RateLimitManager from './rateLimitManager.mjs';
import logger from '../utils/logger.mjs';

class EnhancedSocialMediaService {
  constructor() {
    this.platforms = {
      facebook: this.postToFacebook.bind(this),
      twitter: this.postToTwitter.bind(this),
      linkedin: this.postToLinkedIn.bind(this),
      instagram: this.postToInstagram.bind(this),
      telegram: this.postToTelegram.bind(this),
      threads: this.postToThreads.bind(this),
    };
    this.rateLimitManager = new RateLimitManager();
    this.tokenManager = new Map(); // Token health tracking
  }

  /**
   * Enhanced auto-post with better error handling and token management
   */
  async autoPostContent(newsArticle, user) {
    try {
      const settings = await Settings.getCategorySettings('social-media');
      
      if (!settings.autoPostEnabled) {
        logger.info('Auto-posting is disabled');
        return { success: false, message: 'Auto-posting is disabled' };
      }

      const results = [];
      const activePlatforms = settings.socialLinks?.filter(link => link.isActive) || [];

      // Process platforms in parallel for better performance
      const platformPromises = activePlatforms.map(async (platform) => {
        try {
          // Check token health first
          const tokenHealth = await this.checkTokenHealth(platform.platform, settings);
          if (!tokenHealth.isHealthy) {
            return {
              platform: platform.platform,
              success: false,
              message: `Token issue: ${tokenHealth.message}`,
              needsTokenRefresh: true
            };
          }

          // Check rate limits
          const rateLimitCheck = await this.rateLimitManager.canPost(platform.platform);
          if (!rateLimitCheck.canPost) {
            return {
              platform: platform.platform,
              success: false,
              message: `Rate limited: ${rateLimitCheck.message}`,
              rateLimited: true,
              waitTime: rateLimitCheck.waitTime
            };
          }

          const result = await this.postToPlatform(platform, newsArticle, settings);
          
          if (result.success) {
            this.rateLimitManager.recordPost(platform.platform);
            this.updateTokenHealth(platform.platform, true);
          } else {
            this.updateTokenHealth(platform.platform, false);
          }
          
          return {
            platform: platform.platform,
            success: result.success,
            message: result.message,
            url: result.url,
            postId: result.postId
          };
        } catch (error) {
          logger.error(`Error posting to ${platform.platform}:`, error);
          this.updateTokenHealth(platform.platform, false);
          
          if (error.response?.status === 429) {
            const retryDelay = await this.rateLimitManager.handleRateLimitError(platform.platform);
            return {
              platform: platform.platform,
              success: false,
              message: `Rate limited (429). Retry after ${Math.ceil(retryDelay / 1000)} seconds.`,
              rateLimited: true,
              waitTime: retryDelay
            };
          } else if (error.response?.status === 401 || error.response?.status === 403) {
            return {
              platform: platform.platform,
              success: false,
              message: `Authentication failed: ${error.message}`,
              needsTokenRefresh: true
            };
          } else {
            return {
              platform: platform.platform,
              success: false,
              message: error.message
            };
          }
        }
      });

      const platformResults = await Promise.allSettled(platformPromises);
      
      platformResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            platform: activePlatforms[index].platform,
            success: false,
            message: result.reason.message
          });
        }
      });

      return {
        success: results.some(r => r.success),
        results,
        totalPlatforms: activePlatforms.length,
        successfulPosts: results.filter(r => r.success).length,
        rateLimited: results.filter(r => r.rateLimited).length,
        needsTokenRefresh: results.filter(r => r.needsTokenRefresh).length
      };

    } catch (error) {
      logger.error('Auto-posting error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Check token health for a platform
   */
  async checkTokenHealth(platform, settings) {
    try {
      switch (platform) {
        case 'facebook':
          if (!settings.facebookPageAccessToken) {
            return { isHealthy: false, message: 'Facebook access token not configured' };
          }
          // Test Facebook token
          const fbResponse = await axios.get(`https://graph.facebook.com/v20.0/me?access_token=${settings.facebookPageAccessToken}`);
          return { isHealthy: fbResponse.status === 200, message: 'Facebook token is valid' };
          
        case 'twitter':
          if (!settings.twitterApiKey || !settings.twitterAccessToken) {
            return { isHealthy: false, message: 'Twitter credentials not configured' };
          }
          // Twitter token validation would require a test API call
          return { isHealthy: true, message: 'Twitter credentials configured' };
          
        case 'linkedin':
          if (!settings.linkedinAccessToken) {
            return { isHealthy: false, message: 'LinkedIn access token not configured' };
          }
          // Test LinkedIn token
          const liResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: { 'Authorization': `Bearer ${settings.linkedinAccessToken}` }
          });
          return { isHealthy: liResponse.status === 200, message: 'LinkedIn token is valid' };
          
        case 'telegram':
          if (!settings.telegramBotToken) {
            return { isHealthy: false, message: 'Telegram bot token not configured' };
          }
          // Test Telegram token
          const tgResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getMe`);
          return { isHealthy: tgResponse.data.ok, message: 'Telegram bot token is valid' };
          
        default:
          return { isHealthy: true, message: 'Platform not checked' };
      }
    } catch (error) {
      return { isHealthy: false, message: `Token validation failed: ${error.message}` };
    }
  }

  /**
   * Update token health tracking
   */
  updateTokenHealth(platform, isHealthy) {
    this.tokenManager.set(platform, {
      isHealthy,
      lastChecked: new Date(),
      consecutiveFailures: isHealthy ? 0 : (this.tokenManager.get(platform)?.consecutiveFailures || 0) + 1
    });
  }

  /**
   * Enhanced Facebook posting with better error handling
   */
  async postToFacebook(platform, newsArticle, settings) {
    try {
      if (!settings.facebookPageAccessToken) {
        throw new Error('Facebook access token not configured');
      }

      const content = this.generatePostContent(newsArticle, 'facebook');
      const baseUrl = process.env.FRONTEND_URL || 'https://razewire.com';
      const articleUrl = `${baseUrl}/news/${newsArticle.slug}`;

      const postData = {
        message: content,
        access_token: settings.facebookPageAccessToken
      };

      // Add link for production domains
      if (articleUrl && !articleUrl.includes('localhost') && !articleUrl.includes('127.0.0.1')) {
        postData.link = articleUrl;
      }

      const response = await axios.post(`https://graph.facebook.com/v20.0/${settings.facebookPageId || 'me'}/feed`, postData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      return {
        success: true,
        postId: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
        message: 'Posted to Facebook successfully'
      };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Facebook access token expired or invalid');
      } else if (error.response?.status === 403) {
        throw new Error('Facebook permissions insufficient');
      } else if (error.response?.status === 429) {
        throw new Error('Facebook rate limit exceeded');
      }
      throw new Error(`Facebook posting failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Enhanced LinkedIn posting with organization support
   */
  async postToLinkedIn(platform, newsArticle, settings) {
    try {
      if (!settings.linkedinAccessToken) {
        throw new Error('LinkedIn access token not configured');
      }

      const content = this.generatePostContent(newsArticle, 'linkedin');
      const isCompanyPost = settings.linkedinOrganizationId;
      
      const postData = {
        author: isCompanyPost 
          ? `urn:li:organization:${settings.linkedinOrganizationId}`
          : 'urn:li:person:me',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
        headers: {
          'Authorization': `Bearer ${settings.linkedinAccessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Posted to LinkedIn successfully',
        url: `https://linkedin.com/posts/${response.data.id}`,
        postId: response.data.id
      };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('LinkedIn access token expired or invalid');
      } else if (error.response?.status === 403) {
        throw new Error('LinkedIn permissions insufficient - check organization ID');
      }
      throw new Error(`LinkedIn posting failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Enhanced Instagram posting with media support
   */
  async postToInstagram(platform, newsArticle, settings) {
    try {
      if (!settings.instagramAppId || !settings.instagramAccessToken) {
        throw new Error('Instagram credentials not configured');
      }

      const content = this.generatePostContent(newsArticle, 'instagram');
      
      // For now, create a text-only post (Instagram Business accounts support this)
      const postData = {
        message: content,
        access_token: settings.instagramAccessToken
      };

      const response = await axios.post(`https://graph.facebook.com/v20.0/${settings.instagramPageId || 'me'}/media`, postData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.id) {
        // Publish the media
        const publishData = {
          creation_id: response.data.id,
          access_token: settings.instagramAccessToken
        };

        const publishResponse = await axios.post(`https://graph.facebook.com/v20.0/${settings.instagramPageId || 'me'}/media_publish`, publishData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });

        return {
          success: true,
          message: 'Posted to Instagram successfully',
          url: `https://instagram.com/p/${publishResponse.data.id}`,
          postId: publishResponse.data.id
        };
      }

      throw new Error('Instagram media creation failed');
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Instagram access token expired or invalid');
      } else if (error.response?.status === 403) {
        throw new Error('Instagram permissions insufficient');
      }
      throw new Error(`Instagram posting failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Enhanced Telegram posting with better formatting
   */
  async postToTelegram(platform, newsArticle, settings) {
    try {
      if (!settings.telegramBotToken || !settings.telegramChannelId) {
        throw new Error('Telegram credentials not configured');
      }

      const baseUrl = process.env.FRONTEND_URL || 'https://razewire.com';
      const articleUrl = `${baseUrl}/news/${newsArticle.slug}`;

      // Enhanced message with better formatting
      const message = `*${newsArticle.title.en}*\n\n${newsArticle.description.en}\n\n📰 [Read More](${articleUrl})\n\n#news #${newsArticle.category?.name?.en?.toLowerCase() || 'general'}`;

      const postData = {
        chat_id: settings.telegramChannelId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      };

      const response = await axios.post(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, postData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.ok) {
        const messageId = response.data.result.message_id;
        const channelUsername = settings.telegramChannelUsername || '';
        const channelUrl = channelUsername ? `https://t.me/${channelUsername.replace('@', '')}/${messageId}` : '';
        
        return {
          success: true,
          message: 'Posted to Telegram successfully',
          url: channelUrl,
          postId: messageId.toString()
        };
      }

      throw new Error(`Telegram API error: ${response.data.description}`);
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Telegram bot token invalid');
      } else if (error.response?.status === 403) {
        throw new Error('Telegram bot not authorized for this channel');
      }
      throw new Error(`Telegram posting failed: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Enhanced Twitter posting with OAuth 2.0 support
   */
  async postToTwitter(platform, newsArticle, settings) {
    try {
      if (!settings.twitterApiKey || !settings.twitterAccessToken) {
        throw new Error('Twitter credentials not configured');
      }

      const content = this.generatePostContent(newsArticle, 'twitter');
      
      // Use OAuth 2.0 Bearer token for better security
      const response = await axios.post('https://api.twitter.com/2/tweets', {
        text: content
      }, {
        headers: {
          'Authorization': `Bearer ${settings.twitterAccessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.data && response.data.data.id) {
        return {
          success: true,
          message: 'Posted to Twitter successfully',
          url: `https://twitter.com/user/status/${response.data.data.id}`,
          postId: response.data.data.id
        };
      }

      throw new Error('Twitter API did not return post ID');
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Twitter access token expired or invalid');
      } else if (error.response?.status === 403) {
        throw new Error('Twitter permissions insufficient');
      } else if (error.response?.status === 429) {
        throw new Error('Twitter rate limit exceeded');
      }
      throw new Error(`Twitter posting failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  /**
   * Enhanced Threads posting (simulation until API is available)
   */
  async postToThreads(platform, newsArticle, settings) {
    try {
      const content = this.generatePostContent(newsArticle, 'threads');
      
      // Threads API is still in development, so we'll simulate for now
      const postId = Date.now().toString();
      const username = 'razewire';
      
      return {
        success: true,
        message: 'Posted to Threads successfully (simulated - API in development)',
        url: `https://threads.net/@${username}/post/${postId}`,
        postId: postId,
        note: 'Threads API is still in development. This is a simulation.'
      };
    } catch (error) {
      throw new Error(`Threads posting failed: ${error.message}`);
    }
  }

  /**
   * Generate optimized post content for each platform
   */
  generatePostContent(newsArticle, platform) {
    const title = newsArticle.title.en;
    const description = newsArticle.description.en;
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/news/${newsArticle.slug}`;
    
    switch (platform) {
      case 'twitter':
        const twitterText = `${title}\n\n${description.substring(0, 200)}...\n\n${url}`;
        return twitterText.length <= 280 ? twitterText : `${title}\n\n${url}`;
      
      case 'facebook':
        return `${title}\n\n${description}\n\nRead more: ${url}`;
      
      case 'linkedin':
        return `${title}\n\n${description}\n\n#news #${newsArticle.category?.name?.en?.toLowerCase() || 'general'}\n\n${url}`;
      
      case 'instagram':
        return `${title}\n\n${description}\n\nRead the full article at our website.\n\n#news #${newsArticle.category?.name?.en?.toLowerCase() || 'general'}`;
      
      case 'telegram':
        return `${title}\n\n${description}\n\n📰 Read More: ${url}\n\n#news #${newsArticle.category?.name?.en?.toLowerCase() || 'general'}`;
      
      case 'threads':
        return `${title}\n\n${description}\n\nRead the full article at our website.\n\n#news #${newsArticle.category?.name?.en?.toLowerCase() || 'general'}`;
      
      default:
        return `${title}\n\n${description}\n\n${url}`;
    }
  }

  /**
   * Get comprehensive posting statistics
   */
  async getPostingStats() {
    const stats = {
      totalPosts: 0,
      successfulPosts: 0,
      failedPosts: 0,
      platforms: {},
      tokenHealth: {}
    };

    // Get token health for each platform
    for (const [platform, health] of this.tokenManager.entries()) {
      stats.tokenHealth[platform] = {
        isHealthy: health.isHealthy,
        lastChecked: health.lastChecked,
        consecutiveFailures: health.consecutiveFailures
      };
    }

    return stats;
  }

  /**
   * Test all platform connections
   */
  async testAllConnections(settings) {
    const results = {};
    
    for (const platform of Object.keys(this.platforms)) {
      try {
        const health = await this.checkTokenHealth(platform, settings);
        results[platform] = {
          success: health.isHealthy,
          message: health.message
        };
      } catch (error) {
        results[platform] = {
          success: false,
          message: error.message
        };
      }
    }
    
    return results;
  }
}

export default new EnhancedSocialMediaService();
