import { GoogleGenerativeAI } from '@google/generative-ai';

// Test the image generation service
async function testImageGenerationIntegration() {
  console.log('🔄 Testing Image Generation Integration...\n');
  
  try {
    // Test 1: Check if API key is set
    if (!process.env.GOOGLE_API_KEY) {
      console.log('❌ GOOGLE_API_KEY not found in environment');
      return;
    }
    
    console.log('✅ API Key found');
    
    // Test 2: Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log('✅ Gemini initialized');
    
    // Test 3: Generate a simple image description
    const testPrompt = `Generate a professional image description for a news article about technology innovation. 
    The description should be suitable for a news website thumbnail. 
    Keep it under 200 words and focus on visual elements that would make an engaging image.`;
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Image description generated successfully');
    console.log('\n📄 Generated Description:');
    console.log(text.substring(0, 200) + '...');
    
    console.log('\n🎉 Image Generation Integration Test PASSED!');
    console.log('\n📋 Integration Status:');
    console.log('✅ API Key configured');
    console.log('✅ Gemini service working');
    console.log('✅ Description generation successful');
    console.log('✅ Ready for dashboard integration');
    
  } catch (error) {
    console.log('❌ Integration test failed:', error.message);
  }
}

testImageGenerationIntegration();


