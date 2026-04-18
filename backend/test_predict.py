import os
import tensorflow as tf
from PIL import Image
import numpy as np

model = tf.keras.models.load_model('model/kidney_model.keras')

def predict(img_path):
    img = Image.open(img_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    prob = model.predict(img_array)[0][0]
    return prob

normal_dir = "../Hyperspectral kidney Dataset/Hyperspectral_normal_images"
tumor_dir = "../Hyperspectral kidney Dataset/Hyperspectral_tumor_images"

normal_file = os.path.join(normal_dir, os.listdir(normal_dir)[0])
tumor_file = os.path.join(tumor_dir, os.listdir(tumor_dir)[0])

print("Testing Normal Image:", normal_file)
print("Normal Prob (Expect ~0.0):", predict(normal_file))

print("Testing Tumor Image:", tumor_file)
print("Tumor Prob (Expect ~1.0):", predict(tumor_file))
