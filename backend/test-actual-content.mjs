import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';

async function testActualContent() {
  // Use the actual content from the Sentinel article
  const testContent = `<blockquote class="enhanced-quote">
  <h2>Queensland Crime Statistics Show Decrease, Challenging LNP's "Youth Crime Crisis" Narrative</h2>

<hr class="section-break" />
<p>Recent crime statistics from Queensland reveal a <span class="highlight-number">2</span>.</p>

<h2>Background</h2>
<p><span class="highlight-number">25%</span> decrease in the number of crime victims during the final year of the previous Labor government's term</p>

<p>This data presents a significant challenge to the Liberal National Party's (LNP) repeated claims of a "youth crime crisis," a central theme of their successful campaign leading up to the October 2024 election</p>
</blockquote>`;
  
  console.log('Testing with actual Sentinel content:');
  console.log('');
  
  console.log('After cleanContent:');
  const cleaned = cleanContent(testContent);
  console.log(`Has Background: ${cleaned.includes('Background')}`);
  console.log('');
  
  console.log('After formatContentAdvanced with all options enabled:');
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
  console.log(`Has Background: ${result.content.includes('Background')}`);
  if (result.content.includes('Background')) {
    console.log('Content preview:');
    console.log(result.content.substring(0, 500));
  }
}

testActualContent().catch(console.error);
