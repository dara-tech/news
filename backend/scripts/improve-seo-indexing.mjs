#!/usr/bin/env node

/**
 * SEO Indexing Improvement Script
 * 
 * This script helps improve Google Search Console indexing by:
 * 1. Validating URLs in sitemap
 * 2. Checking for 404 errors
 * 3. Ensuring proper canonical URLs
 * 4. Generating SEO reports
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = process.env.FRONTEND_URL || 'https://www.razewire.online';
const API_BASE_URL = process.env.API_URL || 'http://localhost:5001';

class SEOImprovementService {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  async validateSitemap() {
    try {
      const response = await axios.get(`${BASE_URL}/sitemap.xml`);
      const sitemapContent = response.data;
      
      // Extract URLs from sitemap
      const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      const urls = urlMatches ? urlMatches.map(match => match.replace(/<\/?loc>/g, '')) : [];
      
      // Check each URL
      const validationResults = [];
      for (const url of urls.slice(0, 20)) { // Check first 20 URLs to avoid rate limiting
        try {
          const urlResponse = await axios.head(url, { timeout: 10000 });
          validationResults.push({
            url,
            status: urlResponse.status,
            valid: urlResponse.status === 200
          });
        } catch (error) {
          validationResults.push({
            url,
            status: error.response?.status || 'ERROR',
            valid: false,
            error: error.message
          });
        }
      }
      
      const invalidUrls = validationResults.filter(result => !result.valid);
      if (invalidUrls.length > 0) {
        this.issues.push({
          type: '404_ERRORS',
          count: invalidUrls.length,
          urls: invalidUrls
        });
      }
      
      return validationResults;
    } catch (error) {
      console.error('❌ Error validating sitemap:', error.message);
      return [];
    }
  }

  async checkCanonicalUrls() {
    try {
      // Check main pages for canonical URLs
      const pagesToCheck = [
        '/',
        '/news',
        '/categories',
        '/archive',
        '/search'
      ];
      
      const canonicalResults = [];
      for (const page of pagesToCheck) {
        try {
          const response = await axios.get(`${BASE_URL}${page}`);
          const html = response.data;
          
          // Check for canonical link
          const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
          const hasCanonical = !!canonicalMatch;
          
          canonicalResults.push({
            page,
            hasCanonical,
            canonicalUrl: canonicalMatch ? canonicalMatch[1] : null
          });
        } catch (error) {
          canonicalResults.push({
            page,
            hasCanonical: false,
            error: error.message
          });
        }
      }
      
      const missingCanonical = canonicalResults.filter(result => !result.hasCanonical);
      if (missingCanonical.length > 0) {
        this.issues.push({
          type: 'MISSING_CANONICAL',
          count: missingCanonical.length,
          pages: missingCanonical
        });
      }
      
      return canonicalResults;
    } catch (error) {
      console.error('❌ Error checking canonical URLs:', error.message);
      return [];
    }
  }

  async generateSEOReport() {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      issues: this.issues,
      fixes: this.fixes,
      recommendations: []
    };
    
    // Add recommendations based on issues found
    if (this.issues.some(issue => issue.type === '404_ERRORS')) {
      report.recommendations.push({
        priority: 'HIGH',
        issue: '404 Errors',
        solution: 'Remove invalid URLs from sitemap or fix the underlying pages',
        action: 'Update sitemap.ts to exclude problematic URLs'
      });
    }
    
    if (this.issues.some(issue => issue.type === 'MISSING_CANONICAL')) {
      report.recommendations.push({
        priority: 'MEDIUM',
        issue: 'Missing Canonical URLs',
        solution: 'Add canonical URLs to all pages to prevent duplicate content issues',
        action: 'Ensure all page components include canonical metadata'
      });
    }
    
    // General recommendations
    report.recommendations.push({
      priority: 'HIGH',
      issue: 'Google Search Console Issues',
      solution: 'Submit updated sitemap to Google Search Console',
      action: 'Go to Google Search Console > Sitemaps > Add new sitemap URL'
    });
    
    report.recommendations.push({
      priority: 'MEDIUM',
      issue: 'Improve Page Speed',
      solution: 'Optimize images and reduce JavaScript bundle size',
      action: 'Use Next.js Image component and enable compression'
    });
    
    report.recommendations.push({
      priority: 'LOW',
      issue: 'Add Structured Data',
      solution: 'Implement JSON-LD structured data for better search results',
      action: 'Add structured data to article and category pages'
    });
    
    // Save report
    const reportPath = path.join(process.cwd(), 'seo-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  async run() {
    // Run all checks
    await this.validateSitemap();
    await this.checkCanonicalUrls();
    
    // Generate report
    const report = await this.generateSEOReport();
    
    return report;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const seoService = new SEOImprovementService();
  seoService.run().catch(console.error);
}

export default SEOImprovementService;
