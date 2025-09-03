import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';

async function simpleDebug() {
  // Test with the actual content from the Sentinel article
  const testContent = `<h2>Background</h2><p>25% decrease in the number of crime victims during the final year of the previous Labor government's term</p>`;
  
  console.log('=== SIMPLE DEBUG ===');
  console.log('Original content:');
  console.log(testContent);
  console.log('');
  
  console.log('After cleanContent:');
  const cleaned = cleanContent(testContent);
  console.log(cleaned);
  console.log(`Has Background: ${cleaned.includes('Background')}`);
  console.log('');
  
  console.log('After formatContentAdvanced:');
  const options = {
    enableAIEnhancement: false,
    enableReadabilityOptimization: false,
    enableSEOOptimization: false,
    enableVisualEnhancement: false,
    addSectionHeadings: false,
    enhanceQuotes: false,
    optimizeLists: false,
    enableContentAnalysis: false,
    addKeyPoints: false,
    enhanceStructure: false
  };
  
  const result = await formatContentAdvanced(cleaned, options);
  console.log(result.content);
  console.log(`Has Background: ${result.content.includes('Background')}`);
}

simpleDebug().catch(console.error);
