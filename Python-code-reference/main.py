from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import json

# Azure API Configurations
AZURE_OCR_ENDPOINT = "YOUR_ENDPOINT_HERE"
AZURE_OCR_KEY = "YOUR_API_KEY_HERE"

AZURE_OPENAI_ENDPOINT = "YOUR_ENDPOINT_HERE"
AZURE_OPENAI_KEY = "YOUR_API_KEY_HERE"

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
            {"role": "system", "content": "Summarize the following text."},
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

# Function to process code using Azure OpenAI (for generate, fix, explain)
def process_code(code, action, custom_prompt=None):
    headers = {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_KEY
    }

    # Default prompts for predefined actions
    prompts = {
        "generate": "Generate a code snippet based on the following description.",
        "fix": "Fix the errors in the following code snippet.",
        "explain": "Explain what this code snippet does."
    }

    # If action is 'custom', use the provided custom prompt
    if action == "custom":
        if not custom_prompt:
            raise HTTPException(status_code=400, detail="Custom prompt is required for 'custom' action.")
        prompt = custom_prompt
    elif action in prompts:
        prompt = prompts[action]
    else:
        raise HTTPException(status_code=400, detail="Invalid action type")

    payload = {
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": code}
        ],
        "max_tokens": 200,
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
        return JSONResponse(content=response)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/extract_code")
async def extract_code(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        print(f"📜 Received code image: {file.filename}, Size: {len(image_bytes)} bytes")  # Debugging

        extracted_code = extract_text_from_image(image_bytes)

        if not extracted_code or extracted_code == "No text detected.":
            response = {"message": "No readable code found in the image."}
        else:
            response = {"extracted_code": extracted_code}

        print("🖥️ Extracted Code:", response)  # Debugging
        return JSONResponse(content=response)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/{action}")
async def ai_operations(action: str, request_body: dict):
    code = request_body.get("code", "")
    custom_prompt = request_body.get("custom_prompt")  # Get custom prompt

    if not code:
        raise HTTPException(status_code=400, detail="Code input is required.")

    try:
        result = process_code(code, action, custom_prompt)
        return JSONResponse(content={"result": result})

    except Exception as e:
        print(f"❌ Error processing {action}: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
