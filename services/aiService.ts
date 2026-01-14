
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Removed global getAI to follow guideline of creating a new instance before each call.

export interface AIAnalysisResult {
  category: string;
  fabric: string;
  condition: string;
  suggestedService: string;
}

export const analyzeGarmentImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  // Fix: Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fix: Use gemini-3-flash-preview for multimodal tasks with JSON support. 
  // gemini-2.5-flash-image does not support responseMimeType/responseSchema.
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this garment photo for a professional laundry system. 
    Identify:
    1. Category (Shirt, Pants, Dress, Suit, Household, or Special)
    2. Fabric type (e.g., Silk, Cotton, Wool, Polyester)
    3. Visible condition (stains, tears, or 'good')
    4. Suggested service (Wash & Iron, Iron Only, or Alterations)
    
    Return the analysis result in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        // Fix: Added responseSchema for more robust JSON output as recommended in guidelines.
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "The classification of the garment.",
            },
            fabric: {
              type: Type.STRING,
              description: "The material composition.",
            },
            condition: {
              type: Type.STRING,
              description: "The physical state of the item.",
            },
            suggestedService: {
              type: Type.STRING,
              description: "The recommended laundry protocol.",
            },
          },
          required: ["category", "fabric", "condition", "suggestedService"],
        }
      }
    });

    // Fix: Access the text property directly as per guidelines.
    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    
    return {
      category: result.category || "Other",
      fabric: result.fabric || "Unknown",
      condition: result.condition || "N/A",
      suggestedService: result.suggestedService || "Wash & Iron"
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};
