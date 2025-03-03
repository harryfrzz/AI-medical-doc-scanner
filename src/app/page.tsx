"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [codeImage, setCodeImage] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState("");
    const [summary, setSummary] = useState("");
    const [extractedCode, setExtractedCode] = useState("");
    const [aiResponse, setAiResponse] = useState(""); // ✅ Stores AI-generated/fixed/explained code
    const [customPrompt, setCustomPrompt] = useState(""); // ✅ Custom prompt input
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
        setAiResponse(""); // ✅ Reset AI response when new extraction happens

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

    // AI Operations
    const handleAIAction = async (action: "generate" | "fix" | "explain" | "custom", customPrompt: string = "") => {
        if (!extractedCode) {
            alert("No extracted code available!");
            return;
        }
    
        // Prepare request payload
        const payload = action === "custom" 
            ? { code: extractedCode, custom_prompt: customPrompt } // 🔹 Use `custom_prompt`
            : { code: extractedCode };
    
        try {
            const response = await axios.post(`http://127.0.0.1:8000/${action}`, payload);
    
            console.log(`✅ AI ${action} Response:`, response.data);
            setAiResponse(response.data.result || "No response from AI."); // ✅ Store AI response in state
    
        } catch (error) {
            const err = error as any;
            console.error(`❌ Axios Error:`, err.response?.data || err.message);
            setError(`An error occurred while performing ${action}.`);
        }
    };
    

    return (
        <div className="container" style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
            <h1>AI-Powered Document Scanner</h1>

            {/* Document Upload Section */}
            <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "5px" }}>
                <h2>Process Text Documents</h2>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
                    {loading ? "Processing..." : "Upload"}
                </button>
                {error && <p style={{ color: "red" }}>❌ {error}</p>}
                {extractedText && (
                    <div style={{ textAlign: "left", marginTop: "20px" }}>
                        <h3>Extracted Text:</h3>
                        <p>{extractedText}</p>
                    </div>
                )}
                {summary && (
                    <div style={{ textAlign: "left", marginTop: "20px", background: "#000", padding: "10px", borderRadius: "5px", color: "#fff" }}>
                        <h3>Summary:</h3>
                        <p>{summary}</p>
                    </div>
                )}
            </div>

            {/* Code Image Upload Section */}
            <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "5px", marginTop: "20px" }}>
                <h2>Extract Code from Image</h2>
                <input type="file" onChange={(e) => setCodeImage(e.target.files?.[0] || null)} />
                <button onClick={handleCodeExtraction} disabled={processingCode} style={{ marginLeft: "10px" }}>
                    {processingCode ? "Extracting..." : "Extract Code"}
                </button>
                {extractedCode && (
                    <div style={{ textAlign: "left", marginTop: "20px", background: "#1e1e1e", color: "#fff", padding: "10px", borderRadius: "5px" }}>
                        <h3>Extracted Code:</h3>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{extractedCode}</pre>

                        {/* AI Action Buttons */}
                        <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                            <button onClick={() => handleAIAction("generate")} style={buttonStyle}>Generate</button>
                            <button onClick={() => handleAIAction("fix")} style={buttonStyle}>Fix</button>
                            <button onClick={() => handleAIAction("explain")} style={buttonStyle}>Explain</button>
                        </div>

                        {/* ✅ Custom Prompt Input Area */}
                        <div style={{ marginTop: "10px", textAlign: "left" }}>
                            <h3>Custom AI Prompt:</h3>
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="Enter your custom prompt..."
                                style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "5px", border: "1px solid #ddd" }}
                            />
                            <button onClick={() => handleAIAction("custom", customPrompt)} style={{ ...buttonStyle, marginTop: "10px" }}>Submit Prompt</button>
                        </div>
                    </div>
                )}

                {/* ✅ AI Response Section */}
                {aiResponse && (
                    <div style={{ textAlign: "left", marginTop: "20px", background: "#282c34", color: "#fff", padding: "10px", borderRadius: "5px", overflow:"scroll" }}>
                        <h3>AI Response:</h3>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{aiResponse}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

// Button Styling
const buttonStyle: React.CSSProperties = {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    flex: 1,
    margin: "0 5px"
};