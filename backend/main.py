import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ml.predict import predict_image

app = FastAPI(title="Kidney Disease Detection API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReportRequest(BaseModel):
    prediction: str
    confidence: float

import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    try:
        contents = await file.read()
        prediction, confidence = predict_image(contents)
        return {"prediction": prediction, "confidence": confidence}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
async def generate_report(req: ReportRequest):
    prompt = f"""
    You are an AI medical assistant. A hyperspectral image of a kidney was analyzed by a Deep Learning model.
    The model prediction is '{req.prediction}' with a confidence of {req.confidence * 100:.2f}%.
    
    Based on this result ({req.prediction}), please provide a comprehensive but concise report in markdown format.
    
    CRITICAL INSTRUCTIONS FOR FORMATTING:
    - You MUST use exactly these bold markdown headings: **Disease Explanation**, **Cause of Disease**, **Risk Factors**, **Treatment**, and **Prevention Tips**.
    - You MUST heavily bold important keywords throughout the text, especially the exact words **Tumor**, **Normal**, **Disease**, and **Cancer** whenever they appear.

    Ensure the tone is informative and empathetic, but clearly state that this is AI-generated and not a replacement for a doctor's diagnosis.
    """

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return {"report": data.get("response", "No response generated.")}
    except requests.exceptions.RequestException as e:
        # Fallback if Ollama is not running
        fallback_report = f"""
### AI Medical Report (OLLAMA Not Running locally)
**Prediction:** {req.prediction} ({req.confidence * 100:.2f}%)

*Note: The local Ollama server with the 'mistral' model is not reachable. This is a placeholder report.*

1. **Disease Explanation**: 
The model predicted {req.prediction}. Please ensure a doctor reviews the hyperspectral images.
2. **Treatment Options**: 
Please consult a medical professional for actual treatment plans.
        """
        return {"report": fallback_report}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
