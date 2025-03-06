import React from "react";

interface ExtractedTextAreaProps {
  extractedText: string;
  setExtractedText: (text: string) => void;
}

const ExtractedTextArea: React.FC<ExtractedTextAreaProps> = ({ extractedText, setExtractedText }) => {
  return (
    <textarea
      className="w-full h-40 p-2 mt-4 border rounded"
      value={extractedText}
      onChange={(e) => setExtractedText(e.target.value)}
    />
  );
};

export default ExtractedTextArea;