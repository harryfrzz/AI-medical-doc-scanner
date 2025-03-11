"use client";
import React, { useState } from "react";
import { extractTextFromImage } from "./lib/azureOCR";
import { summarizeText } from "./lib/geminiAPI";
import ExtractedTextArea from "./Components/ExtractedTextArea";
import InputBar from "./Components/InputBar";
import InfoButton from "./Components/InfoButton";
import Markdown from "marked-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { BlurFade } from "@/components/magicui/blur-fade";

const predefinedPrompts = {
  Medical: "Summarise this medical report in a structured manner with all the information included",
  Report: "Summarize this receipt, extracting total amounts.",
  Prescription: "Summarize this prescription, highlighting key medications.",
};

const Home = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [textExtracted, setTextExtracted] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("Select an option");

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
      if (!textExtracted) {
        combinedText = "";
        for (const file of files) {
          const text = await extractTextFromImage(file);
          combinedText += `\n${text}`;
        }
        setExtractedText(combinedText);
        setTextExtracted(true);
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

  const handleButtonClick = () => {
    if (selectedOption === "Custom Prompt") {
      handleCustomSummarize();
    } else {
      handleExtractAndSummarize(predefinedPrompts[selectedOption as keyof typeof predefinedPrompts]);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center h-[100vh] border border-[rgb(34,34,34)] p-8 bg-black rounded-b-none rounded-t-2xl text-black overflow-scroll" id="container">
        <div className="w-[1000px]">
            <div className="flex flex-col gap-5 justify-start w-full">
              <h1 className="text-5xl text-white font-bold">CliniQ</h1>
              <h1 className="text-2xl text-white font-bold mb-10">AI Medical Report Summariser</h1>
            </div>
            <ExtractedTextArea extractedText={extractedText} setExtractedText={setExtractedText} />

            <div className="flex justify-start w-full mt-10">
              <h1 className="text-2xl font-bold mb-4">Summary</h1>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="mb-62 text-xl text-white">
              <TextAnimate animation="blurIn" as="p" className="text-white">                  
             {summary}
              </TextAnimate>
                
            </div>
          </div>

          <div className="flex justify-center">
            <InputBar predefinedPrompts={predefinedPrompts}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              loading={loading}
              handleButtonClick={handleButtonClick}
              onFilesSelected={handleFileSelection}/>
          </div>
        </div>
      <InfoButton/>
    </>
  );
};

export default Home;