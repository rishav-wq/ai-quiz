// check-key.js - Quick API key validator
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('\n🔍 Checking API Key...\n');

// Check if key exists
if (!API_KEY) {
  console.log('❌ ERROR: GEMINI_API_KEY not found in .env file\n');
  console.log('Create a .env file in your server folder with:');
  console.log('GEMINI_API_KEY=your_api_key_here\n');
  process.exit(1);
}

// Check key format
console.log(`Key length: ${API_KEY.length} characters`);
console.log(`First 10 chars: ${API_KEY.substring(0, 10)}`);
console.log(`Last 4 chars: ...${API_KEY.substring(API_KEY.length - 4)}`);

if (!API_KEY.startsWith('AIza')) {
  console.log('\n❌ ERROR: Invalid API key format');
  console.log('Google AI API keys start with "AIza"');
  console.log('Your key starts with:', API_KEY.substring(0, 6));
  console.log('\n✅ Get a valid key from: https://aistudio.google.com/app/apikey\n');
  process.exit(1);
}

// Check for common issues
if (API_KEY.includes(' ')) {
  console.log('\n⚠️  WARNING: API key contains spaces - this will cause errors');
}

if (API_KEY.includes('"') || API_KEY.includes("'")) {
  console.log('\n⚠️  WARNING: API key contains quotes - remove them from .env');
}

if (API_KEY.length < 30 || API_KEY.length > 50) {
  console.log('\n⚠️  WARNING: API key length seems unusual');
  console.log('Expected length: 39 characters');
  console.log('Your key length:', API_KEY.length);
}

console.log('\n✅ API key format looks correct');
console.log('\nNow testing with Google AI API...\n');

// Test the actual API
const https = require('https');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
  let data = '';
  
  res.on('data', chunk => data += chunk);
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      console.log('✅ API KEY IS VALID!\n');
      console.log(`Found ${response.models?.length || 0} models:\n`);
      
      if (response.models) {
        response.models.forEach(model => {
          const name = model.name.replace('models/', '');
          console.log(`  - ${name}`);
        });
        
        console.log('\n🎯 Use one of these model names in your aiService.js');
      }
    } else if (res.statusCode === 400) {
      console.log('❌ API KEY IS INVALID\n');
      console.log('Error:', JSON.parse(data).error.message);
      console.log('\n✅ Solution:');
      console.log('1. Go to https://aistudio.google.com/app/apikey');
      console.log('2. Create a NEW API key');
      console.log('3. Update your .env file');
    } else if (res.statusCode === 403) {
      console.log('❌ API ACCESS DENIED\n');
      console.log('Your API key exists but lacks permissions\n');
      console.log('✅ Solution:');
      console.log('1. Go to https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      console.log('2. Enable "Generative Language API"');
    } else {
      console.log(`❌ Error: HTTP ${res.statusCode}\n`);
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Network Error:', err.message);
});