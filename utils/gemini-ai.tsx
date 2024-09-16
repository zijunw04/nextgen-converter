// utils/gemini-ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const GeminiAI = {
  async convertCode(code: string, fromLang: string, toLang: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Convert the following ${fromLang} code to ${toLang}:\n\n${code}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  },
};
