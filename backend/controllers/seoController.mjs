import asyncHandler from "express-async-handler";
import News from "../models/News.mjs";
import seoService from "../services/seoService.mjs";

// @desc    Get SEO analysis for a specific article
// @route   GET /api/admin/seo/article/:id
// @access  Private/Admin
export const getArticleSEOAnalysis = asyncHandler(async (req, res) => {
  try {
    const article = await News.findById(req.params.id)
      .populate('author', 'username role')
      .populate('category', 'name');

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    const seoAnalysis = await seoService.calculateSEOScore(article);
    const metaTags = seoService.generateMetaTags(article);

    res.json({
      success: true,
      data: {
        article,
        seoAnalysis,
        metaTags
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing SEO',
      error: error.message
    });
  }
});

// @desc    Get SEO analysis for all articles
// @route   GET /api/admin/seo/articles
// @access  Private/Admin
export const getAllArticlesSEOAnalysis = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'published' } = req.query;
    
    const query = { status };
    const articles = await News.find(query)
      .populate('author', 'username role')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const seoAnalyses = [];
    let totalScore = 0;

    for (const article of articles) {
      const analysis = await seoService.calculateSEOScore(article);
      if (analysis) {
        seoAnalyses.push({
          article: {
            _id: article._id,
            title: article.title,
            slug: article.slug,
            status: article.status,
            publishedAt: article.publishedAt,
            views: article.views,
            isFeatured: article.isFeatured,
            isBreaking: article.isBreaking
          },
          seoAnalysis: analysis
        });
        totalScore += analysis.overallScore;
      }
    }

    const averageScore = seoAnalyses.length > 0 ? Math.round(totalScore / seoAnalyses.length) : 0;

    res.json({
      success: true,
      data: {
        articles: seoAnalyses,
        averageScore,
        totalArticles: seoAnalyses.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing SEO',
      error: error.message
    });
  }
});

// @desc    Get SEO dashboard statistics
// @route   GET /api/admin/seo/dashboard
// @access  Private/Admin
export const getSEODashboard = asyncHandler(async (req, res) => {
  try {
    const totalArticles = await News.countDocuments({ status: 'published' });
    const featuredArticles = await News.countDocuments({ status: 'published', isFeatured: true });
    const breakingArticles = await News.countDocuments({ status: 'published', isBreaking: true });
    const recentArticles = await News.countDocuments({ 
      status: 'published', 
      publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // Get sample articles for analysis
    const sampleArticles = await News.find({ status: 'published' })
      .populate('author', 'username role')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .limit(10);

    const seoAnalyses = [];
    let totalScore = 0;

    for (const article of sampleArticles) {
      const analysis = await seoService.calculateSEOScore(article);
      if (analysis) {
        seoAnalyses.push({
          article: {
            _id: article._id,
            title: article.title,
            slug: article.slug,
            views: article.views,
            isFeatured: article.isFeatured,
            isBreaking: article.isBreaking
          },
          seoAnalysis: analysis
        });
        totalScore += analysis.overallScore;
      }
    }

    const averageScore = seoAnalyses.length > 0 ? Math.round(totalScore / seoAnalyses.length) : 0;

    // Calculate grade distribution
    const gradeDistribution = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0
    };

    seoAnalyses.forEach(({ seoAnalysis }) => {
      gradeDistribution[seoAnalysis.seoGrade]++;
    });

    // Get top recommendations
    const allRecommendations = [];
    seoAnalyses.forEach(({ seoAnalysis }) => {
      allRecommendations.push(...seoAnalysis.recommendations);
    });

    const topRecommendations = allRecommendations
      .filter(rec => rec.priority === 'high')
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        statistics: {
          totalArticles,
          featuredArticles,
          breakingArticles,
          recentArticles,
          averageScore
        },
        gradeDistribution,
        topRecommendations,
        recentAnalyses: seoAnalyses.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting SEO dashboard',
      error: error.message
    });
  }
});

// @desc    Optimize article SEO automatically
// @route   POST /api/admin/seo/optimize/:id
// @access  Private/Admin
export const optimizeArticleSEO = asyncHandler(async (req, res) => {
  try {
    const article = await News.findById(req.params.id);

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    const optimizations = [];
    const updates = {};

    // Optimize title if needed
    const title = article.title?.en || '';
    if (title.length < 30) {
      updates['title.en'] = `${title} - Latest News | Razewire`;
      optimizations.push('Expanded title for better SEO');
    }

    // Optimize description if needed
    const description = article.description?.en || '';
    if (description.length < 120) {
      updates['description.en'] = `${description} Read more about this breaking news story.`;
      optimizations.push('Expanded description for better CTR');
    }

    // Generate keywords if missing
    if (!article.keywords) {
      const titleKeywords = title.toLowerCase().split(' ').filter(word => word.length > 3);
      const baseKeywords = ['Cambodia', 'news', 'Southeast Asia'];
      const keywords = [...baseKeywords, ...titleKeywords].slice(0, 10).join(', ');
      updates.keywords = keywords;
      optimizations.push('Generated keywords for better search visibility');
    }

    // Add meta description if missing
    if (!article.metaDescription) {
      const metaDesc = description.length > 160 ? description.substring(0, 157) + '...' : description;
      updates.metaDescription = { en: metaDesc, kh: metaDesc };
      optimizations.push('Added meta description for better search results');
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await News.findByIdAndUpdate(article._id, updates);
    }

    // Get updated analysis
    const updatedArticle = await News.findById(req.params.id)
      .populate('author', 'username role')
      .populate('category', 'name');

    const seoAnalysis = await seoService.calculateSEOScore(updatedArticle);
    const metaTags = seoService.generateMetaTags(updatedArticle);

    res.json({
      success: true,
      message: 'SEO optimization completed',
      data: {
        optimizations,
        article: updatedArticle,
        seoAnalysis,
        metaTags
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error optimizing SEO',
      error: error.message
    });
  }
});

// @desc    Get SEO recommendations for all articles
// @route   GET /api/admin/seo/recommendations
// @access  Private/Admin
export const getSEORecommendations = asyncHandler(async (req, res) => {
  try {
    const { priority = 'all', category = 'all' } = req.query;
    
    const articles = await News.find({ status: 'published' })
      .populate('author', 'username role')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .limit(50);

    const allRecommendations = [];

    for (const article of articles) {
      const analysis = await seoService.calculateSEOScore(article);
      if (analysis && analysis.recommendations.length > 0) {
        analysis.recommendations.forEach(rec => {
          allRecommendations.push({
            ...rec,
            article: {
              _id: article._id,
              title: article.title,
              slug: article.slug
            }
          });
        });
      }
    }

    // Filter by priority and category
    let filteredRecommendations = allRecommendations;
    
    if (priority !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(rec => rec.priority === priority);
    }
    
    if (category !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(rec => rec.category === category);
    }

    // Group by recommendation type
    const groupedRecommendations = {};
    filteredRecommendations.forEach(rec => {
      if (!groupedRecommendations[rec.action]) {
        groupedRecommendations[rec.action] = [];
      }
      groupedRecommendations[rec.action].push(rec);
    });

    res.json({
      success: true,
      data: {
        recommendations: filteredRecommendations,
        groupedRecommendations,
        total: filteredRecommendations.length,
        priority,
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting SEO recommendations',
      error: error.message
    });
  }
});

