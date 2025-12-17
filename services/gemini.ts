
import { GoogleGenAI, Type } from "@google/genai";
import { IncidentReport } from "../types";

// Note: GoogleGenAI is instantiated within function calls to ensure it uses the latest environment configuration.

export const generateIncidentReport = async (score: number, finalBalance: number): Promise<IncidentReport> => {
  // Always use the required naming and access pattern for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const direction = finalBalance > 0 ? "right" : "left";
  const prompt = `A business analyst named Attmay Ucaslay just fell asleep at his desk. 
  His head tilted too far to the ${direction} and hit the mahogany desk with a catastrophic impact. 
  He survived for ${score} seconds of corporate tedium. 
  Generate a dark-humor, grotesque, yet corporate-sounding incident report. 
  The summary should be tragic but framed in HR speak.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            corporateLingo: { type: Type.STRING },
            funnyCause: { type: Type.STRING }
          },
          required: ["summary", "corporateLingo", "funnyCause"]
        }
      }
    });

    // Access the extracted string directly via the .text property
    const text = response.text;
    if (!text) throw new Error("No response text returned");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Employee experienced a terminal synergy failure with the desktop environment.",
      corporateLingo: "Rapid Unscheduled Desktop Interface (RUDI)",
      funnyCause: "Excessive exposure to spreadsheets without adequate caffeine infrastructure."
    };
  }
};

export const getCorporateDistraction = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a 1-sentence boring corporate task or email subject line to distract a player. e.g. 'URGENT: Q3 Synergy Alignment Meeting moved up 5 minutes'",
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Access the .text property directly
    return response.text || "New Email: Quarterly Compliance Training";
  } catch {
    return "Notification: Ping from Manager";
  }
};
