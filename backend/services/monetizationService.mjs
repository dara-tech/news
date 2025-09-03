import logger from '../utils/logger.mjs';

class MonetizationService {
  constructor() {
    this.adPlacements = new Map();
    this.subscriptionPlans = new Map();
    this.revenueTracking = new Map();
    this.affiliateLinks = new Map();
    this.donationSettings = new Map();
    
    this.initializeDefaultSettings();
  }

  /**
   * Initialize default monetization settings
   */
  initializeDefaultSettings() {
    // Default ad placements
    this.adPlacements.set('header', {
      id: 'header',
      name: 'Header Banner',
      position: 'top',
      size: '728x90',
      enabled: true,
      priority: 1
    });
    
    this.adPlacements.set('sidebar', {
      id: 'sidebar',
      name: 'Sidebar Banner',
      position: 'right',
      size: '300x250',
      enabled: true,
      priority: 2
    });
    
    this.adPlacements.set('article_top', {
      id: 'article_top',
      name: 'Article Top',
      position: 'content_start',
      size: '728x90',
      enabled: true,
      priority: 3
    });
    
    this.adPlacements.set('article_bottom', {
      id: 'article_bottom',
      name: 'Article Bottom',
      position: 'content_end',
      size: '728x90',
      enabled: true,
      priority: 4
    });
    
    this.adPlacements.set('in_content', {
      id: 'in_content',
      name: 'In-Content',
      position: 'content_middle',
      size: '300x250',
      enabled: true,
      priority: 5
    });

    // Default subscription plans
    this.subscriptionPlans.set('free', {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      features: [
        'Access to basic articles',
        'Limited reading per day',
        'Basic search functionality'
      ],
      limits: {
        articlesPerDay: 10,
        searchQueries: 5,
        bookmarks: 20
      }
    });
    
    this.subscriptionPlans.set('premium', {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      currency: 'USD',
      billing: 'monthly',
      features: [
        'Unlimited article access',
        'Advanced search',
        'Unlimited bookmarks',
        'Ad-free experience',
        'Priority support',
        'Early access to new features'
      ],
      limits: {
        articlesPerDay: -1, // Unlimited
        searchQueries: -1,
        bookmarks: -1
      }
    });
    
    this.subscriptionPlans.set('pro', {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      currency: 'USD',
      billing: 'monthly',
      features: [
        'Everything in Premium',
        'Content creation tools',
        'Analytics dashboard',
        'API access',
        'White-label options',
        'Custom integrations'
      ],
      limits: {
        articlesPerDay: -1,
        searchQueries: -1,
        bookmarks: -1,
        apiCalls: 10000
      }
    });

    // Default donation settings
    this.donationSettings.set('default', {
      enabled: true,
      platforms: ['paypal', 'stripe', 'crypto'],
      suggestedAmounts: [5, 10, 25, 50],
      currency: 'USD',
      message: 'Support independent journalism',
      showProgress: true,
      goal: 1000
    });
  }

  /**
   * Ad Management
   */
  async getAdPlacements() {
    return Array.from(this.adPlacements.values()).sort((a, b) => a.priority - b.priority);
  }

  async updateAdPlacement(placementId, updates) {
    const placement = this.adPlacements.get(placementId);
    if (!placement) {
      throw new Error('Ad placement not found');
    }

    Object.assign(placement, updates);
    this.adPlacements.set(placementId, placement);
    
    logger.info(`Ad placement updated: ${placementId}`, updates);
    return placement;
  }

  async generateAdCode(placementId, options = {}) {
    const placement = this.adPlacements.get(placementId);
    if (!placement || !placement.enabled) {
      return null;
    }

    const {
      adClient = process.env.ADSENSE_CLIENT_ID,
      adSlot = placement.adSlot,
      responsive = true,
      format = 'auto'
    } = options;

    if (!adClient) {
      logger.warn('AdSense client ID not configured');
      return null;
    }

    const adCode = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${adClient}"
           data-ad-slot="${adSlot || 'auto'}"
           data-ad-format="${format}"
           ${responsive ? 'data-full-width-responsive="true"' : ''}></ins>
      <script>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    `;

    return {
      placement,
      code: adCode,
      tracking: this.generateAdTracking(placementId)
    };
  }

  generateAdTracking(placementId) {
    return {
      placementId,
      timestamp: new Date(),
      sessionId: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      events: ['impression', 'click', 'conversion']
    };
  }

  /**
   * Subscription Management
   */
  async getSubscriptionPlans() {
    return Array.from(this.subscriptionPlans.values());
  }

  async getSubscriptionPlan(planId) {
    return this.subscriptionPlans.get(planId);
  }

  async createSubscription(userId, planId, paymentData) {
    try {
      const plan = this.subscriptionPlans.get(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      const subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        planId,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate: this.calculateEndDate(plan),
        paymentData,
        features: plan.features,
        limits: plan.limits
      };

      // Track revenue
      this.trackRevenue('subscription', plan.price, plan.currency, {
        userId,
        planId,
        subscriptionId: subscription.id
      });

      logger.info(`Subscription created: ${subscription.id} for user ${userId}`);
      return subscription;
    } catch (error) {
      logger.error('Subscription creation error:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async checkUserLimits(userId, action, currentUsage = {}) {
    try {
      // This would typically check against user's subscription
      const userPlan = await this.getUserSubscription(userId);
      const plan = userPlan ? this.subscriptionPlans.get(userPlan.planId) : this.subscriptionPlans.get('free');
      
      if (!plan) {
        return { allowed: false, reason: 'No valid subscription plan' };
      }

      const limits = plan.limits;
      const limit = limits[action];
      
      if (limit === -1) {
        return { allowed: true, reason: 'Unlimited' };
      }

      const usage = currentUsage[action] || 0;
      const allowed = usage < limit;
      
      return {
        allowed,
        usage,
        limit,
        remaining: Math.max(0, limit - usage),
        reason: allowed ? 'Within limits' : 'Limit exceeded'
      };
    } catch (error) {
      logger.error('Limit check error:', error);
      return { allowed: false, reason: 'Error checking limits' };
    }
  }

  /**
   * Affiliate Link Management
   */
  async createAffiliateLink(originalUrl, options = {}) {
    try {
      const {
        campaign = 'default',
        medium = 'website',
        source = 'razewire',
        customParams = {}
      } = options;

      const affiliateId = `aff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const affiliateLink = {
        id: affiliateId,
        originalUrl,
        affiliateUrl: this.buildAffiliateUrl(originalUrl, {
          utm_campaign: campaign,
          utm_medium: medium,
          utm_source: source,
          affiliate_id: affiliateId,
          ...customParams
        }),
        campaign,
        medium,
        source,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        createdAt: new Date()
      };

      this.affiliateLinks.set(affiliateId, affiliateLink);
      
      logger.info(`Affiliate link created: ${affiliateId}`);
      return affiliateLink;
    } catch (error) {
      logger.error('Affiliate link creation error:', error);
      throw new Error(`Failed to create affiliate link: ${error.message}`);
    }
  }

  async trackAffiliateClick(affiliateId, metadata = {}) {
    try {
      const link = this.affiliateLinks.get(affiliateId);
      if (!link) {
        throw new Error('Affiliate link not found');
      }

      link.clicks++;
      link.lastClick = new Date();
      
      // Track click event
      this.trackRevenue('affiliate_click', 0, 'USD', {
        affiliateId,
        ...metadata
      });

      logger.info(`Affiliate click tracked: ${affiliateId}`);
      return link;
    } catch (error) {
      logger.error('Affiliate click tracking error:', error);
      throw new Error(`Failed to track affiliate click: ${error.message}`);
    }
  }

  /**
   * Donation Management
   */
  async getDonationSettings() {
    return this.donationSettings.get('default');
  }

  async updateDonationSettings(settings) {
    const currentSettings = this.donationSettings.get('default');
    Object.assign(currentSettings, settings);
    this.donationSettings.set('default', currentSettings);
    
    logger.info('Donation settings updated', settings);
    return currentSettings;
  }

  async processDonation(donationData) {
    try {
      const {
        amount,
        currency = 'USD',
        donorEmail,
        donorName,
        message,
        platform = 'stripe'
      } = donationData;

      const donation = {
        id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        donorEmail,
        donorName,
        message,
        platform,
        status: 'completed',
        createdAt: new Date()
      };

      // Track revenue
      this.trackRevenue('donation', amount, currency, {
        donorEmail,
        donorName,
        platform
      });

      logger.info(`Donation processed: ${donation.id} - ${amount} ${currency}`);
      return donation;
    } catch (error) {
      logger.error('Donation processing error:', error);
      throw new Error(`Failed to process donation: ${error.message}`);
    }
  }

  /**
   * Revenue Tracking
   */
  trackRevenue(source, amount, currency, metadata = {}) {
    const revenueEntry = {
      source,
      amount,
      currency,
      metadata,
      timestamp: new Date()
    };

    const key = `${source}_${new Date().toISOString().split('T')[0]}`;
    if (!this.revenueTracking.has(key)) {
      this.revenueTracking.set(key, []);
    }

    this.revenueTracking.get(key).push(revenueEntry);
    
    logger.info(`Revenue tracked: ${source} - ${amount} ${currency}`);
  }

  async getRevenueReport(timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      const report = {
        totalRevenue: 0,
        bySource: {},
        byCurrency: {},
        byDate: {},
        transactions: []
      };

      for (const [key, entries] of this.revenueTracking.entries()) {
        const date = key.split('_').slice(1).join('_');
        const dateObj = new Date(date);
        
        if (dateObj >= timeFilter.start && dateObj <= timeFilter.end) {
          entries.forEach(entry => {
            report.totalRevenue += entry.amount;
            
            // By source
            if (!report.bySource[entry.source]) {
              report.bySource[entry.source] = 0;
            }
            report.bySource[entry.source] += entry.amount;
            
            // By currency
            if (!report.byCurrency[entry.currency]) {
              report.byCurrency[entry.currency] = 0;
            }
            report.byCurrency[entry.currency] += entry.amount;
            
            // By date
            if (!report.byDate[date]) {
              report.byDate[date] = 0;
            }
            report.byDate[date] += entry.amount;
            
            report.transactions.push(entry);
          });
        }
      }

      return report;
    } catch (error) {
      logger.error('Revenue report error:', error);
      throw new Error(`Failed to generate revenue report: ${error.message}`);
    }
  }

  /**
   * Helper methods
   */
  calculateEndDate(plan) {
    const startDate = new Date();
    switch (plan.billing) {
      case 'monthly':
        return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'yearly':
        return new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  buildAffiliateUrl(originalUrl, params) {
    const url = new URL(originalUrl);
    Object.keys(params).forEach(key => {
      url.searchParams.set(key, params[key]);
    });
    return url.toString();
  }

  getTimeFilter(timeRange) {
    const now = new Date();
    let start;

    switch (timeRange) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { start, end: now };
  }

  async getUserSubscription(userId) {
    // This would typically query a database
    // For now, return null (free plan)
    return null;
  }

  /**
   * Get monetization statistics
   */
  getStats() {
    return {
      adPlacements: this.adPlacements.size,
      subscriptionPlans: this.subscriptionPlans.size,
      affiliateLinks: this.affiliateLinks.size,
      revenueEntries: Array.from(this.revenueTracking.values()).reduce((total, entries) => total + entries.length, 0)
    };
  }
}

export default new MonetizationService();
