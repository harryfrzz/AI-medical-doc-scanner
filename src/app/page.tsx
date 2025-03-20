"use client";
import React, { useState, useEffect } from "react";
import { extractTextFromImage } from "./lib/azureOCR";
import { summarizeText } from "./lib/geminiAPI";
import ExtractedTextArea from "./Components/ExtractedTextArea";
import InputBar from "./Components/InputBar";
import Markdown from "marked-react";
import { motion } from "framer-motion";

const predefinedPrompts = {
  Medical: "Summarise this medical report in a structured manner with all the information included,if the information is not based on a medical report then don't summarize it",
  Report: "Summarize this receipt, extracting total amounts.if the information is not based on a medical receipt then don't summarize it",
  Prescription: "Summarize this prescription, highlighting key medications.if the information is not based on a medical prescription then don't summarize it",
};

const Home = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [displayedSummary, setDisplayedSummary] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [textExtracted, setTextExtracted] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("Select an option");
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Simulate page load blur animation
    setTimeout(() => setPageLoaded(true), 500);
  }, []);

  const handleFileSelection = (selectedFiles: FileList) => {
    setFiles(Array.from(selectedFiles));
    setTextExtracted(false); 
  };

  const handleExtractAndSummarize = async (prompt: string) => {
    if (files.length === 0) return alert("Please select files first!");
    setLoading(true);
    setError(null);
    setDisplayedSummary("");

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
    setDisplayedSummary("");

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

  // Text typing animation effect - FASTER SPEED
useEffect(() => {
  if (summary && !loading) {
    let currentIndex = 0;
    setDisplayedSummary("");
    
    const typingInterval = setInterval(() => {
      if (currentIndex < summary.length) {
        setDisplayedSummary(prev => prev + summary[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 2); // Changed from 15ms to 5ms for faster typing
    
    return () => clearInterval(typingInterval);
  }
}, [summary, loading]);

  return (
    <>
      <motion.div 
        initial={{ filter: "blur(10px)" }}
        animate={{ filter: pageLoaded ? "blur(0px)" : "blur(10px)" }}
        transition={{ duration: 1.2 }}
        className="flex flex-col items-center h-[100vh] border border-[rgb(34,34,34)] p-8 bg-gradient-to-b from-black via-[#121212] to-[#0a0a14] rounded-b-none rounded-t-2xl text-black overflow-scroll"
        id="container"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-[1000px]"
        >
          <motion.div 
            className="flex flex-col gap-5 justify-start w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <h1 className="text-5xl text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">CliniQ</h1>
            <h1 className="text-2xl text-white font-bold mb-10">AI Medical Report Summariser</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1}}
          >
            <ExtractedTextArea extractedText={extractedText} setExtractedText={setExtractedText} />
          </motion.div>

          <motion.div 
            className="flex justify-start w-full mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="w-full border border-[rgb(24,24,24)]"/>
          </motion.div>

          <motion.div 
            className="flex justify-start w-full mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <h1 className="text-2xl font-bold mb-4 text-white">Summary</h1>
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500"
            >
              {error}
            </motion.p>
          )}

            <motion.div 
              className="mb-62 text-xl text-white relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: displayedSummary ? 1 : 0 }}
              transition={{ duration: 0.1 }}
            >
              <Markdown>{displayedSummary}</Markdown>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="spinner h-10 w-10 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                </div>
              )}
              {displayedSummary && summary !== displayedSummary && (
                <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse"></span>
              )}
            </motion.div>

          
        </motion.div>          

      </motion.div>
      <div className="flex justify-center">
        <InputBar 
              predefinedPrompts={predefinedPrompts}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              loading={loading}
              handleButtonClick={handleButtonClick}
              onFilesSelected={handleFileSelection}
            />
      </div>
    </>
  );
};

export default Home;