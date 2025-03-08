import React from "react";

interface ExtractedTextAreaProps {
  extractedText: string;
  setExtractedText: (text: string) => void;
}

const ExtractedTextArea: React.FC<ExtractedTextAreaProps> = ({ extractedText, setExtractedText }) => {
  return (<>
    <div className="w-full rounded-lg h-auto bg-amber-100">
      <div className="w-[1000px] flex justify-start items-center h-10 bg-black rounded-t-lg">
        <h1 className="text-sm ml-3 text-white">Extracted Text</h1>
      </div>   
        <textarea
        className="w-full h-50 p-5"
        value={extractedText}
        onChange={(e) => setExtractedText(e.target.value)}
      />
    </div>
  </>
    
  );
};

export default ExtractedTextArea;