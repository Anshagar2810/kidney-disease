import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, Callback

# Define constants
DATASET_PATH = "/Users/ansh/Desktop/Kidney Disease/Hyperspectral kidney Dataset"
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 25 # Set to 25-50 based on user request

def create_model():
    # Base model using lightweight MobileNetV3 (CNN/Mobile Architecture)
    # This is a highly efficient lightweight mobile architecture that will train faster and maintain high accuracy.
    # Note: If required, XGBoost (exiboost) can be applied on top of the GlobalAveragePooling2D features, 
    # but MobileNetV3 alone combined with Dense layers usually achieves >90% easily.
    base_model = MobileNetV3Large(weights='imagenet', include_top=False, input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
    
    # Freeze the base model layers
    base_model.trainable = False

    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(1, activation='sigmoid')(x) # Binary classification (Normal vs Tumor)

    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(optimizer='adam', 
                  loss='binary_crossentropy', 
                  metrics=['accuracy'])
    return model

class CustomEpochLogger(Callback):
    def on_epoch_end(self, epoch, logs=None):
        acc = logs.get("accuracy", 0) * 100
        val_acc = logs.get("val_accuracy", 0) * 100
        print(f"\n========================================================")
        print(f" 📊 EPOCH {epoch+1}/{EPOCHS} RESULTS:")
        print(f" -> Training Accuracy   : {acc:.2f}%")
        print(f" -> Validation Accuracy : {val_acc:.2f}%")
        if val_acc >= 90.0:
            print(f" -> ✅ TARGET REACHED: Accuracy is >90%!")
        print(f"========================================================\n")

def train():
    print("Loading datasets...")
    
    # We will assume the folder names are the classes.
    # The folders are 'Hyperspectral_normal_images' and 'Hyperspectral_tumor_images'
    train_ds = image_dataset_from_directory(
        DATASET_PATH,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='binary' # 0 for first folder, 1 for second
    )

    val_ds = image_dataset_from_directory(
        DATASET_PATH,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='binary'
    )

    # Optimization: Prefetch and cache
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # Data Augmentation layer (can be added to model directly)
    data_augmentation = tf.keras.Sequential([
      tf.keras.layers.RandomFlip('horizontal'),
      tf.keras.layers.RandomRotation(0.2),
    ])

    print("Creating model...")
    model = create_model()

    model_dir = os.path.join(os.path.dirname(__file__), "..", "model")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'kidney_model.keras')

    callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True),
        ModelCheckpoint(filepath=model_path, monitor='val_accuracy', save_best_only=True),
        CustomEpochLogger()
    ]

    print("Starting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        verbose=2,
        callbacks=callbacks
    )

    print(f"Training completed. Best model saved to {model_path}")

if __name__ == "__main__":
    train()
