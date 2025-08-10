// Load environment variables FIRST
require('dotenv').config();

// Now import your agent
const { default: summarizationAgent } = require('./src/utils/summarizationAgent.js');

// Test function
async function testSummarizationAgent() {
  console.log('🚀 Testing Summarization Agent...');
  console.log('='.repeat(50));
  
  // Debug: Check if env variable is loaded
  console.log('🔑 API Key available:', !!process.env.REACT_APP_GEMINI_API_KEY);
  
  try {
    if (!summarizationAgent.isApiKeyAvailable()) {
      console.error('❌ Gemini API key not found!');
      console.log('Please add REACT_APP_GEMINI_API_KEY to your .env file');
      return;
    }
    
    console.log('✅ API key found');
    console.log('📡 Making request to Gemini...');
    
    const output = await summarizationAgent.getOutput();
    
    console.log('\n🤖 Gemini Response:');
    console.log('='.repeat(50));
    console.log(output);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSummarizationAgent();