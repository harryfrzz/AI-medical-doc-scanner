import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

export async function summarizeText(text: string, prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: `${prompt}\n\n${text}` }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Gemini API Error:", error.response?.data || error.message);
    } else {
      console.error("Gemini API Error:", (error as Error).message);
    }
    throw new Error("Failed to summarize text");
  }
}
