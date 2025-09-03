#!/usr/bin/env node

/**
 * Subscription & Monetization Service
 * Enterprise-grade subscription management and billing
 */

import mongoose from 'mongoose';
import User from '../models/User.mjs';
import logger from '../utils/logger.mjs';

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  trialEndDate: {
    type: Date
  },
  features: {
    aiAssistant: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    customIntegrations: { type: Boolean, default: false },
    bulkOperations: { type: Boolean, default: false },
    advancedReporting: { type: Boolean, default: false }
  },
  limits: {
    articlesPerMonth: { type: Number, default: 100 },
    apiRequestsPerDay: { type: Number, default: 1000 },
    storageGB: { type: Number, default: 5 },
    teamMembers: { type: Number, default: 1 }
  },
  billing: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    nextBillingDate: Date,
    paymentMethod: String,
    invoices: [{
      invoiceId: String,
      amount: Number,
      date: Date,
      status: { type: String, enum: ['paid', 'pending', 'failed'] },
      downloadUrl: String
    }]
  },
  usage: {
    articlesThisMonth: { type: Number, default: 0 },
    apiRequestsToday: { type: Number, default: 0 },
    storageUsedGB: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  metadata: {
    source: String,
    campaign: String,
    referrer: String,
    couponCode: String
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ 'billing.nextBillingDate': 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

class SubscriptionService {
  constructor() {
    this.plans = {
      free: {
        name: 'Free',
        price: 0,
        features: {
          aiAssistant: false,
          advancedAnalytics: false,
          prioritySupport: false,
          apiAccess: false,
          whiteLabel: false,
          customIntegrations: false,
          bulkOperations: false,
          advancedReporting: false
        },
        limits: {
          articlesPerMonth: 10,
          apiRequestsPerDay: 100,
          storageGB: 1,
          teamMembers: 1
        }
      },
      premium: {
        name: 'Premium',
        price: 9.99,
        features: {
          aiAssistant: true,
          advancedAnalytics: true,
          prioritySupport: true,
          apiAccess: true,
          whiteLabel: false,
          customIntegrations: false,
          bulkOperations: true,
          advancedReporting: true
        },
        limits: {
          articlesPerMonth: 100,
          apiRequestsPerDay: 5000,
          storageGB: 10,
          teamMembers: 5
        }
      },
      enterprise: {
        name: 'Enterprise',
        price: 99.99,
        features: {
          aiAssistant: true,
          advancedAnalytics: true,
          prioritySupport: true,
          apiAccess: true,
          whiteLabel: true,
          customIntegrations: true,
          bulkOperations: true,
          advancedReporting: true
        },
        limits: {
          articlesPerMonth: -1, // Unlimited
          apiRequestsPerDay: -1, // Unlimited
          storageGB: 100,
          teamMembers: -1 // Unlimited
        }
      }
    };

    this.startBillingCycle();
  }

  /**
   * Get or Create User Subscription
   */
  async getUserSubscription(userId) {
    try {
      let subscription = await Subscription.findOne({ userId }).populate('userId', 'name email');
      
      if (!subscription) {
        subscription = await this.createSubscription(userId, 'free');
      }

      return subscription;
    } catch (error) {
      logger.error('Get user subscription error:', error);
      throw error;
    }
  }

  /**
   * Create New Subscription
   */
  async createSubscription(userId, plan = 'free', options = {}) {
    try {
      const planConfig = this.plans[plan];
      if (!planConfig) {
        throw new Error(`Invalid plan: ${plan}`);
      }

      const subscription = new Subscription({
        userId,
        plan,
        features: planConfig.features,
        limits: planConfig.limits,
        billing: {
          amount: planConfig.price,
          currency: options.currency || 'USD',
          interval: options.interval || 'monthly',
          nextBillingDate: options.nextBillingDate || this.calculateNextBillingDate(options.interval || 'monthly')
        },
        metadata: options.metadata || {}
      });

      // Set trial period for premium plans
      if (plan !== 'free' && options.trial) {
        subscription.status = 'trial';
        subscription.trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
      }

      await subscription.save();
      logger.info(`Subscription created for user ${userId}, plan: ${plan}`);
      
      return subscription;
    } catch (error) {
      logger.error('Create subscription error:', error);
      throw error;
    }
  }

  /**
   * Upgrade/Downgrade Subscription
   */
  async changeSubscription(userId, newPlan, options = {}) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const planConfig = this.plans[newPlan];
      
      if (!planConfig) {
        throw new Error(`Invalid plan: ${newPlan}`);
      }

      const oldPlan = subscription.plan;
      
      // Update subscription
      subscription.plan = newPlan;
      subscription.features = planConfig.features;
      subscription.limits = planConfig.limits;
      subscription.billing.amount = planConfig.price;
      
      if (options.interval) {
        subscription.billing.interval = options.interval;
      }
      
      subscription.billing.nextBillingDate = this.calculateNextBillingDate(subscription.billing.interval);

      // Handle trial to paid conversion
      if (subscription.status === 'trial' && newPlan !== 'free') {
        subscription.status = 'active';
        subscription.trialEndDate = null;
      }

      await subscription.save();
      
      logger.info(`Subscription changed for user ${userId}: ${oldPlan} -> ${newPlan}`);
      
      return subscription;
    } catch (error) {
      logger.error('Change subscription error:', error);
      throw error;
    }
  }

  /**
   * Cancel Subscription
   */
  async cancelSubscription(userId, immediate = false) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (immediate) {
        subscription.status = 'cancelled';
        subscription.endDate = new Date();
        subscription.plan = 'free';
        subscription.features = this.plans.free.features;
        subscription.limits = this.plans.free.limits;
      } else {
        subscription.status = 'cancelled';
        subscription.endDate = subscription.billing.nextBillingDate;
      }

      await subscription.save();
      logger.info(`Subscription cancelled for user ${userId}, immediate: ${immediate}`);
      
      return subscription;
    } catch (error) {
      logger.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Check Feature Access
   */
  async hasFeatureAccess(userId, feature) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      // Check if subscription is active
      if (subscription.status === 'expired' || subscription.status === 'cancelled') {
        if (subscription.endDate && new Date() > subscription.endDate) {
          return false;
        }
      }

      return subscription.features[feature] || false;
    } catch (error) {
      logger.error('Feature access check error:', error);
      return false;
    }
  }

  /**
   * Check Usage Limits
   */
  async checkUsageLimit(userId, limitType) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limit = subscription.limits[limitType];
      const usage = subscription.usage;

      // Unlimited access
      if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1 };
      }

      let currentUsage;
      switch (limitType) {
        case 'articlesPerMonth':
          currentUsage = usage.articlesThisMonth;
          break;
        case 'apiRequestsPerDay':
          currentUsage = usage.apiRequestsToday;
          break;
        case 'storageGB':
          currentUsage = usage.storageUsedGB;
          break;
        default:
          currentUsage = 0;
      }

      const remaining = Math.max(0, limit - currentUsage);
      const allowed = currentUsage < limit;

      return { allowed, remaining, limit, current: currentUsage };
    } catch (error) {
      logger.error('Usage limit check error:', error);
      return { allowed: false, remaining: 0, limit: 0 };
    }
  }

  /**
   * Record Usage
   */
  async recordUsage(userId, usageType, amount = 1) {
    try {
      const subscription = await Subscription.findOne({ userId });
      if (!subscription) return;

      const now = new Date();
      
      // Reset usage if needed
      if (usageType === 'apiRequestsPerDay') {
        const lastReset = subscription.usage.lastResetDate;
        if (!lastReset || now.getDate() !== lastReset.getDate()) {
          subscription.usage.apiRequestsToday = 0;
          subscription.usage.lastResetDate = now;
        }
      }

      if (usageType === 'articlesPerMonth') {
        const lastReset = subscription.usage.lastResetDate;
        if (!lastReset || now.getMonth() !== lastReset.getMonth()) {
          subscription.usage.articlesThisMonth = 0;
          subscription.usage.lastResetDate = now;
        }
      }

      // Record usage
      switch (usageType) {
        case 'articles':
          subscription.usage.articlesThisMonth += amount;
          break;
        case 'apiRequests':
          subscription.usage.apiRequestsToday += amount;
          break;
        case 'storage':
          subscription.usage.storageUsedGB = amount; // Set absolute value
          break;
      }

      await subscription.save();
    } catch (error) {
      logger.error('Record usage error:', error);
    }
  }

  /**
   * Process Billing
   */
  async processBilling(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription || subscription.plan === 'free') {
        return;
      }

      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate

      const invoice = {
        invoiceId: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: subscription.billing.amount,
        date: new Date(),
        status: success ? 'paid' : 'failed',
        downloadUrl: success ? `/invoices/${subscription.userId}/${Date.now()}.pdf` : null
      };

      subscription.billing.invoices.push(invoice);

      if (success) {
        subscription.billing.nextBillingDate = this.calculateNextBillingDate(subscription.billing.interval);
        subscription.status = 'active';
        logger.info(`Billing successful for subscription ${subscriptionId}`);
      } else {
        subscription.status = 'expired';
        logger.warn(`Billing failed for subscription ${subscriptionId}`);
      }

      await subscription.save();
      return invoice;
    } catch (error) {
      logger.error('Process billing error:', error);
      throw error;
    }
  }

  /**
   * Get Subscription Analytics
   */
  async getSubscriptionAnalytics(timeRange = '30d') {
    try {
      const days = parseInt(timeRange.replace('d', ''));
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        totalSubscriptions,
        activeSubscriptions,
        planDistribution,
        revenueData,
        churnData,
        trialConversions
      ] = await Promise.all([
        Subscription.countDocuments(),
        Subscription.countDocuments({ status: 'active' }),
        this.getPlanDistribution(),
        this.getRevenueData(startDate),
        this.getChurnData(startDate),
        this.getTrialConversions(startDate)
      ]);

      return {
        summary: {
          totalSubscriptions,
          activeSubscriptions,
          churnRate: churnData.churnRate,
          monthlyRecurringRevenue: revenueData.mrr,
          averageRevenuePerUser: revenueData.arpu
        },
        distribution: planDistribution,
        revenue: revenueData,
        churn: churnData,
        trials: trialConversions,
        timeRange
      };
    } catch (error) {
      logger.error('Subscription analytics error:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  calculateNextBillingDate(interval) {
    const now = new Date();
    if (interval === 'yearly') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  async getPlanDistribution() {
    const distribution = await Subscription.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    
    return distribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  async getRevenueData(startDate) {
    const subscriptions = await Subscription.find({
      status: 'active',
      plan: { $ne: 'free' }
    });

    const mrr = subscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.billing.interval === 'yearly' 
        ? sub.billing.amount / 12 
        : sub.billing.amount;
      return total + monthlyAmount;
    }, 0);

    const arpu = subscriptions.length > 0 ? mrr / subscriptions.length : 0;

    return { mrr, arpu, totalRevenue: mrr * 12 };
  }

  async getChurnData(startDate) {
    const totalActive = await Subscription.countDocuments({ status: 'active' });
    const churned = await Subscription.countDocuments({
      status: 'cancelled',
      updatedAt: { $gte: startDate }
    });

    const churnRate = totalActive > 0 ? (churned / totalActive) * 100 : 0;
    return { churnRate, churnedUsers: churned };
  }

  async getTrialConversions(startDate) {
    const trials = await Subscription.countDocuments({
      status: 'trial',
      createdAt: { $gte: startDate }
    });
    
    const conversions = await Subscription.countDocuments({
      status: 'active',
      createdAt: { $gte: startDate },
      trialEndDate: { $exists: true }
    });

    const conversionRate = trials > 0 ? (conversions / trials) * 100 : 0;
    return { trials, conversions, conversionRate };
  }

  startBillingCycle() {
    // Process billing daily at midnight
    setInterval(async () => {
      try {
        const now = new Date();
        const subscriptions = await Subscription.find({
          'billing.nextBillingDate': { $lte: now },
          status: 'active',
          plan: { $ne: 'free' }
        });

        for (const subscription of subscriptions) {
          await this.processBilling(subscription._id);
        }

        logger.info(`Processed billing for ${subscriptions.length} subscriptions`);
      } catch (error) {
        logger.error('Billing cycle error:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    logger.info('Billing cycle started');
  }
}

export default SubscriptionService;
