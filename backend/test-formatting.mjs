import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';

async function testFormatting() {
  const testContent = `<h2>Background</h2><p>This is test content with Background text.</p>`;
  
  console.log('Original content:');
  console.log(testContent);
  console.log('');
  
  console.log('After cleanContent:');
  const cleaned = cleanContent(testContent);
  console.log(cleaned);
  console.log(`Has Background: ${cleaned.includes('Background')}`);
  console.log('');
  
  console.log('After formatContentAdvanced with AI disabled:');
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
  
  const formatted = await formatContentAdvanced(cleaned, options);
  console.log(formatted);
  console.log(`Has Background: ${formatted.content.includes('Background')}`);
}

testFormatting().catch(console.error);
