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
  const [selectedOption, setSelectedOption] = useState<string>("Select an option");
  const [menuOpen, setMenuOpen] = useState<boolean>(false); // State to manage dropdown visibility

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

  const handleOptionChange = (option: keyof typeof predefinedPrompts | "Custom Prompt") => {
    setSelectedOption(option);
    setMenuOpen(false); // Close the dropdown menu when an option is selected
  };

  const handleButtonClick = () => {
    if (selectedOption === "Custom Prompt") {
      handleCustomSummarize();
    } else {
      handleExtractAndSummarize(predefinedPrompts[selectedOption as keyof typeof predefinedPrompts]);
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

      <div className="relative inline-block text-left mt-6">
        <div>
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)} // Toggle dropdown visibility
          >
            {selectedOption}
            <svg
              className="-mr-1 ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div className="py-1" role="none">
              {Object.keys(predefinedPrompts).map((option) => (
                <button
                  key={option}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                  role="menuitem"
                  onClick={() => handleOptionChange(option as keyof typeof predefinedPrompts)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                role="menuitem"
                onClick={() => handleOptionChange("Custom Prompt")}
              >
                Custom Prompt
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOption === "Custom Prompt" && (
        <input
          type="text"
          placeholder="Custom prompt..."
          className="w-full p-2 mt-4 border rounded"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />
      )}

      <button
        onClick={handleButtonClick}
        className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        {loading ? "Processing..." : `Summarize with ${selectedOption}`}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <textarea className="w-full h-40 p-2 mt-4 border rounded" value={summary} readOnly />
    </div>
  );
};

export default Home;