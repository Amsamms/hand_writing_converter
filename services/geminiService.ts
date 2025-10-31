import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";
import type { GeminiResponse } from "../types";

// Ensure process.env.API_KEY is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    isTable: {
      type: Type.BOOLEAN,
      description: "Is the content in the image structured as a table?",
    },
    textContent: {
      type: Type.STRING,
      description: "The full transcribed text from the image, preserving original layout and line breaks.",
    },
    tableData: {
      type: Type.ARRAY,
      description: "If it is a table, an array of arrays representing rows and cells. Otherwise, this can be null.",
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  },
  required: ["isTable", "textContent"],
};

const API_TIMEOUT = 90000; // 90 seconds

/**
 * Wraps a promise with a timeout.
 * @param promise The promise to wrap.
 * @param ms The timeout in milliseconds.
 * @param timeoutMessage The message for the timeout error.
 * @returns A new promise that will reject if the timeout is reached.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);

    promise
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export const processHandwriting = async (imageFile: File): Promise<GeminiResponse> => {
  if (!imageFile.type.startsWith("image/")) {
    throw new Error("Invalid file type. Please upload an image.");
  }

  const base64Data = await fileToBase64(imageFile);

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: imageFile.type,
    },
  };

  const prompt = `
    Analyze the handwriting in this image with high precision.
    1. Transcribe all text content exactly as it appears, **preserving the original layout, line breaks, spacing, and structure.** The transcription in the 'textContent' field should visually match the arrangement in the image as closely as possible.
    2. After transcribing, analyze the content to determine if it contains a table or tabular data.
    3. If a table is present, extract ONLY the table data into a structured array of arrays for the 'tableData' field, where each inner array represents a row of the table.
    4. Return the result in the specified JSON format. 'textContent' must contain the full, formatted transcription. 'tableData' should contain only the table data, or be null if no table is found.
  `;
  
  try {
    const apiCall = ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
          parts: [imagePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // FIX: Explicitly type the response from the Gemini API call to fix "Property 'text' does not exist on type 'unknown'" error.
    const response: GenerateContentResponse = await withTimeout(
        apiCall, 
        API_TIMEOUT, 
        'The AI model took too long to respond. Please try again.'
    );

    const jsonString = response.text.trim();
    if (!jsonString) {
        throw new Error("The AI model returned an empty response. The handwriting might be unclear or the image quality too low.");
    }
    const parsedResponse = JSON.parse(jsonString) as GeminiResponse;

    // A little extra validation
    if (typeof parsedResponse.isTable !== 'boolean' || typeof parsedResponse.textContent !== 'string') {
        throw new Error("Invalid JSON structure received from the AI model.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        // Re-throw the specific error message (e.g., from timeout or API)
        // so the UI can display it.
        throw error;
    }
    // Fallback for non-Error objects
    throw new Error("An unexpected error occurred while contacting the AI model.");
  }
};