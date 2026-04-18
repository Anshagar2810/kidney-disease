import tensorflow as tf
import numpy as np
try:
    model = tf.keras.models.load_model('model/kidney_model.h5')
    img_array = np.zeros((1, 224, 224, 3))
    print("Model loaded. Predicting...")
    pred = model.predict(img_array)
    print("Prediction:", pred)
except Exception as e:
    import traceback
    traceback.print_exc()
