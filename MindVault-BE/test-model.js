const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try different model names
  const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      console.log(`✅ ${modelName} works!`);
      break;
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
    }
  }
}

test().catch(console.error);
