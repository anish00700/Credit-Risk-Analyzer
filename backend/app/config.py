"""
Backend configuration settings and constants.
"""
import os
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent  # Go up to project root
BACKEND_ROOT = PROJECT_ROOT / "backend"
DATA_ROOT = PROJECT_ROOT / "data"
ARTIFACTS_ROOT = BACKEND_ROOT / "artifacts"

# Data paths
LOAN_DATA_PATH = DATA_ROOT / "loan_processed_data.csv"
HOME_CREDIT_TRAIN_PATH = DATA_ROOT / "homecreditdata" / "application_train.csv"

# Model artifacts
MODEL_PATH = ARTIFACTS_ROOT / "model.pkl"
FEATURE_LIST_PATH = ARTIFACTS_ROOT / "feature_list.json"
SCALER_PATH = ARTIFACTS_ROOT / "scaler.pkl"
PREPROCESSOR_PATH = ARTIFACTS_ROOT / "preprocessor.pkl"

# Training parameters
RANDOM_STATE = 42
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.2

# Model parameters
MODEL_PARAMS = {
    "lightgbm": {
        "objective": "binary",
        "metric": "auc",
        "boosting_type": "gbdt",
        "num_leaves": 31,
        "learning_rate": 0.05,
        "feature_fraction": 0.9,
        "bagging_fraction": 0.8,
        "bagging_freq": 5,
        "verbose": -1,
        "random_state": RANDOM_STATE,
        "class_weight": "balanced"
    },
    "xgboost": {
        "objective": "binary:logistic",
        "eval_metric": "auc",
        "max_depth": 6,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.9,
        "random_state": RANDOM_STATE,
        "scale_pos_weight": 1  # Will be calculated dynamically
    },
    "catboost": {
        "objective": "Logloss",
        "eval_metric": "AUC",
        "depth": 6,
        "learning_rate": 0.05,
        "random_seed": RANDOM_STATE,
        "class_weights": [1, 1]  # Will be calculated dynamically
    }
}

# Risk tier thresholds
RISK_THRESHOLDS = {
    "LOW": 0.33,
    "MEDIUM": 0.66,
    "HIGH": 1.0
}

# API settings
API_HOST = "0.0.0.0"
API_PORT = 8000
API_TITLE = "Credit Risk Analyzer API"
API_DESCRIPTION = "AI-powered credit risk assessment with explainable insights"
API_VERSION = "1.0.0"

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082"
]
