"use client";
import React, { useState } from "react";
import { extractTextFromImage } from "./lib/azureOCR";
import { summarizeText } from "./lib/geminiAPI";
import FileUploader from "./Components/FileUploader";

const predefinedPrompts = {
  medical: "Summarise this medical report in a structured manner with all the information included",
  receipt: "Summarize this receipt, extracting total amounts.",
  prescription: "Summarize this prescription, highlighting key medications.",
};

const Home = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [textExtracted, setTextExtracted] = useState<boolean>(false); // Flag to check if text is already extracted

  const handleFileSelection = (selectedFiles: FileList) => {
    setFiles(Array.from(selectedFiles));
    setTextExtracted(false); // Reset the flag when new files are selected
  };

  const handleExtractAndSummarize = async (prompt: string) => {
    if (files.length === 0) return alert("Please select files first!");
    setLoading(true);
    setError(null);

    try {
      let combinedText = extractedText;

      // Extract text from files if not already extracted
      if (!textExtracted) {
        combinedText = "";
        for (const file of files) {
          const text = await extractTextFromImage(file);
          combinedText += `\n${text}`;
        }
        setExtractedText(combinedText);
        setTextExtracted(true); // Set the flag to true after extraction
      }

      // Summarize the extracted text
      const result = await summarizeText(combinedText, prompt);
      setSummary(result);
    } catch (error) {
      console.error("Error processing request:", error);
      setError("Failed to process the request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSummarize = async () => {
    if (!extractedText) return alert("Please extract text first!");
    setLoading(true);
    setError(null);

    try {
      const result = await summarizeText(extractedText, customPrompt);
      setSummary(result);
    } catch (error) {
      console.error("Error summarizing text:", error);
      setError("Failed to summarize the text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold text-center mb-4">Medical Report Summarizer</h1>
      
      <FileUploader onFilesSelected={handleFileSelection} />

      <textarea
        className="w-full h-40 p-2 mt-4 border rounded"
        value={extractedText}
        onChange={(e) => setExtractedText(e.target.value)}
      />

      <h2 className="mt-6 text-xl font-semibold">Summarization Options:</h2>
      <div className="flex space-x-2 mt-2">
        {Object.entries(predefinedPrompts).map(([key, prompt]) => (
          <button
            key={key}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => handleExtractAndSummarize(prompt)}
            disabled={loading}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Custom prompt..."
        className="w-full p-2 mt-4 border rounded"
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
      />

      <button
        onClick={handleCustomSummarize}
        className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        {loading ? "Processing..." : "Summarize with Custom Prompt"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <textarea className="w-full h-40 p-2 mt-4 border rounded" value={summary} readOnly />
    </div>
  );
};

export default Home;