import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env:{
    GEMINI_API : process.env.GEMINI_API,
    AZURE_OCR_KEY: process.env.AZURE_OCR_KEY,
    AZURE_OCR_ENDPOINT : process.env.AZURE_OCR_ENDPOINT
  }
};

export default nextConfig;
