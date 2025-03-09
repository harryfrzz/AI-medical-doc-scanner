import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

const AZURE_OCR_ENDPOINT = process.env.AZURE_OCR_ENDPOINT || "";
const AZURE_OCR_KEY = process.env.AZURE_OCR_KEY || "";

const client = new DocumentAnalysisClient(AZURE_OCR_ENDPOINT, new AzureKeyCredential(AZURE_OCR_KEY));

export async function extractTextFromImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const poller = await client.beginAnalyzeDocument("prebuilt-layout", fileBuffer);
  const result = await poller.pollUntilDone();

  if (!result) return "No text found";

  // Extract text from pages
  const extractedText = result.pages?.map((page) =>
    page.lines?.map((line) => line.content).join(" ")
  ).join("\n") || "No text found";

  return extractedText;
}
