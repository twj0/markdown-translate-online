import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are a highly skilled technical translator and Markdown expert. 
Your task is to translate Markdown formatted text from a Source Language to a Target Language.

RULES:
1. STRICTLY PRESERVE all Markdown syntax. Do not change headers (#), list markers (-, *, 1.), code blocks (\`\`\`), inline code (\`), bold (**), italics (*), blockquotes (>), links ([]()), or image syntax (![]()).
2. ONLY translate the human-readable content within the Markdown structure.
3. Do not translate code inside code blocks unless it is a comment.
4. If the input is empty, return empty output.
5. Provide the translation directly without any conversational filler or "Here is the translation" prefixes.
`;

export const streamTranslation = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<AsyncIterable<GenerateContentResponse>> => {
  if (!text.trim()) {
    throw new Error("Input text is empty");
  }

  const prompt = `
Source Language: ${sourceLang}
Target Language: ${targetLang}

Markdown Content to Translate:
${text}
`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more accurate/consistent translation
      },
    });

    return responseStream;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};