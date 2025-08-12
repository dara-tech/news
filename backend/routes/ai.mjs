import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Available Gemini models
const GEMINI_MODELS = {
  'gemini-pro': 'gemini-pro',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-pro-vision': 'gemini-pro-vision'
};

// Generate content with Gemini
router.post('/gemini/generate', async (req, res) => {
  try {
    const { prompt, options, sourceContent, metadata } = req.body;
    const modelName = options?.model || 'gemini-pro';

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Get the model
    // Use gemini-1.5-flash as fallback if the requested model is not available
    const fallbackModel = 'gemini-1.5-flash';
    const modelToUse = GEMINI_MODELS[modelName] || fallbackModel;
    const model = genAI.getGenerativeModel({ model: modelToUse });

    // Build the full prompt
    let fullPrompt = prompt;
    if (sourceContent) {
      fullPrompt += `\n\nSource Content:\n${sourceContent}`;
    }

    // Add context based on options
    if (options?.tone) {
      fullPrompt += `\n\nTone: ${options.tone}`;
    }
    if (options?.length) {
      fullPrompt += `\n\nLength: ${options.length}`;
    }
    if (options?.style) {
      fullPrompt += `\n\nStyle: ${options.style}`;
    }
    if (options?.keywords?.length > 0) {
      fullPrompt += `\n\nKeywords to include: ${options.keywords.join(', ')}`;
    }

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Calculate metadata
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

    const generationResponse = {
      content: text,
      metadata: {
        wordCount,
        readingTime,
        language: 'en', // Default, could be detected
        confidence: 0.95, // Gemini confidence
        model: modelName,
        timestamp: new Date().toISOString(),
        tokensUsed,
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        responseTokens: response.usageMetadata?.candidatesTokenCount || 0
      },
      suggestions: {
        title: text.split('\n')[0]?.substring(0, 100),
        keywords: extractKeywords(text),
        tags: extractTags(text),
        summary: text.split('\n').slice(0, 3).join('\n')
      }
    };

    res.json({
      success: true,
      response: generationResponse
    });

  } catch (error) {
    console.error('Gemini generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate content with Gemini'
    });
  }
});

// Get Gemini usage statistics
router.get('/gemini/usage', async (req, res) => {
  try {
    // This would typically fetch from your database or Gemini API
    // For now, returning mock data
    const usageStats = {
      totalRequests: 150,
      totalTokens: 45000,
      cost: 0.045, // $0.045 based on Gemini pricing
      lastUsed: new Date().toISOString(),
      dailyLimit: 1000,
      remainingRequests: 850,
      geminiUsage: {
        requestsToday: 25,
        tokensToday: 7500,
        quotaRemaining: 975
      }
    };

    res.json({
      success: true,
      stats: usageStats
    });

  } catch (error) {
    console.error('Gemini usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gemini usage statistics'
    });
  }
});

// Get available Gemini models
router.get('/gemini/models', async (req, res) => {
  try {
    const models = [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Best for text generation and analysis',
        capabilities: ['text-generation', 'text-analysis', 'summarization', 'translation'],
        maxTokens: 30000,
        costPerToken: 0.0005,
        isAvailable: true,
        provider: 'google'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Advanced model with longer context window',
        capabilities: ['text-generation', 'text-analysis', 'summarization', 'translation', 'long-context'],
        maxTokens: 1000000,
        costPerToken: 0.00375,
        isAvailable: true,
        provider: 'google'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient for most tasks',
        capabilities: ['text-generation', 'text-analysis', 'summarization', 'translation'],
        maxTokens: 1000000,
        costPerToken: 0.000075,
        isAvailable: true,
        provider: 'google'
      }
    ];

    res.json({
      success: true,
      models
    });

  } catch (error) {
    console.error('Gemini models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gemini models'
    });
  }
});

// Validate Gemini configuration
router.get('/gemini/validate', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    // Test the API key with a simple request
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hello');
    await result.response;

    res.json({
      success: true,
      message: 'Gemini configuration is valid'
    });

  } catch (error) {
    console.error('Gemini validation error:', error);
    res.json({
      success: false,
      message: 'Gemini configuration is invalid: ' + error.message
    });
  }
});

// Check Gemini status
router.get('/gemini/status', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    res.json({
      success: true,
      message: 'Gemini is available'
    });

  } catch (error) {
    console.error('Gemini status error:', error);
    res.json({
      success: false,
      message: 'Gemini is not available'
    });
  }
});

// Helper functions
function extractKeywords(text) {
  // Simple keyword extraction - in production, use a proper NLP library
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function extractTags(text) {
  // Simple tag extraction based on common patterns
  const tags = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('#') || line.startsWith('*')) {
      const tag = line.replace(/[#*]/g, '').trim();
      if (tag) tags.push(tag);
    }
  });
  
  return tags.slice(0, 5);
}

export default router;
