// src/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the model with a working model name
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-2.0-flash - fast and efficient
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
});

const generateQuestions = async (text, questionCount) => {
  try {
    const prompt = `Generate ${questionCount} multiple-choice quiz questions based on this topic: "${text}".
        
Requirements:
- Each question should be challenging but clear
- Provide 4 options for each question
- One option must be the correct answer
- Include a brief explanation for the correct answer

Return the response in this exact JSON format:
[
  {
    "question": "The question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "The correct option (must match exactly)",
    "explanation": "Brief explanation why this is correct"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    // Clean up the response to ensure it's valid JSON
    responseText = responseText.trim();
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON array bounds
    if (!responseText.startsWith('[')) {
      const startIndex = responseText.indexOf('[');
      if (startIndex !== -1) {
        responseText = responseText.substring(startIndex);
      }
    }
    if (!responseText.endsWith(']')) {
      const endIndex = responseText.lastIndexOf(']');
      if (endIndex !== -1) {
        responseText = responseText.substring(0, endIndex + 1);
      }
    }

    try {
      const questions = JSON.parse(responseText);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each question has required fields
      questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
      });
      
      return questions;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse the AI response into valid JSON format');
    }

  } catch (error) {
    console.error("Error generating questions from AI:", error);
    throw new Error("Failed to generate questions from the AI service.");
  }
};

module.exports = { generateQuestions };