# AI Medical Document Scanner  

## Overview  
The **AI Medical Document Scanner** is a powerful tool designed to extract, process, and summarize key information from medical documents such as patient reports, receipts, and prescriptions. Built with **Next.js, TypeScript, React, Tailwind CSS**, and integrated with **Azure OCR and Gemini AI**, this application streamlines medical document management by automating text extraction and summarization.

## Features  
- 📄 **Supports Multiple Formats**: Upload PDFs, images (JPG, PNG), and DOC files.  
- 🔍 **OCR-Powered Text Extraction**: Uses **Azure OCR** to extract text from images and scanned documents.  
- 🧠 **AI-Powered Summarization**: Processes extracted text with **Gemini AI** to generate concise summaries.  
- ⚡ **Predefined Processing Options**: Quick actions for summarizing **patient reports, receipts, and prescriptions**.  
- 🏎️ **Fast & Secure**: Optimized for performance and security using modern web technologies.  

## 🛠️ Tech Stack  
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS  
- **Backend**: FastAPI  
- **AI & OCR**: Azure OCR, Gemini AI  
- **Storage & Processing**: Cloud-based API integrations  

## 📂 Installation & Setup  

### Prerequisites  
Ensure you have the following installed:  
- Node.js (v16 or later)  
- Python (for FastAPI backend)  
- Azure OCR & Gemini API keys  

### Frontend Setup  
```sh
git clone https://github.com/yourusername/ai-medical-doc-scanner.git  
cd ai-medical-doc-scanner/frontend  
npm install  
npm run dev  
