
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { SignStep, SignOfTheDay } from "../types";

// The API key is handled automatically by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Translates a camera frame showing ISL to English and Hindi text.
 */
export async function translateISLToEnglish(imageB64: string, targetLang: 'English' | 'Hindi' = 'English'): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageB64, mimeType: 'image/jpeg' } },
        { text: `Analyze this image of Indian Sign Language (ISL). Translate the sign shown into clear, natural ${targetLang}. Return ONLY the translated text without any preamble or quotes.` }
      ]
    }
  });
  return response.text || "Sign not recognized.";
}

/**
 * Generates a random 'Sign of the Day' for educational engagement.
 */
export async function getSignOfTheDay(): Promise<SignOfTheDay> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Suggest a common and useful Indian Sign Language (ISL) sign. Provide the gloss (the word in caps) and its meaning/usage description.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gloss: { type: Type.STRING },
          meaning: { type: Type.STRING }
        },
        required: ["gloss", "meaning"]
      }
    }
  });
  return JSON.parse(response.text);
}

/**
 * Generates English speech from text using Gemini TTS.
 */
export async function generateSpeech(text: string): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say this clearly and naturally: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

/**
 * Translates English text into a sequence of ISL Glosses.
 */
export async function translateEnglishToISLGloss(text: string): Promise<SignStep[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following English text into a sequence of Indian Sign Language (ISL) glosses. 
    ISL often follows a Subject-Object-Verb (SOV) order. 
    Provide a list of sign glosses with specific visual descriptions for how the sign is performed.
    
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            gloss: { type: Type.STRING, description: "The sign name in all caps" },
            description: { type: Type.STRING, description: "Visual description of the hand gesture and movement" }
          },
          required: ["gloss", "description"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse glosses", e);
    return [];
  }
}

/**
 * Generates an image representing a specific ISL sign for the avatar.
 */
export async function generateSignImage(gloss: string, description: string): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A high-quality 3D digital human avatar performing the Indian Sign Language (ISL) sign for '${gloss}'. 
        Action: ${description}. 
        Style: Clean, professional, instructional, white background, chest-up view, clear hand positioning, soft studio lighting.` }
      ]
    },
    config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
}
