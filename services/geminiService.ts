
import { GoogleGenAI, Type } from "@google/genai";
import { StoryContent } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private cache: Record<string, any> = {};

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found. Please set VITE_GEMINI_API_KEY or VITE_API_KEY in your .env.local file.');
    }
  }

  // Use responseSchema for consistent word details extraction
  async fetchWordDetails(word: string) {
    if (this.cache[word]) return this.cache[word];

    const prompt = `Provide details for English word "${word}":
    1. Synonyms (2+).
    2. Word roots/affixes.
    3. Multiple Chinese meanings with POS.
    4. Simple English-to-English definition.
    5. Chinese translation of: "${word}" in a context.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              roots: { type: Type.STRING },
              meanings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { pos: { type: Type.STRING }, definition: { type: Type.STRING } }
                }
              },
              englishDefinition: { type: Type.STRING },
              exampleZh: { type: Type.STRING }
            }
          },
        },
      });
      const data = JSON.parse(response.text || "{}");
      this.cache[word] = data;
      return data;
    } catch (e: any) {
      console.error("Failed to fetch word details:", e);
      // 如果是因为 API key 问题，返回 null，否则返回空对象避免崩溃
      if (e?.message?.includes("API key") || e?.message?.includes("apiKey")) {
        console.error("⚠️ API key 未配置或无效，请检查 VITE_GEMINI_API_KEY");
      }
      return null;
    }
  }

  // Refined image generation with correct content format and safety checks
  async generateWordImage(word: string, meaning: string): Promise<string | null> {
    const cacheKey = `img_${word}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const prompt = `A cute, high-quality 3D Pixar-style illustration of a cat or a dog accurately representing the English word "${word}" (meaning: ${meaning}). The scene should be charming, with soft lighting and vibrant colors, clearly showing the concept of the word. Single subject, clean background.`;
    
    try {
      // Passing text prompt directly as a string for nano banana models
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
      });
      
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        // Find the image part as instructed in guidelines
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            this.cache[cacheKey] = base64;
            return base64;
          }
        }
      }
      return null;
    } catch (e: any) {
      console.error("Image generation failed:", e);
      if (e?.message?.includes("API key") || e?.message?.includes("apiKey")) {
        console.error("⚠️ API key 未配置或无效，请检查 VITE_GEMINI_API_KEY");
      }
      return null;
    }
  }

  async quickTranslate(text: string) {
    if (this.cache[`tr_${text}`]) return this.cache[`tr_${text}`];
    const prompt = `Translate to Chinese: "${text}". Only return translation.`;
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const result = response.text?.trim() || "N/A";
      this.cache[`tr_${text}`] = result;
      return result;
    } catch (e: any) {
      console.error("Translation failed:", e);
      if (e?.message?.includes("API key") || e?.message?.includes("apiKey")) {
        console.error("⚠️ API key 未配置或无效，请检查 VITE_GEMINI_API_KEY");
      }
      return "N/A";
    }
  }

  // Use responseSchema for reliable story JSON structure
  async generateStory(words: string[]): Promise<StoryContent> {
    const prompt = `Write a story with pets using ALL words: ${words.join(", ")}. Mark each usage of these words in brackets like [word].`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    zh: { type: Type.STRING }
                  },
                  required: ["en", "zh"]
                }
              },
              fullZh: { type: Type.STRING }
            },
            required: ["sentences", "fullZh"]
          }
        },
      });
      return JSON.parse(response.text || "{}") as StoryContent;
    } catch (error: any) {
      console.error("Story generation failed:", error);
      const errorMsg = error?.message || "Unknown error";
      if (errorMsg.includes("API key") || errorMsg.includes("apiKey")) {
        return { 
          sentences: [{ en: "Please configure VITE_GEMINI_API_KEY in .env.local file.", zh: "请在 .env.local 文件中配置 VITE_GEMINI_API_KEY" }],
          fullZh: "请在 .env.local 文件中配置 VITE_GEMINI_API_KEY"
        };
      }
      return { 
        sentences: [{ en: `Failed to generate story: ${errorMsg}`, zh: `生成失败: ${errorMsg}` }],
        fullZh: `生成失败: ${errorMsg}`
      };
    }
  }

  async speak(text: string) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }
}

export const gemini = new GeminiService();
