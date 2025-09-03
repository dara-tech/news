/**
 * Enhanced Sentinel Service with Advanced Data Quality Integration
 * Extends the original Sentinel with comprehensive quality assessment
 */

import sentinelService from './sentinelService.mjs';
import advancedDataQualityService from './advancedDataQualityService.mjs';
import logger from '../utils/logger.mjs';
import News from '../models/News.mjs';

class EnhancedSentinelService {
  constructor() {
    this.originalSentinel = sentinelService;
    this.qualityService = advancedDataQualityService;
    this.qualityThreshold = 60; // Minimum quality score for auto-publishing
    this.enhancementEnabled = true;
    this.autoPublishEnabled = false; // Disabled by default for quality control
  }

  /**
   * Initialize the enhanced service
   */
  async initialize() {
    try {
      await this.qualityService.initialize();
      logger.info('Enhanced Sentinel Service initialized with advanced data quality');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Enhanced Sentinel Service:', error);
      return false;
    }
  }

  /**
   * Enhanced content processing with quality assessment
   */
  async processContentWithQualityCheck(item, sourceInfo = {}) {
    try {
      logger.info(`[Enhanced Sentinel] Processing content with quality assessment: ${item.title}`);

      // Step 1: Generate draft using original Sentinel
      const draftJson = await this.originalSentinel.generateDraftJson(item);
      if (!draftJson) {
        logger.warning(`[Enhanced Sentinel] Original Sentinel failed to generate draft for: ${item.title}`);
        return null;
      }

      // Step 2: Perform comprehensive quality assessment
      const qualityAssessment = await this.qualityService.assessDataQuality(draftJson, sourceInfo);
      if (!qualityAssessment) {
        logger.error(`[Enhanced Sentinel] Quality assessment failed for: ${item.title}`);
        return null;
      }

      // Step 3: Enhance content based on quality assessment
      const enhancedDraft = await this.enhanceContentBasedOnQuality(draftJson, qualityAssessment);
      
      // Step 4: Add quality metadata
      enhancedDraft.qualityAssessment = qualityAssessment;
      enhancedDraft.qualityGrade = qualityAssessment.qualityGrade;
      enhancedDraft.qualityScore = qualityAssessment.overallScore;
      enhancedDraft.enhancementMetadata = {
        enhancedBy: 'Enhanced Sentinel Service',
        enhancementDate: new Date().toISOString(),
        qualityThreshold: this.qualityThreshold,
        autoPublishEligible: qualityAssessment.overallScore >= this.qualityThreshold
      };

      logger.info(`[Enhanced Sentinel] Content processed successfully: ${item.title} (Quality: ${qualityAssessment.overallScore}/100, Grade: ${qualityAssessment.qualityGrade})`);

      return enhancedDraft;
    } catch (error) {
      logger.error(`[Enhanced Sentinel] Content processing failed for ${item.title}:`, error);
      return null;
    }
  }

  /**
   * Enhance content based on quality assessment
   */
  async enhanceContentBasedOnQuality(draft, qualityAssessment) {
    try {
      const enhancedDraft = { ...draft };
      const { factorScores, recommendations, enhancementSuggestions } = qualityAssessment;

      // Content accuracy enhancements
      if (factorScores.contentAccuracy?.score < 70) {
        enhancedDraft = await this.enhanceContentAccuracy(enhancedDraft, factorScores.contentAccuracy);
      }

      // Content completeness enhancements
      if (factorScores.contentCompleteness?.score < 70) {
        enhancedDraft = await this.enhanceContentCompleteness(enhancedDraft, factorScores.contentCompleteness);
      }

      // Language quality enhancements
      if (factorScores.languageQuality?.score < 70) {
        enhancedDraft = await this.enhanceLanguageQuality(enhancedDraft, factorScores.languageQuality);
      }

      // Add quality-based tags
      enhancedDraft.tags = this.addQualityBasedTags(draft.tags || [], qualityAssessment);

      // Add quality-based SEO improvements
      enhancedDraft.seo = this.enhanceSEOBasedOnQuality(draft.seo || {}, qualityAssessment);

      return enhancedDraft;
    } catch (error) {
      logger.error('Content enhancement failed:', error);
      return draft;
    }
  }

  /**
   * Enhance content accuracy
   */
  async enhanceContentAccuracy(draft, accuracyAssessment) {
    try {
      if (!this.qualityService.model) {
        return draft;
      }

      const prompt = `
Improve the factual accuracy and credibility of the following news content:

Title: ${draft.title?.en || draft.title || ''}
Content: ${draft.content?.en || draft.content || ''}

Issues identified:
${accuracyAssessment.factualIssues?.join(', ') || 'None'}

Areas needing verification:
${accuracyAssessment.verificationNeeded?.join(', ') || 'None'}

Please enhance the content by:
1. Adding proper source attribution where missing
2. Clarifying ambiguous statements
3. Adding context for better understanding
4. Ensuring factual consistency
5. Improving objectivity and balance

Return the enhanced content in the same JSON format with improved accuracy.`;

      const result = await this.qualityService.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonString = this.qualityService.extractJson(text);
      const enhanced = JSON.parse(jsonString);

      return {
        ...draft,
        title: enhanced.title || draft.title,
        content: enhanced.content || draft.content,
        description: enhanced.description || draft.description
      };
    } catch (error) {
      logger.error('Content accuracy enhancement failed:', error);
      return draft;
    }
  }

  /**
   * Enhance content completeness
   */
  async enhanceContentCompleteness(draft, completenessAssessment) {
    try {
      if (!this.qualityService.model) {
        return draft;
      }

      const prompt = `
Enhance the completeness of the following news content by adding missing journalistic elements:

Title: ${draft.title?.en || draft.title || ''}
Content: ${draft.content?.en || draft.content || ''}

Missing elements identified:
${completenessAssessment.missingElements?.join(', ') || 'None'}

Please enhance the content by adding:
1. Missing WHO information (people, organizations, authorities)
2. Missing WHAT details (specific events, actions, outcomes)
3. Missing WHEN information (timeline, dates, context)
4. Missing WHERE details (locations, venues, regions)
5. Missing WHY context (reasons, causes, motivations)
6. Missing HOW information (processes, methods, procedures)
7. Additional context and background information
8. Expert quotes or official statements where appropriate

Return the enhanced content in the same JSON format with improved completeness.`;

      const result = await this.qualityService.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonString = this.qualityService.extractJson(text);
      const enhanced = JSON.parse(jsonString);

      return {
        ...draft,
        title: enhanced.title || draft.title,
        content: enhanced.content || draft.content,
        description: enhanced.description || draft.description
      };
    } catch (error) {
      logger.error('Content completeness enhancement failed:', error);
      return draft;
    }
  }

  /**
   * Enhance language quality
   */
  async enhanceLanguageQuality(draft, languageAssessment) {
    try {
      if (!this.qualityService.model) {
        return draft;
      }

      const prompt = `
Improve the language quality and readability of the following news content:

Title: ${draft.title?.en || draft.title || ''}
Content: ${draft.content?.en || draft.content || ''}

Language issues identified:
${languageAssessment.issues?.join(', ') || 'None'}

Please enhance the content by:
1. Improving grammar and sentence structure
2. Using active voice where appropriate
3. Varying sentence length for better readability
4. Improving vocabulary and avoiding clichés
5. Ensuring proper punctuation and capitalization
6. Making the content more engaging and professional
7. Improving overall flow and coherence

Return the enhanced content in the same JSON format with improved language quality.`;

      const result = await this.qualityService.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonString = this.qualityService.extractJson(text);
      const enhanced = JSON.parse(jsonString);

      return {
        ...draft,
        title: enhanced.title || draft.title,
        content: enhanced.content || draft.content,
        description: enhanced.description || draft.description
      };
    } catch (error) {
      logger.error('Language quality enhancement failed:', error);
      return draft;
    }
  }

  /**
   * Add quality-based tags
   */
  addQualityBasedTags(existingTags, qualityAssessment) {
    const qualityTags = [];
    
    // Add quality grade tag
    qualityTags.push(`quality-${qualityAssessment.qualityGrade}`);
    
    // Add factor-based tags
    if (qualityAssessment.factorScores.contentAccuracy?.score >= 80) {
      qualityTags.push('high-accuracy');
    }
    if (qualityAssessment.factorScores.sourceReliability?.score >= 80) {
      qualityTags.push('reliable-sources');
    }
    if (qualityAssessment.factorScores.contentCompleteness?.score >= 80) {
      qualityTags.push('comprehensive');
    }
    if (qualityAssessment.factorScores.languageQuality?.score >= 80) {
      qualityTags.push('well-written');
    }
    if (qualityAssessment.factorScores.uniquenessScore?.score >= 80) {
      qualityTags.push('original-content');
    }

    // Add risk factor tags
    if (qualityAssessment.riskFactors?.length > 0) {
      qualityTags.push('needs-review');
    }

    return [...(existingTags || []), ...qualityTags];
  }

  /**
   * Enhance SEO based on quality assessment
   */
  enhanceSEOBasedOnQuality(seo, qualityAssessment) {
    const enhancedSEO = { ...seo };
    
    // Add quality-based keywords
    const qualityKeywords = [];
    if (qualityAssessment.qualityGrade === 'excellent') {
      qualityKeywords.push('high-quality', 'verified', 'reliable');
    }
    if (qualityAssessment.factorScores.sourceReliability?.score >= 80) {
      qualityKeywords.push('credible-sources', 'fact-checked');
    }
    if (qualityAssessment.factorScores.contentCompleteness?.score >= 80) {
      qualityKeywords.push('comprehensive', 'detailed');
    }

    // Enhance meta description with quality indicators
    if (enhancedSEO.metaDescription?.en) {
      const qualityIndicator = qualityAssessment.qualityGrade === 'excellent' ? 'Verified and comprehensive coverage of ' : '';
      enhancedSEO.metaDescription.en = qualityIndicator + enhancedSEO.metaDescription.en;
    }

    // Add quality keywords to existing keywords
    if (enhancedSEO.keywords) {
      enhancedSEO.keywords = enhancedSEO.keywords + ', ' + qualityKeywords.join(', ');
    } else {
      enhancedSEO.keywords = qualityKeywords.join(', ');
    }

    return enhancedSEO;
  }

  /**
   * Get enhanced Sentinel status and configuration
   */
  async getStatus() {
    try {
      return {
        success: true,
        data: {
          qualityThreshold: this.qualityThreshold,
          enhancementEnabled: this.enhancementEnabled,
          autoPublishEnabled: this.autoPublishEnabled,
          qualityServiceStatus: this.qualityService ? 'active' : 'inactive',
          originalSentinelStatus: this.originalSentinel ? 'active' : 'inactive',
          lastRun: new Date().toISOString(),
          configuration: {
            qualityThreshold: this.qualityThreshold,
            enhancementEnabled: this.enhancementEnabled,
            autoPublishEnabled: this.autoPublishEnabled
          }
        }
      };
    } catch (error) {
      logger.error('[Enhanced Sentinel] Failed to get status:', error);
      return {
        success: false,
        message: 'Failed to get status',
        error: error.message
      };
    }
  }

  /**
   * Run enhanced Sentinel with quality assessment
   */
  async runEnhancedSentinel(options = {}) {
    try {
      logger.info('[Enhanced Sentinel] Starting enhanced scanning cycle...');

      // Get configuration from original Sentinel
      const config = await this.originalSentinel.loadConfig();
      const sources = (config.sources || []).filter(s => s.enabled !== false);
      
      if (!sources.length) {
        logger.warning('[Enhanced Sentinel] No enabled sources found');
        return { processed: 0, created: 0, qualityStats: null };
      }

      // Fetch items from sources
      const items = await this.originalSentinel.fetchAllSources();
      logger.info(`[Enhanced Sentinel] Fetched ${items.length} items from sources`);

      // Filter significant items
      const significant = await this.originalSentinel.filterSignificant(items);
      logger.info(`[Enhanced Sentinel] Found ${significant.length} significant items`);

      // Process items with quality assessment
      const maxPerRun = Number(process.env.SENTINEL_MAX_PER_RUN || 3);
      const batch = significant.slice(0, Math.max(1, maxPerRun));
      
      const results = {
        processed: 0,
        created: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
        qualityStats: {
          averageScore: 0,
          qualityDistribution: {},
          recommendations: []
        }
      };

      const qualityScores = [];

      for (const item of batch) {
        try {
          results.processed++;
          
          // Get source info
          const sourceInfo = sources.find(s => s.name === item.sourceName) || {};
          
          // Process with quality assessment
          const enhancedDraft = await this.processContentWithQualityCheck(item, sourceInfo);
          
          if (!enhancedDraft) {
            logger.warning(`[Enhanced Sentinel] Failed to process item: ${item.title}`);
            continue;
          }

          // Track quality scores
          const qualityScore = enhancedDraft.qualityScore;
          qualityScores.push(qualityScore);

          if (qualityScore >= 80) {
            results.highQuality++;
          } else if (qualityScore >= 60) {
            results.mediumQuality++;
          } else {
            results.lowQuality++;
          }

          // Auto-publish if enabled and quality is sufficient
          if (this.autoPublishEnabled && qualityScore >= this.qualityThreshold) {
            const saved = await this.originalSentinel.persistDraft(enhancedDraft, item);
            if (saved) {
              results.created++;
              logger.info(`[Enhanced Sentinel] Auto-published high-quality article: ${enhancedDraft.title?.en} (Quality: ${qualityScore})`);
            }
          } else {
            // Save as draft for manual review
            const saved = await this.originalSentinel.persistDraft(enhancedDraft, item);
            if (saved) {
              results.created++;
              logger.info(`[Enhanced Sentinel] Saved draft for review: ${enhancedDraft.title?.en} (Quality: ${qualityScore})`);
            }
          }

        } catch (error) {
          logger.error(`[Enhanced Sentinel] Error processing item: ${item.title}`, error);
        }
      }

      // Calculate quality statistics
      if (qualityScores.length > 0) {
        results.qualityStats.averageScore = Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length);
        results.qualityStats.qualityDistribution = {
          excellent: qualityScores.filter(s => s >= 90).length,
          good: qualityScores.filter(s => s >= 75 && s < 90).length,
          acceptable: qualityScores.filter(s => s >= 60 && s < 75).length,
          poor: qualityScores.filter(s => s >= 45 && s < 60).length,
          unacceptable: qualityScores.filter(s => s < 45).length
        };
      }

      logger.info(`[Enhanced Sentinel] Enhanced scanning completed: ${results.processed} processed, ${results.created} created, Average Quality: ${results.qualityStats.averageScore}/100`);

      return results;
    } catch (error) {
      logger.error('[Enhanced Sentinel] Enhanced scanning failed:', error);
      return { processed: 0, created: 0, qualityStats: null };
    }
  }

  /**
   * Get quality statistics
   */
  async getQualityStatistics(timeframe = '7d') {
    try {
      return await this.qualityService.getQualityStatistics(timeframe);
    } catch (error) {
      logger.error('Failed to get quality statistics:', error);
      return null;
    }
  }

  /**
   * Update quality threshold
   */
  setQualityThreshold(threshold) {
    if (threshold >= 0 && threshold <= 100) {
      this.qualityThreshold = threshold;
      logger.info(`[Enhanced Sentinel] Quality threshold updated to: ${threshold}`);
    } else {
      logger.error('Invalid quality threshold. Must be between 0 and 100.');
    }
  }

  /**
   * Enable/disable auto-publishing
   */
  setAutoPublishEnabled(enabled) {
    this.autoPublishEnabled = enabled;
    logger.info(`[Enhanced Sentinel] Auto-publish ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get articles by quality grade
   */
  async getArticlesByQuality(grade, limit = 10) {
    try {
      const articles = await News.find({
        'qualityAssessment.qualityGrade': grade
      })
      .sort({ 'qualityAssessment.overallScore': -1 })
      .limit(limit)
      .select('title description qualityAssessment createdAt');

      return articles;
    } catch (error) {
      logger.error('Failed to get articles by quality:', error);
      return [];
    }
  }

  /**
   * Get quality recommendations for improvement
   */
  async getQualityRecommendations() {
    try {
      const stats = await this.getQualityStatistics('30d');
      if (!stats) return [];

      const recommendations = [];

      if (stats.averageScore < 70) {
        recommendations.push({
          priority: 'high',
          category: 'Overall Quality',
          suggestion: 'Focus on improving content accuracy and source reliability',
          impact: 'Will significantly improve average quality score'
        });
      }

      if (stats.qualityDistribution.unacceptable > stats.totalArticles * 0.1) {
        recommendations.push({
          priority: 'high',
          category: 'Content Standards',
          suggestion: 'Implement stricter content filtering to reduce unacceptable quality articles',
          impact: 'Will improve overall content standards'
        });
      }

      if (stats.qualityDistribution.excellent < stats.totalArticles * 0.2) {
        recommendations.push({
          priority: 'medium',
          category: 'Excellence',
          suggestion: 'Focus on creating more excellent quality content',
          impact: 'Will improve brand reputation and user trust'
        });
      }

      return recommendations;
    } catch (error) {
      logger.error('Failed to get quality recommendations:', error);
      return [];
    }
  }

  /**
   * Update quality threshold
   */
  async updateQualityThreshold(threshold) {
    try {
      this.qualityThreshold = threshold;
      logger.info(`Quality threshold updated to ${threshold}`);
      
      return {
        success: true,
        message: 'Quality threshold updated successfully',
        threshold: this.qualityThreshold
      };
    } catch (error) {
      logger.error('Failed to update quality threshold:', error);
      return {
        success: false,
        message: 'Failed to update quality threshold',
        error: error.message
      };
    }
  }

  /**
   * Toggle auto-publish feature
   */
  async toggleAutoPublish(enabled) {
    try {
      this.autoPublishEnabled = enabled;
      logger.info(`Auto-publish feature ${enabled ? 'enabled' : 'disabled'}`);
      
      return {
        success: true,
        message: `Auto-publish feature ${enabled ? 'enabled' : 'disabled'} successfully`,
        autoPublishEnabled: this.autoPublishEnabled
      };
    } catch (error) {
      logger.error('Failed to toggle auto-publish:', error);
      return {
        success: false,
        message: 'Failed to toggle auto-publish feature',
        error: error.message
      };
    }
  }
}

export default new EnhancedSentinelService();
