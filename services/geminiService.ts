
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
      description: "The full transcribed text from the image.",
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
    Analyze the handwriting in this image.
    1. Transcribe all text content accurately.
    2. Determine if the overall structure of the content is a table.
    3. If it is a table, extract the data into a structured array of arrays, where each inner array represents a row of cells.
    4. Return the result in the specified JSON format. The 'tableData' field should be null or omitted if it's not a table.
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
