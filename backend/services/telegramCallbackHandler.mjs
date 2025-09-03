import axios from 'axios';
import News from '../models/News.mjs';
import Settings from '../models/Settings.mjs';
import logger from '../utils/logger.mjs';

class TelegramCallbackHandler {
  constructor() {
    this.telegramSettings = null;
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
      logger.error('Error loading Telegram settings:', error.message);
    }
  }

  /**
   * Handle callback query from Telegram buttons
   */
  async handleCallbackQuery(callbackQuery) {
    try {
      await this.initializeTelegramSettings();
      
      if (!this.telegramSettings?.botToken) {
        throw new Error('Telegram not configured');
      }

      const { id, data, from, message } = callbackQuery;
      const [action, articleId] = data.split('_');

      logger.info(`📱 Telegram callback: ${action} for article ${articleId} from user ${from.username || from.first_name}`);

      let responseText = '';
      let showAlert = false;

      switch (action) {
        case 'like':
          responseText = await this.handleLikeAction(articleId, from);
          showAlert = true;
          break;

        case 'comment':
          responseText = await this.handleCommentAction(articleId, from);
          showAlert = true;
          break;

        case 'share':
          responseText = await this.handleShareAction(articleId, from);
          showAlert = true;
          break;

        default:
          responseText = '❌ Unknown action';
          showAlert = true;
      }

      // Answer the callback query
      await this.answerCallbackQuery(id, responseText, showAlert);

      return {
        success: true,
        action,
        articleId,
        userId: from.id,
        username: from.username || from.first_name,
        response: responseText
      };

    } catch (error) {
      logger.error('Error handling Telegram callback:', error.message);
      
      // Try to answer with error message
      try {
        await this.answerCallbackQuery(callbackQuery.id, '❌ Error processing request', true);
      } catch (answerError) {
        logger.error('Error answering callback query:', answerError.message);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle like action
   */
  async handleLikeAction(articleId, user) {
    try {
      const article = await News.findById(articleId);
      if (!article) {
        return '❌ Article not found';
      }

      // Here you could implement actual like functionality
      // For now, we'll just acknowledge the action
      const userName = user.username || user.first_name;
      
      logger.info(`👍 User ${userName} liked article: ${article.title?.en}`);
      
      return `👍 Thanks for liking "${article.title?.en}"!`;
    } catch (error) {
      logger.error('Error handling like action:', error.message);
      return '❌ Error processing like';
    }
  }

  /**
   * Handle comment action
   */
  async handleCommentAction(articleId, user) {
    try {
      const article = await News.findById(articleId);
      if (!article) {
        return '❌ Article not found';
      }

      const userName = user.username || user.first_name;
      const articleUrl = `${process.env.FRONTEND_URL || 'https://razewire.com'}/news/${article.slug}`;
      
      logger.info(`💬 User ${userName} wants to comment on article: ${article.title?.en}`);
      
      return `💬 To comment on "${article.title?.en}", visit: ${articleUrl}`;
    } catch (error) {
      logger.error('Error handling comment action:', error.message);
      return '❌ Error processing comment request';
    }
  }

  /**
   * Handle share action
   */
  async handleShareAction(articleId, user) {
    try {
      const article = await News.findById(articleId);
      if (!article) {
        return '❌ Article not found';
      }

      const userName = user.username || user.first_name;
      const articleUrl = `${process.env.FRONTEND_URL || 'https://razewire.com'}/news/${article.slug}`;
      
      logger.info(`📤 User ${userName} wants to share article: ${article.title?.en}`);
      
      return `📤 Share "${article.title?.en}": ${articleUrl}`;
    } catch (error) {
      logger.error('Error handling share action:', error.message);
      return '❌ Error processing share request';
    }
  }

  /**
   * Answer callback query
   */
  async answerCallbackQuery(callbackQueryId, text, showAlert = false) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.telegramSettings.botToken}/answerCallbackQuery`,
        {
          callback_query_id: callbackQueryId,
          text: text,
          show_alert: showAlert
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Error answering callback query:', error.message);
      throw error;
    }
  }

  /**
   * Update message with new buttons (e.g., after like)
   */
  async updateMessageButtons(chatId, messageId, articleId, hasLiked = false) {
    try {
      const article = await News.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      const articleUrl = `${process.env.FRONTEND_URL || 'https://razewire.com'}/news/${article.slug}`;
      
      // Create updated inline keyboard
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
              url: process.env.FRONTEND_URL || 'https://razewire.com'
            },
            {
              text: '📰 All News',
              url: `${process.env.FRONTEND_URL || 'https://razewire.com'}/news`
            }
          ],
          [
            {
              text: hasLiked ? '❤️ Liked' : '👍 Like',
              callback_data: `like_${articleId}`
            },
            {
              text: '💬 Comment',
              callback_data: `comment_${articleId}`
            },
            {
              text: '📤 Share',
              callback_data: `share_${articleId}`
            }
          ]
        ]
      };

      const response = await axios.post(
        `https://api.telegram.org/bot${this.telegramSettings.botToken}/editMessageReplyMarkup`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: inlineKeyboard
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Error updating message buttons:', error.message);
      throw error;
    }
  }
}

export default new TelegramCallbackHandler();

