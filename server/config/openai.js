import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables
dotenv.config();

// Ensure OpenAI API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OpenAI API Key. Please set OPENAI_API_KEY in .env");
  process.exit(1);
}

// Create and export OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

export const generateExplanation = async ({ question, userAnswer, materials, correctAnswer, isCorrect }) => {
  try {
    const systemPrompt = isCorrect 
      ? `You are an AI tutor. Provide a concise explanation for why the selected answer is correct based on the learning materials. Keep your response brief and focused on reinforcing the correct understanding.`
      : `You are an AI tutor. Provide a concise explanation for why the selected answer is incorrect and explain the correct answer based on the learning materials. Keep your response brief and focused on clarifying misconceptions.`;
    
    const userPrompt = isCorrect
      ? `Question: ${question}
Selected Answer: ${userAnswer}
Learning Materials: ${materials}
Please explain why this answer is correct in 1-2 sentences.`
      : `Question: ${question}
Selected Answer: ${userAnswer}
Correct Answer: ${correctAnswer}
Learning Materials: ${materials}
Please explain why the selected answer is incorrect and why the correct answer is right in 2-3 sentences.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: systemPrompt
      }, {
        role: "user",
        content: userPrompt
      }],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};