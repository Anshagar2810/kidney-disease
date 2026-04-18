import os
import io
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "kidney_model.keras")
IMG_SIZE = (224, 224)

# Keep model variable global so it's only loaded once when module is imported
model = None

def load_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            print(f"WARNING: Model not found at {MODEL_PATH}. Using mock prediction for development.")
            return "MOCK"
        model = tf.keras.models.load_model(MODEL_PATH)
    return model

def predict_image(image_bytes: bytes):
    """
    Takes raw image bytes, pre-processes them, and runs inference.
    Returns:
        prediction (str): "Tumor" or "Normal"
        confidence (float): Confidence score (0 to 1)
    """
    model = load_model()
    
    # Load image from bytes
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(IMG_SIZE)
    
    # Convert to numpy array and add batch dimension
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    
    # Predict
    if model == "MOCK":
        import random
        prediction_prob = random.uniform(0.0, 1.0)
    else:
        # Assuming sigmoid output
        prediction_prob = model.predict(img_array)[0][0]
    
    # Interpret results
    if prediction_prob >= 0.5:
        prediction = "Tumor"
        confidence = float(prediction_prob)
    else:
        prediction = "Normal"
        confidence = float(1.0 - prediction_prob)
        
    return prediction, confidence
