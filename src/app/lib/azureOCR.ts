import Cors from "cors";
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  });
  
  function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
      fn(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  }

const AZURE_OCR_ENDPOINT = "https://ai-medical.cognitiveservices.azure.com/";
const AZURE_OCR_KEY = "EUgJOXnmZw6Y3Pg4ExeQYb3q4TOyLECvhkeACxexeaW3l7NoeXBTJQQJ99BCACYeBjFXJ3w3AAALACOGEqQj";

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
