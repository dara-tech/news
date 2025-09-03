import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';

async function testOptions() {
  const testContent = `<h2>Background</h2><p>25% decrease in the number of crime victims during the final year of the previous Labor government's term</p>`;
  const cleaned = cleanContent(testContent);
  
  console.log('Testing each option individually...');
  console.log('');
  
  const options = [
    { name: 'enableReadabilityOptimization', option: { enableReadabilityOptimization: true } },
    { name: 'enableSEOOptimization', option: { enableSEOOptimization: true } },
    { name: 'enableVisualEnhancement', option: { enableVisualEnhancement: true } },
    { name: 'addSectionHeadings', option: { addSectionHeadings: true } },
    { name: 'enhanceQuotes', option: { enhanceQuotes: true } },
    { name: 'optimizeLists', option: { optimizeLists: true } },
    { name: 'enhanceStructure', option: { enhanceStructure: true } }
  ];
  
  for (const { name, option } of options) {
    console.log(`Testing ${name}:`);
    const result = await formatContentAdvanced(cleaned, option);
    console.log(`  Has Background: ${result.content.includes('Background')}`);
    if (result.content.includes('Background')) {
      console.log(`  Content: ${result.content.substring(0, 100)}...`);
    }
    console.log('');
  }
}

testOptions().catch(console.error);
