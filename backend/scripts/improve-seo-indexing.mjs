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
    console.log('🔍 Validating sitemap URLs...');
    
    try {
      const response = await axios.get(`${BASE_URL}/sitemap.xml`);
      const sitemapContent = response.data;
      
      // Extract URLs from sitemap
      const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      const urls = urlMatches ? urlMatches.map(match => match.replace(/<\/?loc>/g, '')) : [];
      
      console.log(`📊 Found ${urls.length} URLs in sitemap`);
      
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
        console.log(`❌ Found ${invalidUrls.length} invalid URLs`);
      } else {
        console.log('✅ All checked URLs are valid');
      }
      
      return validationResults;
    } catch (error) {
      console.error('❌ Error validating sitemap:', error.message);
      return [];
    }
  }

  async checkCanonicalUrls() {
    console.log('🔗 Checking canonical URL implementation...');
    
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
        console.log(`❌ Found ${missingCanonical.length} pages without canonical URLs`);
      } else {
        console.log('✅ All checked pages have canonical URLs');
      }
      
      return canonicalResults;
    } catch (error) {
      console.error('❌ Error checking canonical URLs:', error.message);
      return [];
    }
  }

  async generateSEOReport() {
    console.log('📊 Generating SEO report...');
    
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
    
    console.log(`📄 SEO report saved to: ${reportPath}`);
    return report;
  }

  async run() {
    console.log('🚀 Starting SEO improvement analysis...\n');
    
    // Run all checks
    await this.validateSitemap();
    await this.checkCanonicalUrls();
    
    // Generate report
    const report = await this.generateSEOReport();
    
    console.log('\n📋 Summary:');
    console.log(`- Issues found: ${this.issues.length}`);
    console.log(`- Recommendations: ${report.recommendations.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n❌ Issues to fix:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.count} items`);
      });
    }
    
    console.log('\n✅ SEO improvement analysis complete!');
    return report;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const seoService = new SEOImprovementService();
  seoService.run().catch(console.error);
}

export default SEOImprovementService;
