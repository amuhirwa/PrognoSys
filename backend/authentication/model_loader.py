import tensorflow as tf
import xgboost as xgb
import numpy as np
import joblib

def load_diabetes_model():
    return tf.keras.models.load_model('../models/diabetes_model.keras')

# Load XGBoost model for Heart Failure
def load_heart_failure_model():
    model = xgb.Booster()
    model.load_model('../models/xgb_heart.json')
    return model

def load_diabetes_scaler():
    return joblib.load('../models/scaler.pkl')

def load_heart_failure_scaler():
    return joblib.load('../models/heart_scaler.pkl')

# Load models once when the server starts
diabetes_model = load_diabetes_model()
heart_failure_model = load_heart_failure_model()
diabetes_scaler = load_diabetes_scaler()
heart_failure_scaler = load_heart_failure_scaler()
