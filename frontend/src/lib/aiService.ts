// Frontend-only AI service using Google Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with error handling
let genAI: GoogleGenerativeAI | null = null;

try {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error);
  genAI = null;
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 15, // Conservative limit
  maxRequestsPerHour: 100,
  retryDelay: 2000, // 2 seconds
  maxRetries: 3
};

// Rate limiting state
let requestCount = 0;
let lastRequestTime = 0;
let hourlyRequestCount = 0;
let lastHourReset = Date.now();

// Available Gemini models
const GEMINI_MODELS = {
  'gemini-pro': 'gemini-pro',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-pro-vision': 'gemini-pro-vision'
};

export interface AIOptions {
  model?: string;
  tone?: string;
  length?: string;
  style?: string;
  keywords?: string[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    language: string;
    confidence: number;
    model: string;
    timestamp: string;
    tokensUsed: number;
    promptTokens: number;
    responseTokens: number;
  };
  suggestions: {
    title: string;
    keywords: string[];
    tags: string[];
    summary: string;
  };
}

// Rate limiting function
function checkRateLimit(): { allowed: boolean; waitTime?: number; message?: string } {
  const now = Date.now();
  
  // Reset hourly counter if an hour has passed
  if (now - lastHourReset > 60 * 60 * 1000) {
    hourlyRequestCount = 0;
    lastHourReset = now;
  }
  
  // Check hourly limit
  if (hourlyRequestCount >= RATE_LIMIT_CONFIG.maxRequestsPerHour) {
    const timeUntilReset = 60 * 60 * 1000 - (now - lastHourReset);
    return {
      allowed: false,
      waitTime: timeUntilReset,
      message: `Hourly limit reached. Please wait ${Math.ceil(timeUntilReset / 60000)} minutes.`
    };
  }
  
  // Check per-minute limit
  if (now - lastRequestTime < 60000) { // Within last minute
    if (requestCount >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
      const timeUntilReset = 60000 - (now - lastRequestTime);
      return {
        allowed: false,
        waitTime: timeUntilReset,
        message: `Rate limit reached. Please wait ${Math.ceil(timeUntilReset / 1000)} seconds.`
      };
    }
  } else {
    // Reset per-minute counter
    requestCount = 0;
  }
  
  return { allowed: true };
}

// Update rate limit counters
function updateRateLimit() {
  const now = Date.now();
  
  if (now - lastRequestTime < 60000) {
    requestCount++;
  } else {
    requestCount = 1;
  }
  
  lastRequestTime = now;
  hourlyRequestCount++;
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = RATE_LIMIT_CONFIG.maxRetries
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error
      if (error.message?.includes('quota') || 
          error.message?.includes('429') || 
          error.message?.includes('rate limit') ||
          error.message?.includes('too many requests')) {
        
        if (attempt < maxRetries) {
          const delay = RATE_LIMIT_CONFIG.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // For non-rate-limit errors, don't retry
      throw error;
    }
  }
  
  throw lastError;
}

// Helper function to extract keywords from text
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

// Helper function to extract tags from text
function extractTags(text: string): string[] {
  const commonTags = ['technology', 'business', 'health', 'science', 'politics', 'entertainment', 'sports'];
  const textLower = text.toLowerCase();
  
  return commonTags.filter(tag => textLower.includes(tag));
}

// Enhanced query analysis function
function analyzeQuery(query: string): {
  type: 'research' | 'content' | 'chat' | 'analysis' | 'explanation';
  confidence: number;
  suggestedOptions: Partial<AIOptions>;
} {
  const queryLower = query.toLowerCase();
  
  // Research indicators
  const researchKeywords = ['research', 'study', 'analysis', 'investigate', 'examine', 'explore', 'survey', 'report'];
  const researchScore = researchKeywords.filter(keyword => queryLower.includes(keyword)).length;
  
  // Content generation indicators
  const contentKeywords = ['write', 'create', 'generate', 'compose', 'draft', 'develop', 'produce'];
  const contentScore = contentKeywords.filter(keyword => queryLower.includes(keyword)).length;
  
  // Analysis indicators
  const analysisKeywords = ['analyze', 'compare', 'evaluate', 'assess', 'review', 'examine', 'break down'];
  const analysisScore = analysisKeywords.filter(keyword => queryLower.includes(keyword)).length;
  
  // Explanation indicators
  const explanationKeywords = ['explain', 'describe', 'define', 'clarify', 'elaborate', 'detail', 'how', 'what', 'why'];
  const explanationScore = explanationKeywords.filter(keyword => queryLower.includes(keyword)).length;
  
  const scores = [
    { type: 'research' as const, score: researchScore },
    { type: 'content' as const, score: contentScore },
    { type: 'analysis' as const, score: analysisScore },
    { type: 'explanation' as const, score: explanationScore },
    { type: 'chat' as const, score: 0.5 } // Default fallback
  ];
  
  const bestMatch = scores.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );
  
  const suggestedOptions: Partial<AIOptions> = {
    model: 'gemini-1.5-flash',
    temperature: 0.7
  };
  
  switch (bestMatch.type) {
    case 'research':
      suggestedOptions.tone = 'academic';
      suggestedOptions.length = 'comprehensive';
      suggestedOptions.style = 'research';
      break;
    case 'content':
      suggestedOptions.tone = 'professional';
      suggestedOptions.length = 'medium';
      suggestedOptions.style = 'content';
      break;
    case 'analysis':
      suggestedOptions.tone = 'analytical';
      suggestedOptions.length = 'comprehensive';
      suggestedOptions.style = 'analysis';
      break;
    case 'explanation':
      suggestedOptions.tone = 'educational';
      suggestedOptions.length = 'medium';
      suggestedOptions.style = 'explanation';
      break;
    case 'chat':
      suggestedOptions.tone = 'conversational';
      suggestedOptions.length = 'medium';
      suggestedOptions.style = 'chat';
      break;
  }
  
  return {
    type: bestMatch.type,
    confidence: Math.min(bestMatch.score / 3, 1), // Normalize confidence
    suggestedOptions
  };
}

// Main AI generation function
export async function generateContent(
  prompt: string, 
  options: AIOptions = {}, 
  sourceContent?: string
): Promise<AIResponse> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI service is not initialized. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set.');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.message || 'Rate limit exceeded');
    }

    // Analyze query and enhance options
    const queryAnalysis = analyzeQuery(prompt);
    const enhancedOptions = { ...queryAnalysis.suggestedOptions, ...options };

    // Get the model
    const fallbackModel = 'gemini-1.5-flash';
    const modelName = enhancedOptions.model || 'gemini-1.5-flash';
    const modelToUse = GEMINI_MODELS[modelName as keyof typeof GEMINI_MODELS] || fallbackModel;
    const model = genAI.getGenerativeModel({ 
      model: modelToUse,
      generationConfig: {
        temperature: enhancedOptions.temperature || 0.7,
        maxOutputTokens: enhancedOptions.maxTokens || 2048,
      }
    });

    // Build the enhanced prompt based on query type
    let fullPrompt = prompt;
    
    // Add context based on query type
    switch (queryAnalysis.type) {
      case 'research':
        fullPrompt = `Please conduct comprehensive research on: ${prompt}

Research Requirements:
- Provide detailed analysis and insights
- Include key findings and conclusions
- Format the response in a structured way
- Consider multiple perspectives
- Include relevant statistics and data where applicable

Please provide a comprehensive research report.`;
        break;
        
      case 'content':
        fullPrompt = `Please create high-quality content about: ${prompt}

Content Requirements:
- Engaging and well-structured
- Appropriate for the target audience
- Include relevant examples and details
- Optimize for readability and engagement
- Include a compelling introduction and conclusion

Please create professional, engaging content.`;
        break;
        
      case 'analysis':
        fullPrompt = `Please provide a detailed analysis of: ${prompt}

Analysis Requirements:
- Break down the topic systematically
- Provide evidence and examples
- Consider different viewpoints
- Draw clear conclusions
- Suggest implications or recommendations

Please provide a thorough analysis.`;
        break;
        
      case 'explanation':
        fullPrompt = `Please explain: ${prompt}

Explanation Requirements:
- Use clear, simple language
- Provide examples and analogies
- Break down complex concepts
- Ensure understanding for various knowledge levels
- Include practical applications if relevant

Please provide a clear, comprehensive explanation.`;
        break;
        
      default:
        // General chat - keep original prompt
        break;
    }

    if (sourceContent) {
      fullPrompt += `\n\nSource Content:\n${sourceContent}`;
    }

    // Add context based on options
    if (enhancedOptions.tone) {
      fullPrompt += `\n\nTone: ${enhancedOptions.tone}`;
    }
    if (enhancedOptions.length) {
      fullPrompt += `\n\nLength: ${enhancedOptions.length}`;
    }
    if (enhancedOptions.style) {
      fullPrompt += `\n\nStyle: ${enhancedOptions.style}`;
    }
    if (enhancedOptions.keywords?.length) {
      fullPrompt += `\n\nKeywords to include: ${enhancedOptions.keywords.join(', ')}`;
    }

    // Update rate limit counters
    updateRateLimit();

    // Generate content with retry logic and better error handling
    const result = await retryWithBackoff(async () => {
      try {
        const result = await model.generateContent(fullPrompt);
        return result;
      } catch (error: any) {
        console.error('❌ Content generation failed:', error);
        
        // Provide more specific error messages
        if (error.message?.includes('API key')) {
          throw new Error('Invalid API key. Please check your Gemini API key configuration.');
        } else if (error.message?.includes('quota') || error.message?.includes('429')) {
          throw new Error('API quota exceeded. Please try again later or upgrade your plan.');
        } else if (error.message?.includes('model')) {
          throw new Error('Model not available. Please try a different model.');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
        }
      }
    });
    
    const response = await result.response;
    const text = response.text();

    // Calculate metadata
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

    const generationResponse: AIResponse = {
      content: text,
      metadata: {
        wordCount,
        readingTime,
        language: 'en', // Default, could be detected
        confidence: queryAnalysis.confidence,
        model: modelName,
        timestamp: new Date().toISOString(),
        tokensUsed,
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        responseTokens: response.usageMetadata?.candidatesTokenCount || 0
      },
      suggestions: {
        title: text.split('\n')[0]?.substring(0, 100) || '',
        keywords: extractKeywords(text),
        tags: extractTags(text),
        summary: text.split('\n').slice(0, 3).join('\n')
      }
    };

    return generationResponse;

  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

// Enhanced unified query function (Perplexity-style)
export async function processQuery(
  query: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  model: string = 'gemini-1.5-flash'
): Promise<AIResponse> {
  const queryAnalysis = analyzeQuery(query);
  
  // Build conversation context
  let fullPrompt = '';
  
  if (conversationHistory.length > 0) {
    fullPrompt = 'Previous conversation:\n';
    conversationHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    fullPrompt += '\n';
  }
  
  // Add the current query with context
  fullPrompt += `User: ${query}\n\nAssistant:`;

  return generateContent(fullPrompt, {
    model,
    ...queryAnalysis.suggestedOptions
  });
}

// Research function
export async function conductResearch(
  topic: string,
  depth: string = 'comprehensive',
  sources: string = 'academic',
  timeframe: string = 'recent',
  language: string = 'en'
): Promise<AIResponse> {
  const researchPrompt = `Please conduct ${depth} research on "${topic}". 
  
Requirements:
- Focus on ${sources} sources
- Consider ${timeframe} information
- Provide detailed analysis and insights
- Include key findings and conclusions
- Format the response in a structured way
- Include relevant statistics and data
- Consider multiple perspectives

Please provide a comprehensive research report.`;

  return generateContent(researchPrompt, {
    model: 'gemini-1.5-flash',
    tone: 'academic',
    length: 'comprehensive',
    style: 'research'
  });
}

// Content generation function
export async function generateContentByType(
  prompt: string,
  contentType: string = 'article',
  tone: string = 'professional',
  length: string = 'medium',
  audience: string = 'general',
  language: string = 'en',
  keywords: string[] = []
): Promise<AIResponse> {
  const contentPrompt = `Generate a ${contentType} based on the following prompt: "${prompt}"

Requirements:
- Tone: ${tone}
- Length: ${length}
- Target audience: ${audience}
- Language: ${language}
${keywords.length > 0 ? `- Include these keywords: ${keywords.join(', ')}` : ''}

Please create high-quality, engaging content.`;

  return generateContent(contentPrompt, {
    model: 'gemini-1.5-flash',
    tone,
    length,
    style: contentType,
    keywords
  });
}

// Chat function for conversational AI
export async function chatWithAI(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  model: string = 'gemini-1.5-flash'
): Promise<AIResponse> {
  // Build conversation context
  let fullPrompt = '';
  
  if (conversationHistory.length > 0) {
    fullPrompt = 'Previous conversation:\n';
    conversationHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    fullPrompt += '\n';
  }
  
  fullPrompt += `User: ${message}\n\nAssistant:`;

  return generateContent(fullPrompt, {
    model,
    tone: 'conversational',
    length: 'medium',
    style: 'chat'
  });
}

// Get available models
export function getAvailableModels() {
  return Object.keys(GEMINI_MODELS);
}

// Check if AI is available
export function isAIAvailable(): boolean {
  return !!genAI && !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}

// Demo mode responses for testing
const DEMO_RESPONSES = {
  research: `# Research Report: AI Technology Developments

## Executive Summary
Recent developments in artificial intelligence have shown remarkable progress across multiple domains, including natural language processing, computer vision, and autonomous systems.

## Key Findings

### Natural Language Processing
- **Large Language Models**: Models like GPT-4 and Gemini have achieved unprecedented capabilities
- **Multimodal AI**: Integration of text, image, and audio processing
- **Real-time Translation**: Near-human quality translation across languages

### Computer Vision
- **Object Recognition**: AI systems now demonstrate superhuman performance
- **Medical Imaging**: Improved accuracy in disease detection
- **Autonomous Vehicles**: Advanced perception and decision-making capabilities

### Current Trends
1. **Edge AI**: Deployment of AI models on devices with limited resources
2. **AI Ethics**: Growing focus on responsible AI development
3. **Quantum AI**: Early research into quantum computing applications

## Future Outlook
The AI landscape continues to evolve rapidly, with new breakthroughs expected in:
- **Artificial General Intelligence (AGI)**
- **Neuromorphic Computing**
- **AI-Human Collaboration**

> **Note**: This is a demo response. Set up your Gemini API key for real AI responses.`,

  content: `# Professional Content: AI in Modern Business

Artificial Intelligence has become a cornerstone of modern business operations, transforming how organizations approach decision-making, customer service, and operational efficiency.

## The AI Revolution in Business

Companies across industries are leveraging AI to gain competitive advantages through:

### Automated Decision Making
AI algorithms process vast amounts of data to make informed business decisions, reducing human bias and improving accuracy.

### Enhanced Customer Experience
- **Chatbots**: 24/7 customer support
- **Recommendation Systems**: Personalized product suggestions
- **Voice Assistants**: Natural language interactions

### Operational Efficiency
Process automation reduces costs and improves productivity across all business functions.

## Implementation Strategies

Successful AI implementation requires:

1. **Clear Objectives**: Define specific business goals and success metrics
2. **Data Quality**: Ensure high-quality, relevant data for training AI models
3. **Change Management**: Prepare teams for AI-driven workflow changes
4. **Ethical Considerations**: Address privacy, bias, and transparency concerns

## Measuring Success

| Metric | Description | Target |
|--------|-------------|--------|
| Cost Reduction | Operational efficiency gains | 20-30% |
| Customer Satisfaction | Improved service quality | 15-25% |
| Revenue Growth | New AI-driven revenue streams | 10-20% |
| Employee Productivity | Time saved through automation | 30-40% |

> **Note**: This is a demo response. Set up your Gemini API key for real AI responses.`,

  chat: `Hello! I'm here to help you with any questions or tasks you might have. I can assist with research, content creation, analysis, explanations, and general conversation.

## What I Can Help With

### Research & Analysis
- **Market Research**: Industry trends and competitive analysis
- **Data Analysis**: Statistical insights and pattern recognition
- **Academic Research**: Literature reviews and methodology guidance

### Content Creation
- **Blog Posts**: Engaging, SEO-optimized content
- **Technical Documentation**: Clear, comprehensive guides
- **Marketing Copy**: Persuasive, audience-targeted messaging

### Problem Solving
- **Technical Issues**: Programming and system troubleshooting
- **Business Strategy**: Planning and decision-making support
- **Creative Solutions**: Innovative approaches to challenges

Since you're currently in **demo mode**, I'm providing sample responses. To get real AI-powered responses, please:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your environment variables as \`NEXT_PUBLIC_GEMINI_API_KEY\`
3. Restart your application

I'm designed to be helpful, informative, and engaging. Feel free to ask me anything!`,

  analysis: `# Analysis: Current Market Trends

## Market Overview
The current market landscape shows significant shifts driven by technological innovation, changing consumer preferences, and global economic factors.

## Key Insights

### Technology Sector
- **AI/ML Adoption**: Rapid integration across industries
- **Cloud Computing**: Continued growth in hybrid and multi-cloud solutions
- **Cybersecurity**: Increasing investment due to rising threats

### Consumer Behavior
- **Digital Transformation**: Accelerated shift to online platforms
- **Sustainability**: Growing demand for eco-friendly products and services
- **Personalization**: Expectation for tailored experiences

## Competitive Analysis

Leading companies are focusing on:

| Strategy | Description | Impact |
|----------|-------------|--------|
| Innovation | R&D investment in emerging technologies | High |
| Customer Experience | Optimization of user journeys | Medium |
| Sustainability | Eco-friendly practices and products | Medium |
| Digital Transformation | Technology adoption and integration | High |

## Recommendations

1. **Invest in Emerging Technologies**
   - AI and machine learning capabilities
   - Blockchain and Web3 solutions
   - IoT and edge computing

2. **Prioritize Customer Experience**
   - Personalization and customization
   - Omnichannel engagement
   - Real-time support systems

3. **Embrace Sustainable Practices**
   - Green technology adoption
   - Carbon footprint reduction
   - Social responsibility initiatives

> **Note**: This is a demo response. Set up your Gemini API key for real AI responses.`,

  explanation: `# Understanding Complex Topics

Let me break this down in simple terms:

## What is this?
This is a complex topic that can be understood by breaking it into smaller, manageable pieces.

## How does it work?
Think of it like building with blocks:

\`\`\`javascript
// Example: Building a foundation
function buildFoundation() {
  const blocks = ['basic', 'intermediate', 'advanced'];
  return blocks.map(block => 'Layer: ' + block);
}
\`\`\`

1. **Foundation**: Start with the basics
2. **Building**: Add layers of complexity
3. **Integration**: Connect different parts
4. **Optimization**: Refine and improve

## Why is it important?
Understanding this topic helps you:
- Make better decisions
- Solve problems more effectively
- Communicate ideas clearly
- Stay competitive in your field

## Practical Applications
You can apply this knowledge to:
- **Daily decision-making**: Informed choices based on understanding
- **Problem-solving at work**: Systematic approach to challenges
- **Personal development**: Continuous learning and growth
- **Strategic planning**: Long-term vision and execution

## Key Takeaways
- Start simple and build complexity gradually
- Focus on practical applications
- Practice regularly to improve understanding
- Share knowledge with others

> **Note**: This is a demo response. Set up your Gemini API key for real AI responses.`
};

// Demo mode function
export async function generateDemoResponse(query: string): Promise<AIResponse> {
  const queryLower = query.toLowerCase();
  
  let responseType = 'chat';
  if (queryLower.includes('research') || queryLower.includes('study') || queryLower.includes('analysis')) {
    responseType = 'research';
  } else if (queryLower.includes('write') || queryLower.includes('create') || queryLower.includes('generate')) {
    responseType = 'content';
  } else if (queryLower.includes('analyze') || queryLower.includes('compare') || queryLower.includes('evaluate')) {
    responseType = 'analysis';
  } else if (queryLower.includes('explain') || queryLower.includes('describe') || queryLower.includes('define')) {
    responseType = 'explanation';
  }
  
  const content = DEMO_RESPONSES[responseType as keyof typeof DEMO_RESPONSES] || DEMO_RESPONSES.chat;
  const wordCount = content.split(/\s+/).length;
  
  return {
    content,
    metadata: {
      wordCount,
      readingTime: Math.ceil(wordCount / 200),
      language: 'en',
      confidence: 0.9,
      model: 'demo-mode',
      timestamp: new Date().toISOString(),
      tokensUsed: wordCount * 1.3, // Rough estimate
      promptTokens: query.split(/\s+/).length * 1.3,
      responseTokens: wordCount * 1.3
    },
    suggestions: {
      title: query.length > 50 ? query.substring(0, 50) + '...' : query,
      keywords: extractKeywords(content),
      tags: extractTags(content),
      summary: content.split('\n').slice(0, 3).join('\n')
    }
  };
}

// Get rate limit status
export function getRateLimitStatus(): {
  requestsThisMinute: number;
  requestsThisHour: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  timeUntilMinuteReset: number;
  timeUntilHourReset: number;
} {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const timeSinceHourReset = now - lastHourReset;
  
  return {
    requestsThisMinute: timeSinceLastRequest < 60000 ? requestCount : 0,
    requestsThisHour: timeSinceHourReset < 60 * 60 * 1000 ? hourlyRequestCount : 0,
    maxRequestsPerMinute: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
    maxRequestsPerHour: RATE_LIMIT_CONFIG.maxRequestsPerHour,
    timeUntilMinuteReset: Math.max(0, 60000 - timeSinceLastRequest),
    timeUntilHourReset: Math.max(0, 60 * 60 * 1000 - timeSinceHourReset)
  };
}

// Test API connectivity
export async function testAPIConnectivity(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    if (!genAI) {
      return {
        success: false,
        message: 'Gemini AI not initialized. Please check your API key configuration.',
        details: { hasApiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY }
      };
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return {
        success: false,
        message: 'No API key found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.',
        details: { hasApiKey: false }
      };
    }

    // Test with a simple prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: 'API connection successful!',
      details: { 
        response: text,
        model: 'gemini-1.5-flash',
        hasApiKey: true
      }
    };
  } catch (error: any) {
    console.error('API connectivity test failed:', error);
    
    return {
      success: false,
      message: `API test failed: ${error.message}`,
      details: {
        error: error.message,
        errorType: error.constructor.name,
        hasApiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        genAIInitialized: !!genAI
      }
    };
  }
}
