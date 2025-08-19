import mongoose from 'mongoose';
import News from '../models/News.mjs';
import Settings from '../models/Settings.mjs';
import User from '../models/User.mjs';
import Category from '../models/Category.mjs';
import axios from 'axios';

class SentinelAutoPublishService {
  constructor() {
    this.telegramSettings = null;
    this.baseUrl = process.env.FRONTEND_URL || 'https://razewire.com';
  }

  /**
   * Initialize Telegram settings
   */
  async initializeTelegramSettings() {
    try {
      const settings = await Settings.getCategorySettings('social-media');
      this.telegramSettings = {
        botToken: settings.telegramBotToken,
        channelId: settings.telegramChannelId,
        channelUsername: settings.telegramChannelUsername,
        enabled: settings.telegramEnabled
      };
    } catch (error) {
      console.error('Error loading Telegram settings:', error.message);
    }
  }

  /**
   * Auto-publish Sentinel drafts and send Telegram notifications
   */
  async autoPublishSentinelDrafts() {
    try {
      console.log('🤖 Starting Sentinel Auto-Publish Process...');
      
      // Initialize Telegram settings
      await this.initializeTelegramSettings();
      
      // Get all draft articles created by Sentinel
      const draftArticles = await News.find({
        status: 'draft',
        'ingestion.method': 'sentinel'
      })
      .populate('author', 'username')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10); // Process 10 at a time to avoid overwhelming

      console.log(`📝 Found ${draftArticles.length} Sentinel draft articles`);

      if (draftArticles.length === 0) {
        console.log('✅ No Sentinel drafts to process');
        return;
      }

      let publishedCount = 0;
      let notificationCount = 0;

      for (const article of draftArticles) {
        try {
          console.log(`\n📰 Processing: ${article.title?.en || 'No title'}`);
          
          // Check if article has good content
          const hasGoodContent = article.content?.en && 
                               article.content.en.length > 100 &&
                               article.content?.kh && 
                               article.content.kh.length > 100;

          if (!hasGoodContent) {
            console.log('   ⚠️  Skipping - insufficient content');
            continue;
          }

          // Prepare article for publishing
          const updates = {
            status: 'published',
            publishedAt: new Date()
          };

          // Add thumbnail if missing
          if (!article.thumbnail) {
            const thumbnailUrl = this.generateThumbnail(article.title?.en || 'Article');
            updates.thumbnail = thumbnailUrl;
            console.log('   ✅ Added thumbnail');
          }

          // Add tags if missing
          if (!article.tags || article.tags.length === 0) {
            const tags = this.extractTags(article.content?.en || '', article.title?.en || '');
            updates.tags = tags;
            console.log(`   ✅ Added tags: ${tags.join(', ')}`);
          }

          // Add keywords if missing
          if (!article.keywords) {
            const keywords = this.extractKeywords(article.content?.en || '', article.title?.en || '');
            updates.keywords = keywords;
            console.log(`   ✅ Added keywords: ${keywords}`);
          }

          // Update the article
          await News.findByIdAndUpdate(article._id, updates);
          console.log('   ✅ Article published successfully!');
          publishedCount++;

          // Send Telegram notification
          if (this.telegramSettings?.enabled && this.telegramSettings?.botToken && this.telegramSettings?.channelId) {
            try {
              await this.sendTelegramNotification(article);
              console.log('   📱 Telegram notification sent');
              notificationCount++;
            } catch (error) {
              console.log(`   ⚠️  Telegram notification failed: ${error.message}`);
            }
          }

          // Add delay between processing to avoid rate limits
          await this.delay(2000);

        } catch (error) {
          console.error(`   ❌ Error processing article: ${error.message}`);
        }
      }

      console.log('\n📊 AUTO-PUBLISH SUMMARY');
      console.log('=' .repeat(40));
      console.log(`✅ Published: ${publishedCount} articles`);
      console.log(`📱 Notifications: ${notificationCount} sent`);
      console.log(`📝 Remaining drafts: ${draftArticles.length - publishedCount}`);

      if (publishedCount > 0) {
        console.log('\n🎉 Auto-publish process completed successfully!');
        console.log('📱 Check your Telegram channel for notifications.');
      }

    } catch (error) {
      console.error('❌ Error in auto-publish process:', error.message);
    }
  }

  /**
   * Send Telegram notification for published article
   */
  async sendTelegramNotification(article) {
    try {
      // Initialize Telegram settings if not already done
      if (!this.telegramSettings) {
        await this.initializeTelegramSettings();
      }
      
      if (!this.telegramSettings?.botToken || !this.telegramSettings?.channelId) {
        throw new Error('Telegram not configured');
      }

      // Use production URL for Telegram buttons (Telegram doesn't accept localhost URLs)
      const telegramBaseUrl = this.baseUrl.includes('localhost') ? 'https://razewire.com' : this.baseUrl;
      const articleUrl = `${telegramBaseUrl}/news/${article.slug}`;
      const categoryName = article.category?.name?.en || 'General';
      
      // Create notification message
      const message = `📰 *NEW ARTICLE PUBLISHED*\n\n` +
                     `*${article.title?.en}*\n\n` +
                     `${article.description?.en}\n\n` +
                     `📂 Category: ${categoryName}\n` +
                     `👤 Author: ${article.author?.username || 'RazeWire'}\n` +
                     `📅 Published: ${new Date().toLocaleString()}\n\n` +
                     `#news #${categoryName.toLowerCase()} #razewire`;

      // Create inline keyboard buttons (navigation only - no webhook required)
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: '📖 Read Full Article',
              url: articleUrl
            }
          ],
          [
            {
              text: '🏠 Visit Website',
              url: telegramBaseUrl
            },
            {
              text: '📰 All News',
              url: `${telegramBaseUrl}/news`
            }
          ],
          [
            {
              text: '📱 Follow Us',
              url: `https://t.me/${this.telegramSettings?.channelUsername?.replace('@', '') || 'razewire'}`
            },
            {
              text: '🌐 Website',
              url: telegramBaseUrl
            }
          ]
        ]
      };

      // Send to Telegram with inline keyboard
      const postData = {
        chat_id: this.telegramSettings.channelId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        reply_markup: inlineKeyboard
      };

      const response = await axios.post(
        `https://api.telegram.org/bot${this.telegramSettings.botToken}/sendMessage`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description}`);
      }

      return {
        success: true,
        messageId: response.data.result.message_id,
        url: this.telegramSettings.channelUsername ? 
             `https://t.me/${this.telegramSettings.channelUsername.replace('@', '')}/${response.data.result.message_id}` : 
             null
      };

    } catch (error) {
      console.error('Telegram notification error:', error.message);
      throw error;
    }
  }

  /**
   * Generate thumbnail URL
   */
  generateThumbnail(title) {
    return `https://via.placeholder.com/1200x630/2563eb/ffffff?text=${encodeURIComponent(title)}`;
  }

  /**
   * Extract tags from content
   */
  extractTags(content, title) {
    const commonTags = [
      'Cambodia', 'News', 'Politics', 'Business', 'Technology', 
      'Health', 'Education', 'Environment', 'Sports', 'Entertainment',
      'International', 'Local', 'Breaking News', 'Analysis', 'Feature'
    ];
    
    const extractedTags = [];
    
    // Add tags based on content
    commonTags.forEach(tag => {
      if (content.toLowerCase().includes(tag.toLowerCase()) || 
          title.toLowerCase().includes(tag.toLowerCase())) {
        extractedTags.push(tag);
      }
    });
    
    // Add location tags if mentioned
    if (content.toLowerCase().includes('phnom penh')) extractedTags.push('Phnom Penh');
    if (content.toLowerCase().includes('siem reap')) extractedTags.push('Siem Reap');
    if (content.toLowerCase().includes('battambang')) extractedTags.push('Battambang');
    
    // Ensure we have at least 3 tags
    if (extractedTags.length < 3) {
      extractedTags.push('Cambodia', 'News');
    }
    
    return extractedTags.slice(0, 7); // Max 7 tags
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(content, title) {
    const words = (title + ' ' + content).toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    
    const wordCount = {};
    words.forEach(word => {
      if (word.length > 3 && !stopWords.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.keys(wordCount)
      .sort((a, b) => wordCount[b] - wordCount[a])
      .slice(0, 10)
      .join(', ');
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get auto-publish statistics
   */
  async getAutoPublishStats() {
    try {
      const totalDrafts = await News.countDocuments({
        status: 'draft',
        'ingestion.method': 'sentinel'
      });

      const totalPublished = await News.countDocuments({
        status: 'published',
        'ingestion.method': 'sentinel'
      });

      const todayPublished = await News.countDocuments({
        status: 'published',
        'ingestion.method': 'sentinel',
        publishedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });

      return {
        totalDrafts,
        totalPublished,
        todayPublished,
        telegramEnabled: this.telegramSettings?.enabled || false
      };
    } catch (error) {
      console.error('Error getting auto-publish stats:', error.message);
      return null;
    }
  }
}

export default new SentinelAutoPublishService();
