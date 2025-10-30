"""
Preprocessing utilities for consistent data transformation between training and inference.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List
import joblib
from pathlib import Path
import logging

from .config import ARTIFACTS_ROOT

logger = logging.getLogger(__name__)


class Preprocessor:
    """Handles consistent preprocessing for training and inference."""
    
    def __init__(self):
        self.scaler = None
        self.imputer = None
        self.feature_names = []
        self.feature_mapping = {}
        
    def load_artifacts(self):
        """Load preprocessing artifacts."""
        try:
            self.scaler = joblib.load(ARTIFACTS_ROOT / "scaler.pkl")
            self.imputer = joblib.load(ARTIFACTS_ROOT / "imputer.pkl")
            
            import json
            with open(ARTIFACTS_ROOT / "feature_list.json", 'r') as f:
                self.feature_names = json.load(f)
                
            logger.info("Preprocessing artifacts loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading preprocessing artifacts: {e}")
            raise
    
    def transform_applicant_data(self, applicant_data: Dict[str, Any]) -> np.ndarray:
        """Transform applicant data for model prediction."""
        
        # Convert to DataFrame
        df = pd.DataFrame([applicant_data])
        
        # Add derived features
        df = self._add_derived_features(df)
        
        # Ensure all required features are present
        df = self._ensure_feature_completeness(df)
        
        # Reorder columns to match training order
        df = df[self.feature_names]
        
        # Handle missing values
        df_imputed = pd.DataFrame(
            self.imputer.transform(df),
            columns=df.columns,
            index=df.index
        )
        
        # Scale features
        df_scaled = pd.DataFrame(
            self.scaler.transform(df_imputed),
            columns=df_imputed.columns,
            index=df_imputed.index
        )
        
        return df_scaled.values
    
    def _add_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add derived features that were created during training."""
        
        # Add monthly income
        if 'annual_income' in df.columns:
            df['monthly_income'] = df['annual_income'] / 12
        
        # Add loan-to-income ratio
        if 'loan_amount' in df.columns and 'annual_income' in df.columns:
            df['loan_to_income_ratio'] = df['loan_amount'] / df['annual_income']
        
        # Add high utilization flag
        if 'revolving_utilization' in df.columns:
            df['high_utilization'] = (df['revolving_utilization'] > 0.8).astype(int)
        
        return df
    
    def _ensure_feature_completeness(self, df: pd.DataFrame) -> pd.DataFrame:
        """Ensure all required features are present with default values."""
        
        # Default values for missing features
        defaults = {
            'age': 35,
            'dependents': 0,
            'employment_length': 5,
            'loan_amount': 10000,
            'term_length': 36,
            'monthly_income': df['annual_income'].iloc[0] / 12 if 'annual_income' in df.columns else 5000,
            'loan_to_income_ratio': 0.2,
            'high_utilization': 0
        }
        
        # Add missing features with defaults
        for feature, default_value in defaults.items():
            if feature not in df.columns:
                df[feature] = default_value
        
        return df
