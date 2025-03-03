"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState("");
    const [summary, setSummary] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

            console.log("✅ Full Response from Backend:", response.data); // Debugging

            if (response.data.extracted_text) {
                setExtractedText(response.data.extracted_text);
            } else {
                setExtractedText("No text extracted.");
            }

            if (response.data.summary) {
                setSummary(response.data.summary);
            } else {
                setSummary("No summary generated.");
            }

        } catch (error) {
            console.error("❌ Axios Error:", error);

            if ((error as any).response) {
                setError(`Server Error: ${(error as any).response.status} - ${(error as any).response.statusText}`);
            } else if ((error as any).request) {
                setError("No response from server. Is FastAPI running?");
            } else {
                setError("Unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
            <h1>AI-Powered Document Scanner</h1>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
                {loading ? "Processing..." : "Upload"}
            </button>

            {error && <p style={{ color: 'red' }}>❌ {error}</p>}

            {extractedText && (
                <div style={{ textAlign: "left", marginTop: "20px" }}>
                    <h2>Extracted Text:</h2>
                    <p>{extractedText}</p>
                </div>
            )}

            {summary && (
                <div style={{ textAlign: "left", marginTop: "20px", background: "#000000", padding: "10px", borderRadius: "5px" }}>
                    <h2>Summary:</h2>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
}
