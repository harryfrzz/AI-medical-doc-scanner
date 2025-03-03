from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import json

# Azure OCR API Config
AZURE_OCR_ENDPOINT = "https://ai-doc-scanner-harryfrz.cognitiveservices.azure.com/vision/v3.2/ocr"
AZURE_OCR_KEY = "F4PpW9iGHMLtLjlKwBXKpcHZ4hBaf9jW4KTa6YumDgOCGNQnvxVWJQQJ99BCACGhslBXJ3w3AAAFACOGzkqg"
AZURE_OPENAI_ENDPOINT = "https://harik-m7snaavi-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview"
AZURE_OPENAI_KEY = "4Hdf5VPQs8pQECgu4cerQwZvape5kPC27NSOtMrdPBBEWyIQcnjTJQQJ99BCACHYHv6XJ3w3AAAAACOGJslb"
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Match frontend
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)

# Function to extract text from image using Azure OCR
def extract_text_from_image(image_bytes):
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_OCR_KEY,
        "Content-Type": "application/octet-stream"
    }

    try:
        response = requests.post(AZURE_OCR_ENDPOINT, headers=headers, data=image_bytes)
        response_json = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"OCR API Error: {response_json}")

        # Extract text correctly
        extracted_text = []
        for region in response_json.get("regions", []):
            for line in region.get("lines", []):
                line_text = " ".join(word.get("text", "") for word in line.get("words", []))
                extracted_text.append(line_text)

        return "\n".join(extracted_text) if extracted_text else "No text detected."

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request Error: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid OCR response format")


# Function to summarize text using Azure OpenAI
def summarize_text(extracted_text):
    headers = {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_KEY
    }
    payload = {
        "messages": [
            {"role": "system", "content": "Summarize the following text in a concise manner."},
            {"role": "user", "content": extracted_text}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }

    try:
        response = requests.post(AZURE_OPENAI_ENDPOINT, headers=headers, json=payload)
        response_json = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"OpenAI API Error: {response_json}")

        return response_json["choices"][0]["message"]["content"].strip()

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request Error: {str(e)}")
    except KeyError:
        raise HTTPException(status_code=500, detail="Invalid OpenAI response format")


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        print(f"📸 Received file: {file.filename}, Size: {len(image_bytes)} bytes")  # Debugging

        extracted_text = extract_text_from_image(image_bytes)

        if not extracted_text or extracted_text == "No text detected.":
            response = {"message": "No readable text found in the image."}
        else:
            summary = summarize_text(extracted_text)
            response = {
                "extracted_text": extracted_text,
                "summary": summary
            }

        print("🚀 Sending Response to Frontend:", response)  # Debugging
        return JSONResponse(content=response)  # ✅ Ensure JSON format

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
