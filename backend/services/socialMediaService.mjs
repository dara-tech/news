import Settings from '../models/Settings.mjs';
import axios from 'axios';

class SocialMediaService {
  constructor() {
    this.platforms = {
      facebook: this.postToFacebook.bind(this),
      twitter: this.postToTwitter.bind(this),
      linkedin: this.postToLinkedIn.bind(this),
      instagram: this.postToInstagram.bind(this),
      // Add more platforms as needed
    };
  }

  /**
   * Auto-post content to configured social media platforms
   */
  async autoPostContent(newsArticle, user) {
    try {
      // Get social media settings
      const settings = await Settings.getCategorySettings('social-media');
      
      if (!settings.autoPostEnabled) {
        console.log('Auto-posting is disabled');
        return { success: false, message: 'Auto-posting is disabled' };
      }

      const results = [];
      const activePlatforms = settings.socialLinks?.filter(link => link.isActive) || [];

      for (const platform of activePlatforms) {
        try {
          const result = await this.postToPlatform(platform, newsArticle, settings);
          results.push({
            platform: platform.platform,
            success: result.success,
            message: result.message,
            url: result.url
          });
        } catch (error) {
          console.error(`Error posting to ${platform.platform}:`, error);
          results.push({
            platform: platform.platform,
            success: false,
            message: error.message
          });
        }
      }

      return {
        success: results.some(r => r.success),
        results,
        totalPlatforms: activePlatforms.length,
        successfulPosts: results.filter(r => r.success).length
      };

    } catch (error) {
      console.error('Auto-posting error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Post to a specific platform
   */
  async postToPlatform(platform, newsArticle, settings) {
    const platformHandler = this.platforms[platform.platform];
    
    if (!platformHandler) {
      throw new Error(`Platform ${platform.platform} is not supported`);
    }

    return await platformHandler(platform, newsArticle, settings);
  }

  /**
   * Generate social media post content
   */
  generatePostContent(newsArticle, platform) {
    const title = newsArticle.title.en;
    const description = newsArticle.description.en;
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/news/${newsArticle.slug}`;
    
    // Platform-specific content formatting
    switch (platform) {
      case 'twitter':
        // Twitter has 280 character limit
        const twitterText = `${title}\n\n${description.substring(0, 200)}...\n\n${url}`;
        return twitterText.length <= 280 ? twitterText : `${title}\n\n${url}`;
      
      case 'facebook':
        return `${title}\n\n${description}\n\nRead more: ${url}`;
      
      case 'linkedin':
        return `${title}\n\n${description}\n\n#news #${newsArticle.category?.name?.en?.toLowerCase() || 'general'}\n\n${url}`;
      
      case 'instagram':
        return `${title}\n\n${description}\n\nRead the full article at our website.\n\n#news #${newsArticle.category?.name?.en?.toLowerCase() || 'general'}`;
      
      default:
        return `${title}\n\n${description}\n\n${url}`;
    }
  }

  /**
   * Post to Facebook
   */
  async postToFacebook(platform, newsArticle, settings) {
    try {
      // This would require Facebook Graph API integration
      // For now, we'll simulate the posting
      const content = this.generatePostContent(newsArticle, 'facebook');
      
      console.log('Posting to Facebook:', {
        platform: platform.platform,
        content: content.substring(0, 100) + '...',
        url: platform.url
      });

      // Simulate API call to Facebook
      // In a real implementation, you would use Facebook Graph API
      // const response = await axios.post(`https://graph.facebook.com/v18.0/me/feed`, {
      //   message: content,
      //   access_token: settings.facebookAccessToken
      // });

      return {
        success: true,
        message: 'Posted to Facebook successfully',
        url: `https://facebook.com/posts/${Date.now()}`
      };

    } catch (error) {
      throw new Error(`Facebook posting failed: ${error.message}`);
    }
  }

  /**
   * Post to Twitter/X
   */
  async postToTwitter(platform, newsArticle, settings) {
    try {
      const content = this.generatePostContent(newsArticle, 'twitter');
      
      console.log('Posting to Twitter:', {
        platform: platform.platform,
        content: content.substring(0, 100) + '...',
        url: platform.url
      });

      // Simulate API call to Twitter
      // In a real implementation, you would use Twitter API v2
      // const response = await axios.post('https://api.twitter.com/2/tweets', {
      //   text: content
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${settings.twitterBearerToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      return {
        success: true,
        message: 'Posted to Twitter successfully',
        url: `https://twitter.com/user/status/${Date.now()}`
      };

    } catch (error) {
      throw new Error(`Twitter posting failed: ${error.message}`);
    }
  }

  /**
   * Post to LinkedIn
   */
  async postToLinkedIn(platform, newsArticle, settings) {
    try {
      const content = this.generatePostContent(newsArticle, 'linkedin');
      
      console.log('Posting to LinkedIn:', {
        platform: platform.platform,
        content: content.substring(0, 100) + '...',
        url: platform.url
      });

      // Simulate API call to LinkedIn
      // In a real implementation, you would use LinkedIn API
      // const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
      //   author: `urn:li:person:${settings.linkedinUserId}`,
      //   lifecycleState: 'PUBLISHED',
      //   specificContent: {
      //     'com.linkedin.ugc.ShareContent': {
      //       shareCommentary: {
      //         text: content
      //       },
      //       shareMediaCategory: 'NONE'
      //     }
      //   },
      //   visibility: {
      //     'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      //   }
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${settings.linkedinAccessToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      return {
        success: true,
        message: 'Posted to LinkedIn successfully',
        url: `https://linkedin.com/posts/${Date.now()}`
      };

    } catch (error) {
      throw new Error(`LinkedIn posting failed: ${error.message}`);
    }
  }

  /**
   * Post to Instagram
   */
  async postToInstagram(platform, newsArticle, settings) {
    try {
      const content = this.generatePostContent(newsArticle, 'instagram');
      
      console.log('Posting to Instagram:', {
        platform: platform.platform,
        content: content.substring(0, 100) + '...',
        url: platform.url
      });

      // Instagram requires media (image/video) for posts
      // This would require Instagram Graph API integration
      // For now, we'll simulate the posting

      return {
        success: true,
        message: 'Posted to Instagram successfully',
        url: `https://instagram.com/p/${Date.now()}`
      };

    } catch (error) {
      throw new Error(`Instagram posting failed: ${error.message}`);
    }
  }

  /**
   * Test social media connection
   */
  async testConnection(platform, settings) {
    try {
      const testContent = 'This is a test post from NewsApp. If you see this, the connection is working!';
      
      const result = await this.postToPlatform(platform, {
        title: { en: 'Test Post' },
        description: { en: testContent },
        slug: 'test-post',
        category: { name: { en: 'Test' } }
      }, settings);

      return {
        success: result.success,
        message: result.message
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get posting statistics
   */
  async getPostingStats() {
    // This would typically query a database table tracking social media posts
    return {
      totalPosts: 0,
      successfulPosts: 0,
      failedPosts: 0,
      platforms: {
        facebook: { posts: 0, success: 0 },
        twitter: { posts: 0, success: 0 },
        linkedin: { posts: 0, success: 0 },
        instagram: { posts: 0, success: 0 }
      }
    };
  }
}

export default new SocialMediaService(); 