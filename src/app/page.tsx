"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [codeImage, setCodeImage] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState("");
    const [summary, setSummary] = useState("");
    const [extractedCode, setExtractedCode] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [processingCode, setProcessingCode] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Please select a file!");

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setError(null);
        setExtractedText("");
        setSummary("");

        try {
            const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Full Response from Backend:", response.data);

            setExtractedText(response.data.extracted_text || "No text extracted.");
            setSummary(response.data.summary || "No summary generated.");

        } catch (error) {
            console.error("❌ Axios Error:", error);
            setError("An error occurred while processing the document.");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeExtraction = async () => {
        if (!codeImage) return alert("Please select a code image!");

        const formData = new FormData();
        formData.append("file", codeImage);

        setProcessingCode(true);
        setError(null);
        setExtractedCode("");
        setAiResponse("");

        try {
            const response = await axios.post("http://127.0.0.1:8000/extract_code", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Code Extraction Response:", response.data);
            setExtractedCode(response.data.extracted_code || "No code detected.");

        } catch (error) {
            console.error("❌ Axios Error:", error);
            setError("An error occurred while extracting code.");
        } finally {
            setProcessingCode(false);
        }
    };

    const handleAIAction = async (action: "generate" | "fix" | "explain" | "custom", customPrompt: string = "") => {
        if (!extractedCode) {
            alert("No extracted code available!");
            return;
        }
    
        const payload = action === "custom" 
            ? { code: extractedCode, custom_prompt: customPrompt }
            : { code: extractedCode };
    
        try {
            const response = await axios.post(`http://127.0.0.1:8000/${action}`, payload);
    
            console.log(`✅ AI ${action} Response:`, response.data);
            setAiResponse(response.data.result || "No response from AI.");
    
        } catch (error) {
            const err = error as any;
            console.error(`❌ Axios Error:`, err.response?.data || err.message);
            setError(`An error occurred while performing ${action}.`);
        }
    };
    
    return (
        <div className="max-w-lg mx-auto my-12 text-center">
            <h1 className="text-2xl font-bold">AI-Powered Document Scanner</h1>

            <div className="mb-8 p-5 border border-gray-300 rounded">
                <h2 className="text-xl font-semibold">Process Text Documents</h2>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2" />
                <button onClick={handleUpload} disabled={loading} className="ml-3 px-4 py-2 bg-blue-500 text-white rounded">
                    {loading ? "Processing..." : "Upload"}
                </button>
                {error && <p className="text-red-500">❌ {error}</p>}
                {extractedText && <div className="mt-5 text-left"><h3 className="font-semibold">Extracted Text:</h3><p>{extractedText}</p></div>}
                {summary && <div className="mt-5 text-left bg-black text-white p-3 rounded"><h3 className="font-semibold">Summary:</h3><p>{summary}</p></div>}
            </div>

            <div className="p-5 border border-gray-300 rounded">
                <h2 className="text-xl font-semibold">Extract Code from Image</h2>
                <input type="file" onChange={(e) => setCodeImage(e.target.files?.[0] || null)} className="mt-2" />
                <button onClick={handleCodeExtraction} disabled={processingCode} className="ml-3 px-4 py-2 bg-blue-500 text-white rounded">
                    {processingCode ? "Extracting..." : "Extract Code"}
                </button>
                {extractedCode && <div className="mt-5 text-left bg-gray-900 text-white p-3 rounded"><h3 className="font-semibold">Extracted Code:</h3><pre className="whitespace-pre-wrap break-words">{extractedCode}</pre></div>}

                <div className="mt-4 flex gap-2">
                    <button onClick={() => handleAIAction("generate")} className="px-4 py-2 bg-blue-500 text-white rounded">Generate</button>
                    <button onClick={() => handleAIAction("fix")} className="px-4 py-2 bg-blue-500 text-white rounded">Fix</button>
                    <button onClick={() => handleAIAction("explain")} className="px-4 py-2 bg-blue-500 text-white rounded">Explain</button>
                </div>

                <div className="mt-4 text-left">
                    <h3 className="font-semibold">Custom AI Prompt:</h3>
                    <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Enter your custom prompt..." className="w-full p-2 mt-2 border border-gray-300 rounded" />
                    <button onClick={() => handleAIAction("custom", customPrompt)} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded">Submit Prompt</button>
                </div>
                {/* ✅ AI Response Section */}
                {aiResponse && (
                    <div className="text-left mt-5 bg-gray-900 text-white p-3 rounded-lg overflow-scroll">
                        <h3 className="text-lg font-semibold">AI Response:</h3>
                        <pre className="whitespace-pre-wrap break-words">{aiResponse}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}