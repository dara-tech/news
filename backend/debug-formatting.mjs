import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';

async function debugFormatting() {
  const testContent = `<h2>Background</h2><p>This is test content with Background text.</p>`;
  
  console.log('=== DEBUGGING FORMATTING ===');
  console.log('Original content:');
  console.log(testContent);
  console.log('');
  
  console.log('Step 1: After cleanContent:');
  const cleaned = cleanContent(testContent);
  console.log(cleaned);
  console.log(`Has Background: ${cleaned.includes('Background')}`);
  console.log('');
  
  console.log('Step 2: Testing formatArticleContent directly...');
  // Import the formatArticleContent function directly
  const { formatArticleContent } = await import('./utils/advancedContentFormatter.mjs');
  const formatted = formatArticleContent(cleaned);
  console.log(formatted);
  console.log(`Has Background: ${formatted.includes('Background')}`);
  console.log('');
  
  console.log('Step 3: Testing formatContentAdvanced with AI disabled:');
  const options = {
    enableAIEnhancement: false,
    enableReadabilityOptimization: true,
    enableSEOOptimization: true,
    enableVisualEnhancement: true,
    addSectionHeadings: true,
    enhanceQuotes: true,
    optimizeLists: true,
    enableContentAnalysis: false,
    addKeyPoints: false,
    enhanceStructure: true
  };
  
  const result = await formatContentAdvanced(cleaned, options);
  console.log(result.content);
  console.log(`Has Background: ${result.content.includes('Background')}`);
}

debugFormatting().catch(console.error);
