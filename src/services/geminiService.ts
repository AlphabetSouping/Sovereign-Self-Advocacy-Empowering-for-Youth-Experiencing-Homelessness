import { GoogleGenAI } from "@google/genai";

// Initialization with lazy check as per guidelines
let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function generateNarrative(genre: string, topic: string) {
  const ai = getAI();

  const prompt = `Generate a short story segment (approx 100 words) in the genre of '${genre}' focusing on the topic of '${topic}'. 
  The scenario should involve a youth character asserting their rights in a systemic interaction (e.g., with a police officer, case worker, or school official).
  Include:
  1. A Scenario Title.
  2. A Narrated Scenario.
  3. A 'Sovereign Insight' (one sentence summarizing the power dynamic).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a creative writer for The Sovereign Core Project. Your goal is to create short, powerful scenarios that teach radical self-advocacy to youth experiencing homelessness. Use liberation psychology and critical race theory. Avoid paternalism or pity. Focus on agency and rights. Genre selection is critical: adapt the tone perfectly to the requested genre."
      }
    });

    return response.text || "No signal detected from the Core.";
  } catch (error) {
    console.error("Narrative generation failed:", error);
    return "Error generating narrative. Please check your core connection.";
  }
}
