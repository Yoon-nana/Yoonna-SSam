import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Idiom } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Global Audio Cache and Context
const audioCache: Record<string, AudioBuffer> = {};
let sharedAudioContext: AudioContext | null = null;
let currentPreloadId = 0; // Concurrency control

export const getAudioContext = () => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return sharedAudioContext;
};

/**
 * Generate TTS audio for a given text using Gemini 2.5 Flash TTS
 * Checks cache first.
 */
export const generateTTS = async (text: string): Promise<AudioBuffer> => {
  // 1. Check Cache
  if (audioCache[text]) {
    return audioCache[text];
  }

  const context = getAudioContext();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    
    if (!base64Audio) {
      if (part?.text) {
          throw new Error(`Gemini returned text instead of audio: "${part.text}"`);
      }
      throw new Error("No audio data returned from Gemini");
    }

    // Decode base64
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode raw PCM
    const buffer = await decodeAudioData(bytes, context, 24000, 1);
    
    // Save to Cache
    audioCache[text] = buffer;
    
    return buffer;

  } catch (error: any) {
    console.error("TTS Generation Error:", error);
    
    // Improved Error Detection for 429
    const isRateLimit = 
      error.status === 429 || 
      error.response?.status === 429 || 
      (error.message && (error.message.includes('429') || error.message.includes('quota')));

    if (isRateLimit) {
         throw new Error("Too many requests (429). Please wait a moment.");
    }
    throw error;
  }
};

/**
 * Pre-load audio for a list of idioms sequentially to avoid rate limits.
 * Includes concurrency control to stop previous batches if the user navigates away.
 */
export const preloadIdiomsAudio = async (idioms: Idiom[]) => {
  const preloadId = ++currentPreloadId; // Increment ID for new session
  console.log(`Starting preload session ${preloadId} for ${idioms.length} items`);

  for (const idiom of idioms) {
    // 1. Concurrency Check: If a new session started, abort this one
    if (preloadId !== currentPreloadId) {
        console.log(`Preload session ${preloadId} cancelled.`);
        return;
    }

    // 2. Skip if cached
    if (audioCache[idiom.english]) continue;

    try {
      await generateTTS(idiom.english);
      
      // 3. Rate Limit Protection: 
      // Wait 4 seconds between preloads. This ensures we stay under ~15 RPM.
      // This is slow but prevents crashing the app with errors.
      await new Promise(resolve => setTimeout(resolve, 4000));
      
    } catch (e: any) {
      console.warn(`Preload failed for ${idiom.english}`, e);
      // If we hit a rate limit during preload, just stop the preload loop entirely
      if (e.message?.includes('Too many requests') || e.message?.includes('429')) {
        console.warn("Rate limit hit during preload. Stopping background loading.");
        return; 
      }
    }
  }
};

// Helper for raw PCM decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Check if the user's meaning input matches the correct meaning using semantic understanding.
 */
export const gradeMeaning = async (correctMeaning: string, userMeaning: string): Promise<boolean> => {
  try {
    const prompt = `
      Task: Determine if the user's answer means the same thing as the correct definition.
      Context: English Idiom Learning.
      
      Correct Definition: "${correctMeaning}"
      User Answer: "${userMeaning}"
      
      Instructions:
      1. Ignore minor typos or spacing issues.
      2. If the user answer captures the core essence or is a valid synonym in Korean, mark as true.
      3. If the meaning is different, mark as false.
      
      Return strictly a JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
          },
          required: ["isCorrect"],
        },
      },
    });

    const json = JSON.parse(response.text || "{}");
    return json.isCorrect === true;

  } catch (error) {
    console.error("Grading Error:", error);
    // Fallback to simple inclusion check if AI fails
    return userMeaning.includes(correctMeaning) || correctMeaning.includes(userMeaning);
  }
};
