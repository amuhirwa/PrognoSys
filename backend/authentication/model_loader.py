import tensorflow as tf
import xgboost as xgb
import numpy as np
import joblib
import os
from pathlib import Path

# Get the absolute path to the models directory
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = os.path.join(BASE_DIR, 'models')

def load_diabetes_model():
    model_path = os.path.join(MODELS_DIR, 'diabetes_model.keras')
    return tf.keras.models.load_model(model_path)

# Load XGBoost model for Heart Failure
def load_heart_failure_model():
    model = xgb.Booster()
    model_path = os.path.join(MODELS_DIR, 'xgb_heart.json')
    model.load_model(model_path)
    return model

def load_diabetes_scaler():
    scaler_path = os.path.join(MODELS_DIR, 'scaler.pkl')
    return joblib.load(scaler_path)

def load_heart_failure_scaler():
    scaler_path = os.path.join(MODELS_DIR, 'heart_scaler.pkl')
    return joblib.load(scaler_path)

def load_heart_failure_encoder():
    encoder_path = os.path.join(MODELS_DIR, 'label_encoder.pkl')
    chest_pain_encoder_path = os.path.join(MODELS_DIR, 'chest_pain_encoder.pkl')
    resting_ecg_encoder_path = os.path.join(MODELS_DIR, 'resting_ecg_encoder.pkl')
    return {"label_encoder": joblib.load(encoder_path), "chest_pain_encoder": joblib.load(chest_pain_encoder_path), "resting_ecg_encoder": joblib.load(resting_ecg_encoder_path)}

# Load models once when the server starts
diabetes_model = load_diabetes_model()
heart_failure_model = load_heart_failure_model()
diabetes_scaler = load_diabetes_scaler()
heart_failure_scaler = load_heart_failure_scaler()
heart_failure_encoder = load_heart_failure_encoder()
