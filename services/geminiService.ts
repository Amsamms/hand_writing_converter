
import { GoogleGenAI, Type } from "@google/genai";
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [imagePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedResponse = JSON.parse(jsonString) as GeminiResponse;

    // A little extra validation
    if (typeof parsedResponse.isTable !== 'boolean' || typeof parsedResponse.textContent !== 'string') {
        throw new Error("Invalid JSON structure received from API.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Could not get a valid response from the AI model.");
  }
};
