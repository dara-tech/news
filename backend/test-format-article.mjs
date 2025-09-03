import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';

async function testFormatArticle() {
  const testContent = `<h2>Background</h2><p>25% decrease in the number of crime victims during the final year of the previous Labor government's term</p>`;
  const cleaned = cleanContent(testContent);
  
  console.log('Testing formatArticleContent (preserveOriginalStructure: false):');
  console.log('');
  
  const options = {
    preserveOriginalStructure: false, // This will call formatArticleContent
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
  console.log('Result:');
  console.log(result.content);
  console.log(`Has Background: ${result.content.includes('Background')}`);
  console.log('');
  
  console.log('Testing with preserveOriginalStructure: true:');
  const options2 = {
    preserveOriginalStructure: true, // This will NOT call formatArticleContent
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
  
  const result2 = await formatContentAdvanced(cleaned, options2);
  console.log('Result:');
  console.log(result2.content);
  console.log(`Has Background: ${result2.content.includes('Background')}`);
}

testFormatArticle().catch(console.error);
