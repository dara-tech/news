/**
 * Advanced Data Quality Service for Sentinel-PP-01
 * Implements comprehensive data quality assessment, validation, and enhancement
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.mjs';
import News from '../models/News.mjs';
import Settings from '../models/Settings.mjs';

class AdvancedDataQualityService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.qualityMetrics = {
      contentAccuracy: 0.3,      // 30% - Factual accuracy and verification
      sourceReliability: 0.2,    // 20% - Source credibility and reputation
      contentCompleteness: 0.15, // 15% - Information completeness
      languageQuality: 0.15,     // 15% - Grammar, style, readability
      relevanceScore: 0.1,       // 10% - Relevance to target audience
      uniquenessScore: 0.1       // 10% - Originality and uniqueness
    };
    
    this.qualityThresholds = {
      excellent: 90,
      good: 75,
      acceptable: 60,
      poor: 45,
      unacceptable: 0
    };
    
    this.factCheckSources = [
      'reuters.com', 'ap.org', 'bbc.com', 'cnn.com', 'aljazeera.com',
      'nytimes.com', 'washingtonpost.com', 'theguardian.com'
    ];
  }

  async initialize() {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('No Gemini API key available');
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      logger.info('Advanced Data Quality Service initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Advanced Data Quality Service:', error);
      return false;
    }
  }

  /**
   * Comprehensive Data Quality Assessment
   */
  async assessDataQuality(article, sourceInfo = {}) {
    try {
      if (!this.model) {
        await this.initialize();
      }

      const qualityAssessment = {
        overallScore: 0,
        factorScores: {},
        recommendations: [],
        qualityGrade: 'unacceptable',
        riskFactors: [],
        enhancementSuggestions: [],
        factCheckResults: null,
        sourceCredibility: null,
        contentAnalysis: null,
        timestamp: new Date().toISOString()
      };

      // 1. Content Accuracy Assessment
      qualityAssessment.factorScores.contentAccuracy = await this.assessContentAccuracy(article);
      
      // 2. Source Reliability Assessment
      qualityAssessment.factorScores.sourceReliability = await this.assessSourceReliability(sourceInfo);
      
      // 3. Content Completeness Assessment
      qualityAssessment.factorScores.contentCompleteness = await this.assessContentCompleteness(article);
      
      // 4. Language Quality Assessment
      qualityAssessment.factorScores.languageQuality = await this.assessLanguageQuality(article);
      
      // 5. Relevance Score Assessment
      qualityAssessment.factorScores.relevanceScore = await this.assessRelevanceScore(article);
      
      // 6. Uniqueness Score Assessment
      qualityAssessment.factorScores.uniquenessScore = await this.assessUniquenessScore(article);

      // Calculate overall weighted score
      qualityAssessment.overallScore = this.calculateWeightedScore(qualityAssessment.factorScores);
      
      // Determine quality grade
      qualityAssessment.qualityGrade = this.determineQualityGrade(qualityAssessment.overallScore);
      
      // Generate recommendations and risk factors
      qualityAssessment.recommendations = await this.generateQualityRecommendations(qualityAssessment);
      qualityAssessment.riskFactors = this.identifyRiskFactors(qualityAssessment);
      qualityAssessment.enhancementSuggestions = await this.generateEnhancementSuggestions(article, qualityAssessment);

      // Perform fact-checking for high-impact articles
      if (qualityAssessment.overallScore >= 70) {
        qualityAssessment.factCheckResults = await this.performFactCheck(article);
      }

      logger.info(`Data quality assessment completed: ${qualityAssessment.overallScore}/100 (${qualityAssessment.qualityGrade})`);
      
      return qualityAssessment;
    } catch (error) {
      logger.error('Data quality assessment failed:', error);
      return null;
    }
  }

  /**
   * Content Accuracy Assessment (30% weight)
   */
  async assessContentAccuracy(article) {
    try {
      const prompt = `
Analyze the following news content for factual accuracy and credibility:

Title: ${article.title?.en || article.title || ''}
Content: ${article.content?.en || article.content || ''}
Description: ${article.description?.en || article.description || ''}

Rate the content accuracy on a scale of 0-100 based on:
1. Factual consistency and logical coherence
2. Presence of verifiable claims and data
3. Absence of obvious errors or contradictions
4. Proper attribution of sources and quotes
5. Balanced reporting and objectivity

Consider:
- Are the facts presented logically consistent?
- Are there specific, verifiable claims?
- Is the information properly attributed?
- Are multiple perspectives presented when appropriate?
- Are there any obvious factual errors?

Respond with ONLY a JSON object:
{
  "accuracyScore": 85,
  "confidence": "high|medium|low",
  "factualIssues": ["issue1", "issue2"],
  "strengths": ["strength1", "strength2"],
  "verificationNeeded": ["claim1", "claim2"]
}`;

      const result = await this.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonString = this.extractJson(text);
      const analysis = JSON.parse(jsonString);

      return {
        score: analysis.accuracyScore || 0,
        confidence: analysis.confidence || 'low',
        factualIssues: analysis.factualIssues || [],
        strengths: analysis.strengths || [],
        verificationNeeded: analysis.verificationNeeded || []
      };
    } catch (error) {
      logger.error('Content accuracy assessment failed:', error);
      return { score: 0, confidence: 'low', factualIssues: [], strengths: [], verificationNeeded: [] };
    }
  }

  /**
   * Source Reliability Assessment (20% weight)
   */
  async assessSourceReliability(sourceInfo) {
    try {
      const sourceName = sourceInfo.name || sourceInfo.sourceName || 'Unknown';
      const sourceUrl = sourceInfo.url || sourceInfo.link || '';
      
      // Known reliable sources
      const reliableSources = [
        'reuters', 'ap news', 'associated press', 'bbc', 'cnn', 'al jazeera',
        'new york times', 'washington post', 'the guardian', 'wall street journal',
        'bloomberg', 'financial times', 'economist', 'time', 'newsweek'
      ];
      
      // Government and official sources
      const officialSources = [
        'gov', 'government', 'official', 'ministry', 'department', 'agency'
      ];
      
      // Academic and research sources
      const academicSources = [
        'university', 'research', 'study', 'journal', 'academic', 'institute'
      ];

      let reliabilityScore = 50; // Base score
      let confidence = 'medium';
      const factors = [];

      // Check against known reliable sources
      const isReliableSource = reliableSources.some(source => 
        sourceName.toLowerCase().includes(source.toLowerCase())
      );
      
      if (isReliableSource) {
        reliabilityScore += 30;
        factors.push('Known reliable source');
        confidence = 'high';
      }

      // Check for official sources
      const isOfficialSource = officialSources.some(source => 
        sourceName.toLowerCase().includes(source.toLowerCase()) ||
        sourceUrl.toLowerCase().includes(source.toLowerCase())
      );
      
      if (isOfficialSource) {
        reliabilityScore += 20;
        factors.push('Official/government source');
        confidence = 'high';
      }

      // Check for academic sources
      const isAcademicSource = academicSources.some(source => 
        sourceName.toLowerCase().includes(source.toLowerCase()) ||
        sourceUrl.toLowerCase().includes(source.toLowerCase())
      );
      
      if (isAcademicSource) {
        reliabilityScore += 15;
        factors.push('Academic/research source');
        confidence = 'high';
      }

      // Check domain credibility
      if (sourceUrl) {
        const domain = new URL(sourceUrl).hostname.toLowerCase();
        const hasReliableDomain = this.factCheckSources.some(reliableDomain => 
          domain.includes(reliableDomain.toLowerCase())
        );
        
        if (hasReliableDomain) {
          reliabilityScore += 25;
          factors.push('Reliable domain');
          confidence = 'high';
        }
      }

      // Penalize suspicious patterns
      const suspiciousPatterns = [
        /fake/i, /hoax/i, /conspiracy/i, /unverified/i, /rumor/i
      ];
      
      const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
        pattern.test(sourceName) || pattern.test(sourceUrl)
      );
      
      if (hasSuspiciousPattern) {
        reliabilityScore -= 40;
        factors.push('Suspicious source indicators');
        confidence = 'low';
      }

      return {
        score: Math.max(0, Math.min(100, reliabilityScore)),
        confidence,
        factors,
        sourceName,
        sourceUrl
      };
    } catch (error) {
      logger.error('Source reliability assessment failed:', error);
      return { score: 0, confidence: 'low', factors: [], sourceName: 'Unknown', sourceUrl: '' };
    }
  }

  /**
   * Content Completeness Assessment (15% weight)
   */
  async assessContentCompleteness(article) {
    try {
      const title = article.title?.en || article.title || '';
      const content = article.content?.en || article.content || '';
      const description = article.description?.en || article.description || '';
      
      let completenessScore = 0;
      const missingElements = [];
      const strengths = [];

      // Check title quality
      if (title && title.length >= 10) {
        completenessScore += 15;
        strengths.push('Good title length');
      } else {
        missingElements.push('Insufficient title');
      }

      // Check content length and depth
      const contentLength = content.length;
      if (contentLength >= 800) {
        completenessScore += 25;
        strengths.push('Adequate content length');
      } else if (contentLength >= 400) {
        completenessScore += 15;
        missingElements.push('Content could be more detailed');
      } else {
        missingElements.push('Insufficient content length');
      }

      // Check for description
      if (description && description.length >= 50) {
        completenessScore += 10;
        strengths.push('Good description');
      } else {
        missingElements.push('Missing or insufficient description');
      }

      // Check for essential journalistic elements
      const hasWho = /\b(who|whom|person|people|individual|group|organization|company|government)\b/i.test(content);
      const hasWhat = /\b(what|happened|occurred|took place|announced|reported|said|stated)\b/i.test(content);
      const hasWhen = /\b(when|time|date|yesterday|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(content);
      const hasWhere = /\b(where|location|place|city|country|region|area|site|venue)\b/i.test(content);
      const hasWhy = /\b(why|because|reason|cause|purpose|due to|result of|in order to)\b/i.test(content);
      const hasHow = /\b(how|method|process|way|manner|means|through|via|by)\b/i.test(content);

      const essentialElements = [hasWho, hasWhat, hasWhen, hasWhere, hasWhy, hasHow];
      const presentElements = essentialElements.filter(Boolean).length;
      
      completenessScore += (presentElements / 6) * 30;
      
      if (presentElements >= 5) {
        strengths.push('Contains most essential journalistic elements');
      } else {
        missingElements.push(`Missing ${6 - presentElements} essential journalistic elements`);
      }

      // Check for quotes and attribution
      const hasQuotes = /["'`]/.test(content) || /\b(according to|said|stated|reported|announced|declared)\b/i.test(content);
      if (hasQuotes) {
        completenessScore += 10;
        strengths.push('Contains quotes or attribution');
      } else {
        missingElements.push('Lacks quotes or proper attribution');
      }

      // Check for context and background
      const hasContext = /\b(context|background|history|previously|earlier|in the past|traditionally)\b/i.test(content);
      if (hasContext) {
        completenessScore += 10;
        strengths.push('Provides context and background');
      } else {
        missingElements.push('Lacks sufficient context');
      }

      return {
        score: Math.min(100, completenessScore),
        missingElements,
        strengths,
        contentLength,
        essentialElementsPresent: presentElements
      };
    } catch (error) {
      logger.error('Content completeness assessment failed:', error);
      return { score: 0, missingElements: [], strengths: [], contentLength: 0, essentialElementsPresent: 0 };
    }
  }

  /**
   * Language Quality Assessment (15% weight)
   */
  async assessLanguageQuality(article) {
    try {
      const content = article.content?.en || article.content || '';
      const title = article.title?.en || article.title || '';
      
      let languageScore = 0;
      const issues = [];
      const strengths = [];

      // Check for basic grammar and spelling
      const hasProperCapitalization = /[A-Z]/.test(title) && /[A-Z]/.test(content);
      const hasProperPunctuation = /[.!?]/.test(content);
      const hasProperSpacing = !/\s{2,}/.test(content) && !/^\s|\s$/.test(content);
      
      if (hasProperCapitalization) {
        languageScore += 15;
        strengths.push('Proper capitalization');
      } else {
        issues.push('Capitalization issues');
      }
      
      if (hasProperPunctuation) {
        languageScore += 15;
        strengths.push('Proper punctuation');
      } else {
        issues.push('Punctuation issues');
      }
      
      if (hasProperSpacing) {
        languageScore += 10;
        strengths.push('Proper spacing');
      } else {
        issues.push('Spacing issues');
      }

      // Check sentence structure
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgSentenceLength = sentences.length > 0 ? 
        sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length : 0;
      
      if (avgSentenceLength >= 15 && avgSentenceLength <= 30) {
        languageScore += 20;
        strengths.push('Good sentence length variety');
      } else if (avgSentenceLength > 30) {
        languageScore += 10;
        issues.push('Sentences may be too long');
      } else {
        issues.push('Sentences may be too short');
      }

      // Check for readability
      const hasVariedVocabulary = new Set(content.toLowerCase().split(/\W+/)).size > 50;
      if (hasVariedVocabulary) {
        languageScore += 15;
        strengths.push('Varied vocabulary');
      } else {
        issues.push('Limited vocabulary variety');
      }

      // Check for passive voice (should be limited in news writing)
      const passiveVoiceCount = (content.match(/\b(was|were|been|being)\s+\w+ed\b/g) || []).length;
      const totalWords = content.split(/\s+/).length;
      const passiveVoiceRatio = totalWords > 0 ? passiveVoiceCount / totalWords : 0;
      
      if (passiveVoiceRatio < 0.1) {
        languageScore += 15;
        strengths.push('Good active voice usage');
      } else if (passiveVoiceRatio < 0.2) {
        languageScore += 10;
        issues.push('Some passive voice usage');
      } else {
        issues.push('Excessive passive voice');
      }

      // Check for clichés and jargon
      const cliches = [
        'at the end of the day', 'think outside the box', 'game changer',
        'paradigm shift', 'synergy', 'leverage', 'circle back'
      ];
      
      const hasCliches = cliches.some(cliche => 
        content.toLowerCase().includes(cliche.toLowerCase())
      );
      
      if (!hasCliches) {
        languageScore += 10;
        strengths.push('Avoids clichés');
      } else {
        issues.push('Contains clichés or jargon');
      }

      return {
        score: Math.min(100, languageScore),
        issues,
        strengths,
        avgSentenceLength: Math.round(avgSentenceLength),
        passiveVoiceRatio: Math.round(passiveVoiceRatio * 100) / 100,
        vocabularySize: new Set(content.toLowerCase().split(/\W+/)).size
      };
    } catch (error) {
      logger.error('Language quality assessment failed:', error);
      return { score: 0, issues: [], strengths: [], avgSentenceLength: 0, passiveVoiceRatio: 0, vocabularySize: 0 };
    }
  }

  /**
   * Relevance Score Assessment (10% weight)
   */
  async assessRelevanceScore(article) {
    try {
      const content = `${article.title?.en || article.title || ''} ${article.content?.en || article.content || ''}`;
      
      // Define relevance categories and keywords
      const relevanceCategories = {
        local: {
          keywords: ['cambodia', 'phnom penh', 'siem reap', 'battambang', 'sihanoukville', 'kampuchea', 'khmer'],
          weight: 0.4
        },
        regional: {
          keywords: ['asean', 'southeast asia', 'thailand', 'vietnam', 'laos', 'myanmar', 'singapore', 'malaysia', 'indonesia', 'philippines', 'brunei'],
          weight: 0.3
        },
        global: {
          keywords: ['global', 'world', 'international', 'united nations', 'who', 'imf', 'world bank', 'climate change', 'pandemic', 'economy'],
          weight: 0.2
        },
        technology: {
          keywords: ['technology', 'ai', 'artificial intelligence', 'digital', 'innovation', 'startup', 'blockchain', 'crypto', 'cyber'],
          weight: 0.1
        }
      };

      let relevanceScore = 0;
      const matchedCategories = [];

      for (const [category, config] of Object.entries(relevanceCategories)) {
        const matches = config.keywords.filter(keyword => 
          new RegExp(keyword, 'i').test(content)
        );
        
        if (matches.length > 0) {
          const categoryScore = (matches.length / config.keywords.length) * 100 * config.weight;
          relevanceScore += categoryScore;
          matchedCategories.push({
            category,
            matches,
            score: categoryScore
          });
        }
      }

      // Bonus for breaking news indicators
      const breakingKeywords = ['breaking', 'urgent', 'crisis', 'emergency', 'alert', 'update'];
      const hasBreakingKeywords = breakingKeywords.some(keyword => 
        new RegExp(keyword, 'i').test(content)
      );
      
      if (hasBreakingKeywords) {
        relevanceScore += 10;
        matchedCategories.push({
          category: 'breaking',
          matches: breakingKeywords.filter(k => new RegExp(k, 'i').test(content)),
          score: 10
        });
      }

      return {
        score: Math.min(100, relevanceScore),
        matchedCategories,
        totalMatches: matchedCategories.reduce((sum, cat) => sum + cat.matches.length, 0)
      };
    } catch (error) {
      logger.error('Relevance score assessment failed:', error);
      return { score: 0, matchedCategories: [], totalMatches: 0 };
    }
  }

  /**
   * Uniqueness Score Assessment (10% weight)
   */
  async assessUniquenessScore(article) {
    try {
      const title = article.title?.en || article.title || '';
      const content = article.content?.en || article.content || '';
      
      // Check for duplicate content in database
      const contentHash = this.generateContentHash(content);
      const titleHash = this.generateContentHash(title);
      
      // Check for similar titles
      const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      const titleWords = normalizedTitle.split(' ').slice(0, 4).join(' ');
      
      let uniquenessScore = 100; // Start with perfect uniqueness
      const duplicateFactors = [];

      if (titleWords.length > 10) {
        const similarArticles = await News.find({
          $or: [
            { 'title.en': new RegExp(titleWords, 'i') },
            { title: new RegExp(titleWords, 'i') }
          ],
          _id: { $ne: article._id }
        }).limit(5);

        if (similarArticles.length > 0) {
          uniquenessScore -= similarArticles.length * 15;
          duplicateFactors.push(`${similarArticles.length} similar titles found`);
        }
      }

      // Check for content similarity
      const contentWords = content.toLowerCase().split(/\s+/).slice(0, 50).join(' ');
      if (contentWords.length > 20) {
        const similarContent = await News.find({
          $or: [
            { 'content.en': new RegExp(contentWords.slice(0, 30), 'i') },
            { content: new RegExp(contentWords.slice(0, 30), 'i') }
          ],
          _id: { $ne: article._id }
        }).limit(3);

        if (similarContent.length > 0) {
          uniquenessScore -= similarContent.length * 20;
          duplicateFactors.push(`${similarContent.length} similar content found`);
        }
      }

      // Check for generic phrases
      const genericPhrases = [
        'according to sources', 'it has been reported', 'sources say',
        'breaking news', 'latest update', 'more information to follow'
      ];
      
      const genericCount = genericPhrases.filter(phrase => 
        content.toLowerCase().includes(phrase.toLowerCase())
      ).length;
      
      if (genericCount > 0) {
        uniquenessScore -= genericCount * 5;
        duplicateFactors.push(`${genericCount} generic phrases used`);
      }

      return {
        score: Math.max(0, uniquenessScore),
        duplicateFactors,
        contentHash,
        titleHash
      };
    } catch (error) {
      logger.error('Uniqueness score assessment failed:', error);
      return { score: 100, duplicateFactors: [], contentHash: '', titleHash: '' };
    }
  }

  /**
   * Calculate weighted overall score
   */
  calculateWeightedScore(factorScores) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(this.qualityMetrics)) {
      const score = factorScores[factor]?.score || 0;
      totalScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Determine quality grade
   */
  determineQualityGrade(score) {
    if (score >= this.qualityThresholds.excellent) return 'excellent';
    if (score >= this.qualityThresholds.good) return 'good';
    if (score >= this.qualityThresholds.acceptable) return 'acceptable';
    if (score >= this.qualityThresholds.poor) return 'poor';
    return 'unacceptable';
  }

  /**
   * Generate quality recommendations
   */
  async generateQualityRecommendations(assessment) {
    const recommendations = [];
    const { factorScores, overallScore } = assessment;

    // Content accuracy recommendations
    if (factorScores.contentAccuracy?.score < 70) {
      recommendations.push({
        category: 'Content Accuracy',
        priority: 'high',
        suggestion: 'Improve factual verification and source attribution',
        impact: 'High impact on credibility'
      });
    }

    // Source reliability recommendations
    if (factorScores.sourceReliability?.score < 60) {
      recommendations.push({
        category: 'Source Reliability',
        priority: 'high',
        suggestion: 'Use more credible and verified sources',
        impact: 'Critical for trustworthiness'
      });
    }

    // Content completeness recommendations
    if (factorScores.contentCompleteness?.score < 70) {
      recommendations.push({
        category: 'Content Completeness',
        priority: 'medium',
        suggestion: 'Add missing journalistic elements (who, what, when, where, why, how)',
        impact: 'Improves information value'
      });
    }

    // Language quality recommendations
    if (factorScores.languageQuality?.score < 70) {
      recommendations.push({
        category: 'Language Quality',
        priority: 'medium',
        suggestion: 'Improve grammar, style, and readability',
        impact: 'Enhances professional appearance'
      });
    }

    // Relevance recommendations
    if (factorScores.relevanceScore?.score < 50) {
      recommendations.push({
        category: 'Relevance',
        priority: 'low',
        suggestion: 'Consider target audience relevance',
        impact: 'May affect engagement'
      });
    }

    // Uniqueness recommendations
    if (factorScores.uniquenessScore?.score < 80) {
      recommendations.push({
        category: 'Uniqueness',
        priority: 'medium',
        suggestion: 'Reduce content duplication and generic phrases',
        impact: 'Improves originality'
      });
    }

    return recommendations;
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors(assessment) {
    const risks = [];
    const { factorScores, overallScore } = assessment;

    if (overallScore < 60) {
      risks.push({
        level: 'high',
        factor: 'Overall Quality',
        description: 'Article quality below acceptable threshold',
        mitigation: 'Requires significant improvement before publication'
      });
    }

    if (factorScores.contentAccuracy?.score < 50) {
      risks.push({
        level: 'critical',
        factor: 'Factual Accuracy',
        description: 'High risk of factual errors',
        mitigation: 'Mandatory fact-checking required'
      });
    }

    if (factorScores.sourceReliability?.score < 40) {
      risks.push({
        level: 'high',
        factor: 'Source Credibility',
        description: 'Unreliable or unverified sources',
        mitigation: 'Replace with credible sources'
      });
    }

    if (factorScores.uniquenessScore?.score < 50) {
      risks.push({
        level: 'medium',
        factor: 'Content Duplication',
        description: 'High similarity to existing content',
        mitigation: 'Rewrite or add unique perspective'
      });
    }

    return risks;
  }

  /**
   * Generate enhancement suggestions
   */
  async generateEnhancementSuggestions(article, assessment) {
    const suggestions = [];
    const { factorScores } = assessment;

    // Content enhancement suggestions
    if (factorScores.contentCompleteness?.score < 80) {
      suggestions.push({
        type: 'content',
        suggestion: 'Add more context and background information',
        implementation: 'Include historical context, relevant statistics, and expert opinions'
      });
    }

    // Source enhancement suggestions
    if (factorScores.sourceReliability?.score < 80) {
      suggestions.push({
        type: 'sources',
        suggestion: 'Add more authoritative sources',
        implementation: 'Include quotes from experts, official statements, and verified data'
      });
    }

    // Language enhancement suggestions
    if (factorScores.languageQuality?.score < 80) {
      suggestions.push({
        type: 'language',
        suggestion: 'Improve writing style and clarity',
        implementation: 'Use active voice, vary sentence length, and improve readability'
      });
    }

    return suggestions;
  }

  /**
   * Perform fact-checking for high-quality articles
   */
  async performFactCheck(article) {
    try {
      const content = article.content?.en || article.content || '';
      
      // Extract factual claims
      const claims = this.extractFactualClaims(content);
      
      if (claims.length === 0) {
        return {
          status: 'no_claims',
          message: 'No verifiable factual claims found',
          claims: []
        };
      }

      // For now, return a basic fact-check structure
      // In a production system, this would integrate with fact-checking APIs
      return {
        status: 'completed',
        claims: claims.map(claim => ({
          claim,
          status: 'pending_verification',
          confidence: 'medium',
          sources: []
        })),
        overallVerification: 'pending',
        recommendations: ['Verify all statistical claims', 'Cross-reference with multiple sources']
      };
    } catch (error) {
      logger.error('Fact-checking failed:', error);
      return null;
    }
  }

  /**
   * Extract factual claims from content
   */
  extractFactualClaims(content) {
    const claims = [];
    
    // Look for statistical claims
    const statsRegex = /(\d+(?:\.\d+)?%?)\s+(?:of|in|from|to|per|every|each)\s+([^.!?]+)/gi;
    let match;
    while ((match = statsRegex.exec(content)) !== null) {
      claims.push(`Statistical claim: ${match[0]}`);
    }

    // Look for date/time claims
    const dateRegex = /(?:on|in|at|since|until|from|to)\s+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}|\w+\s+\d{1,2},?\s+\d{4})/gi;
    while ((match = dateRegex.exec(content)) !== null) {
      claims.push(`Date claim: ${match[0]}`);
    }

    // Look for attribution claims
    const attributionRegex = /(?:according to|said|stated|reported|announced|declared)\s+([^.!?]+)/gi;
    while ((match = attributionRegex.exec(content)) !== null) {
      claims.push(`Attribution claim: ${match[0]}`);
    }

    return claims.slice(0, 10); // Limit to 10 claims
  }

  /**
   * Generate content hash for uniqueness checking
   */
  generateContentHash(content) {
    let hash = 0;
    const text = content.toLowerCase().replace(/\s+/g, ' ').trim();
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Extract JSON from AI response
   */
  extractJson(text) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : '{}';
  }

  /**
   * Get quality statistics
   */
  async getQualityStatistics(timeframe = '7d') {
    try {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const articles = await News.find({
        createdAt: { $gte: startDate },
        'qualityAssessment.overallScore': { $exists: true }
      });

      if (articles.length === 0) {
        return {
          totalArticles: 0,
          averageScore: 0,
          qualityDistribution: {},
          trends: []
        };
      }

      const scores = articles.map(article => article.qualityAssessment.overallScore);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      const qualityDistribution = {
        excellent: scores.filter(s => s >= 90).length,
        good: scores.filter(s => s >= 75 && s < 90).length,
        acceptable: scores.filter(s => s >= 60 && s < 75).length,
        poor: scores.filter(s => s >= 45 && s < 60).length,
        unacceptable: scores.filter(s => s < 45).length
      };

      return {
        totalArticles: articles.length,
        averageScore: Math.round(averageScore),
        qualityDistribution,
        trends: this.calculateQualityTrends(articles)
      };
    } catch (error) {
      logger.error('Failed to get quality statistics:', error);
      return null;
    }
  }

  /**
   * Calculate quality trends
   */
  calculateQualityTrends(articles) {
    const trends = [];
    const dailyScores = {};

    articles.forEach(article => {
      const date = article.createdAt.toISOString().split('T')[0];
      if (!dailyScores[date]) {
        dailyScores[date] = [];
      }
      dailyScores[date].push(article.qualityAssessment.overallScore);
    });

    Object.entries(dailyScores).forEach(([date, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      trends.push({
        date,
        averageScore: Math.round(average),
        articleCount: scores.length
      });
    });

    return trends.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get quality recommendations
   */
  async getQualityRecommendations() {
    try {
      const articles = await News.find({
        'qualityAssessment.overallScore': { $exists: true }
      }).limit(100);

      if (articles.length === 0) {
        return [];
      }

      const recommendations = [];
      const lowQualityArticles = articles.filter(article => 
        article.qualityAssessment.overallScore < 60
      );

      if (lowQualityArticles.length > 0) {
        recommendations.push({
          category: 'Content Quality',
          priority: 'high',
          suggestion: `Review ${lowQualityArticles.length} articles with low quality scores`,
          impact: 'Improve overall content quality and user experience'
        });
      }

      const incompleteArticles = articles.filter(article => 
        article.qualityAssessment.factorScores?.contentCompleteness?.score < 70
      );

      if (incompleteArticles.length > 0) {
        recommendations.push({
          category: 'Content Completeness',
          priority: 'medium',
          suggestion: `Enhance ${incompleteArticles.length} articles with incomplete content`,
          impact: 'Provide more comprehensive information to readers'
        });
      }

      return recommendations;
    } catch (error) {
      logger.error('Failed to get quality recommendations:', error);
      return [];
    }
  }

  /**
   * Get articles by quality grade
   */
  async getArticlesByGrade(grade, limit = 10) {
    try {
      let scoreRange = {};
      
      switch (grade) {
        case 'excellent':
          scoreRange = { $gte: 90 };
          break;
        case 'good':
          scoreRange = { $gte: 75, $lt: 90 };
          break;
        case 'acceptable':
          scoreRange = { $gte: 60, $lt: 75 };
          break;
        case 'poor':
          scoreRange = { $gte: 45, $lt: 60 };
          break;
        case 'unacceptable':
          scoreRange = { $lt: 45 };
          break;
        default:
          return [];
      }

      const articles = await News.find({
        'qualityAssessment.overallScore': scoreRange
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title content qualityAssessment createdAt status');

      return articles;
    } catch (error) {
      logger.error('Failed to get articles by grade:', error);
      return [];
    }
  }

  /**
   * Get quality overview
   */
  async getQualityOverview() {
    try {
      const statistics = await this.getQualityStatistics('7d');
      const recommendations = await this.getQualityRecommendations();
      
      return {
        statistics,
        recommendations,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get quality overview:', error);
      return null;
    }
  }
}

export default new AdvancedDataQualityService();
