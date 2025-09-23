/**
 * Content management system for publishing and managing articles
 */

interface Article {
  id: string;
  title: string | { [key: string]: string };
  description: string | { [key: string]: string };
  content: string | { [key: string]: string };
  thumbnail?: string;
  author: {
    id: string;
    name: string;
    username: string;
  };
  category: {
    id: string;
    name: string | { [key: string]: string };
    slug: string;
  };
  tags: string[];
  slug: string | { [key: string]: string };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string | { [key: string]: string };
  seoDescription?: string | { [key: string]: string };
  featuredImage?: string;
  readingTime?: number;
  wordCount?: number;
}

interface ContentPlan {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  keywords: string[];
  estimatedReadingTime: number;
  assignedTo?: string;
  createdAt: string;
}

interface ContentMetrics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  archivedArticles: number;
  averageReadingTime: number;
  totalWordCount: number;
  articlesThisWeek: number;
  articlesThisMonth: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

class ContentManager {
  private static instance: ContentManager;
  private contentPlan: ContentPlan[] = [];
  private targetArticlesPerDay = 3;
  private targetArticlesPerWeek = 20;

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  /**
   * Generate content ideas based on trending topics
   */
  async generateContentIdeas(topic: string, count: number = 10): Promise<ContentPlan[]> {
    const ideas: ContentPlan[] = [];
    const baseKeywords = this.extractKeywords(topic);
    
    for (let i = 0; i < count; i++) {
      const idea: ContentPlan = {
        id: `idea_${Date.now()}_${i}`,
        title: `${topic} - ${this.generateTitleVariation(i)}`,
        description: `Comprehensive article about ${topic} covering key aspects and latest developments`,
        targetDate: this.getNextPublishDate(i),
        priority: this.getPriority(i),
        status: 'planned',
        category: this.getCategoryForTopic(topic),
        keywords: this.generateKeywords(baseKeywords, i),
        estimatedReadingTime: this.estimateReadingTime(),
        createdAt: new Date().toISOString()
      };
      ideas.push(idea);
    }

    return ideas;
  }

  /**
   * Create content plan for the next 30 days
   */
  createContentPlan(): ContentPlan[] {
    const plan: ContentPlan[] = [];
    const categories = ['Technology', 'Business', 'Sports', 'Politics', 'Entertainment', 'Health'];
    const topics = [
      'AI and Machine Learning',
      'Cryptocurrency',
      'Climate Change',
      'Digital Transformation',
      'Remote Work',
      'E-commerce',
      'Cybersecurity',
      'Mobile Technology',
      'Social Media',
      'Gaming'
    ];

    for (let i = 0; i < 30; i++) {
      const category = categories[i % categories.length];
      const topic = topics[i % topics.length];
      
      const contentItem: ContentPlan = {
        id: `plan_${Date.now()}_${i}`,
        title: `${topic} in ${category}: Latest Updates`,
        description: `Daily update on ${topic} developments in the ${category} sector`,
        targetDate: this.getNextPublishDate(i),
        priority: this.getPriority(i),
        status: 'planned',
        category,
        keywords: this.generateKeywords([topic, category], i),
        estimatedReadingTime: this.estimateReadingTime(),
        createdAt: new Date().toISOString()
      };
      
      plan.push(contentItem);
    }

    this.contentPlan = plan;
    return plan;
  }

  /**
   * Get content metrics
   */
  async getContentMetrics(): Promise<ContentMetrics> {
    try {
      // This would typically fetch from your API
      const response = await fetch('/api/content/metrics');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch content metrics:', error);
    }

    // Fallback metrics
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      archivedArticles: 0,
      averageReadingTime: 0,
      totalWordCount: 0,
      articlesThisWeek: 0,
      articlesThisMonth: 0,
      topCategories: [],
      topTags: []
    };
  }

  /**
   * Publish article with SEO optimization
   */
  async publishArticle(article: Partial<Article>): Promise<Article> {
    const optimizedArticle = this.optimizeForSEO(article);
    
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optimizedArticle)
      });

      if (!response.ok) {
        throw new Error('Failed to publish article');
      }

      return await response.json();
    } catch (error) {
      console.error('Error publishing article:', error);
      throw error;
    }
  }

  /**
   * Optimize article for SEO
   */
  private optimizeForSEO(article: Partial<Article>): Partial<Article> {
    const optimized = { ...article };

    // Ensure title is optimized
    if (optimized.title) {
      const title = typeof optimized.title === 'string' 
        ? optimized.title 
        : optimized.title.en || Object.values(optimized.title)[0];
      
      if (title.length > 60) {
        console.warn('Title is too long for SEO:', title.length);
      }
    }

    // Ensure description is optimized
    if (optimized.description) {
      const description = typeof optimized.description === 'string' 
        ? optimized.description 
        : optimized.description.en || Object.values(optimized.description)[0];
      
      if (description.length > 160) {
        console.warn('Description is too long for SEO:', description.length);
      }
    }

    // Add reading time
    if (optimized.content) {
      const content = typeof optimized.content === 'string' 
        ? optimized.content 
        : optimized.content.en || Object.values(optimized.content)[0];
      
      optimized.readingTime = this.calculateReadingTime(content);
      optimized.wordCount = this.countWords(content);
    }

    // Ensure slug is SEO-friendly
    if (optimized.slug) {
      const slug = typeof optimized.slug === 'string' 
        ? optimized.slug 
        : optimized.slug.en || Object.values(optimized.slug)[0];
      
      optimized.slug = this.slugify(slug);
    }

    return optimized;
  }

  /**
   * Generate SEO-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Calculate reading time
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.countWords(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Count words in content
   */
  private countWords(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  /**
   * Generate title variations
   */
  private generateTitleVariation(index: number): string {
    const variations = [
      'Complete Guide',
      'Latest Trends',
      'Expert Analysis',
      'Breaking News',
      'In-Depth Review',
      'Future Outlook',
      'Best Practices',
      'Industry Insights',
      'Market Update',
      'Technology Review'
    ];
    return variations[index % variations.length];
  }

  /**
   * Get next publish date
   */
  private getNextPublishDate(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString();
  }

  /**
   * Get priority based on index
   */
  private getPriority(index: number): 'low' | 'medium' | 'high' {
    if (index < 5) return 'high';
    if (index < 15) return 'medium';
    return 'low';
  }

  /**
   * Get category for topic
   */
  private getCategoryForTopic(topic: string): string {
    const categoryMap: { [key: string]: string } = {
      'ai': 'Technology',
      'crypto': 'Business',
      'climate': 'Environment',
      'digital': 'Technology',
      'remote': 'Business',
      'ecommerce': 'Business',
      'cyber': 'Technology',
      'mobile': 'Technology',
      'social': 'Technology',
      'gaming': 'Entertainment'
    };

    const lowerTopic = topic.toLowerCase();
    for (const [key, category] of Object.entries(categoryMap)) {
      if (lowerTopic.includes(key)) {
        return category;
      }
    }
    return 'General';
  }

  /**
   * Generate keywords
   */
  private generateKeywords(baseKeywords: string[], index: number): string[] {
    const additionalKeywords = [
      'news', 'update', 'latest', 'trending', 'analysis',
      'guide', 'tips', 'review', 'insights', 'report'
    ];
    
    return [
      ...baseKeywords,
      ...additionalKeywords.slice(0, 3),
      `keyword${index + 1}`
    ];
  }

  /**
   * Estimate reading time
   */
  private estimateReadingTime(): number {
    return Math.floor(Math.random() * 10) + 3; // 3-12 minutes
  }

  /**
   * Get content plan
   */
  getContentPlan(): ContentPlan[] {
    return [...this.contentPlan];
  }

  /**
   * Update content plan item
   */
  updateContentPlan(id: string, updates: Partial<ContentPlan>): void {
    const index = this.contentPlan.findIndex(item => item.id === id);
    if (index !== -1) {
      this.contentPlan[index] = { ...this.contentPlan[index], ...updates };
    }
  }

  /**
   * Get content plan for today
   */
  getTodaysContent(): ContentPlan[] {
    const today = new Date().toISOString().split('T')[0];
    return this.contentPlan.filter(item => 
      item.targetDate.startsWith(today) && item.status === 'planned'
    );
  }

  /**
   * Get content plan for this week
   */
  getThisWeeksContent(): ContentPlan[] {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return this.contentPlan.filter(item => {
      const itemDate = new Date(item.targetDate);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
  }

  /**
   * Generate content calendar
   */
  generateContentCalendar(): { [date: string]: ContentPlan[] } {
    const calendar: { [date: string]: ContentPlan[] } = {};
    
    this.contentPlan.forEach(item => {
      const date = item.targetDate.split('T')[0];
      if (!calendar[date]) {
        calendar[date] = [];
      }
      calendar[date].push(item);
    });
    
    return calendar;
  }
}

export default ContentManager;


