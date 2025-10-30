"""
Data loading and preprocessing utilities for credit risk modeling.
"""
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any
import logging
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
import joblib

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.config import (
    LOAN_DATA_PATH, 
    RANDOM_STATE, 
    TEST_SIZE, 
    VALIDATION_SIZE,
    ARTIFACTS_ROOT
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CreditDataLoader:
    """Handles loading and preprocessing of credit risk data."""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='median')
        self.label_encoders = {}
        self.feature_names = []
        
    def load_loan_data(self) -> pd.DataFrame:
        """Load the loan processed data."""
        logger.info(f"Loading data from {LOAN_DATA_PATH}")
        
        try:
            # Load data in chunks to handle large file
            chunk_size = 100000
            chunks = []
            
            for chunk in pd.read_csv(LOAN_DATA_PATH, chunksize=chunk_size):
                chunks.append(chunk)
                
            df = pd.concat(chunks, ignore_index=True)
            logger.info(f"Loaded {len(df)} records")
            
            return df
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def create_target_variable(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create binary target variable from loan_status."""
        logger.info("Creating target variable from loan_status")
        
        # Define default statuses
        default_statuses = [
            'Charged Off',
            'Default',
            'Late (31-120 days)',
            'Late (16-30 days)',
            'In Grace Period'
        ]
        
        # Create binary target
        df['target_default'] = df['loan_status'].apply(
            lambda x: 1 if x in default_statuses else 0
        )
        
        # Log class distribution
        class_counts = df['target_default'].value_counts()
        logger.info(f"Class distribution: {class_counts}")
        logger.info(f"Default rate: {class_counts[1] / len(df):.3f}")
        
        return df
    
    def select_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Select and rename features for modeling."""
        logger.info("Selecting features for modeling")
        
        # Feature mapping from loan data to our schema
        feature_mapping = {
            # Core features we can collect at application time
            'fico_range_high': 'fico_score',
            'annual_inc': 'annual_income', 
            'dti': 'debt_to_income_ratio',
            'revol_util': 'revolving_utilization',
            'open_acc': 'open_credit_lines',
            'delinq_2yrs': 'delinquencies_2yrs',
            'loan_amnt': 'loan_amount',
            'emp_length': 'employment_length',
            'term': 'term_length',
            'target_default': 'target_default'
        }
        
        # Select available features
        available_features = [col for col in feature_mapping.keys() if col in df.columns]
        logger.info(f"Available features: {available_features}")
        
        # Create feature dataframe
        feature_df = df[available_features].copy()
        
        # Rename columns
        feature_df = feature_df.rename(columns=feature_mapping)
        
        # Add derived features
        feature_df = self._add_derived_features(feature_df, df)
        
        # Store feature names
        self.feature_names = [col for col in feature_df.columns if col != 'target_default']
        
        logger.info(f"Selected {len(self.feature_names)} features: {self.feature_names}")
        
        return feature_df
    
    def _add_derived_features(self, feature_df: pd.DataFrame, original_df: pd.DataFrame) -> pd.DataFrame:
        """Add derived features that enhance model performance."""
        
        # Convert employment_length to numeric
        if 'employment_length' in feature_df.columns:
            feature_df['employment_length'] = self._convert_employment_length(feature_df['employment_length'])
        
        # Convert term_length to numeric
        if 'term_length' in feature_df.columns:
            feature_df['term_length'] = self._convert_term_length(feature_df['term_length'])
        
        # Add age if not present (derive from earliest_cr_line if available)
        if 'age' not in feature_df.columns and 'earliest_cr_line' in original_df.columns:
            # This is a simplified age calculation - in practice you'd use more sophisticated logic
            feature_df['age'] = 35  # Default age for now
        
        # Add dependents if not present (default to 0)
        if 'dependents' not in feature_df.columns:
            feature_df['dependents'] = 0
        
        # Add monthly income if annual income is available
        if 'annual_income' in feature_df.columns:
            feature_df['monthly_income'] = feature_df['annual_income'] / 12
        
        # Add loan-to-income ratio if both available (handle division by zero)
        if 'loan_amount' in feature_df.columns and 'annual_income' in feature_df.columns:
            # Replace zeros and very small values to avoid division by zero
            annual_income_safe = feature_df['annual_income'].replace(0, np.nan)
            feature_df['loan_to_income_ratio'] = feature_df['loan_amount'] / annual_income_safe
            # Fill infinite values with median
            feature_df['loan_to_income_ratio'] = feature_df['loan_to_income_ratio'].replace([np.inf, -np.inf], np.nan)
        
        # Add credit utilization categories
        if 'revolving_utilization' in feature_df.columns:
            feature_df['high_utilization'] = (feature_df['revolving_utilization'] > 0.8).astype(int)
        
        return feature_df
    
    def _convert_employment_length(self, emp_length_series: pd.Series) -> pd.Series:
        """Convert employment length strings to numeric values."""
        def convert_to_years(emp_str):
            if pd.isna(emp_str):
                return 5.0  # Default to 5 years
            
            emp_str = str(emp_str).lower()
            
            if 'n/a' in emp_str or 'nan' in emp_str:
                return 5.0
            elif '< 1 year' in emp_str:
                return 0.5
            elif '1 year' in emp_str:
                return 1.0
            elif '2 years' in emp_str:
                return 2.0
            elif '3 years' in emp_str:
                return 3.0
            elif '4 years' in emp_str:
                return 4.0
            elif '5 years' in emp_str:
                return 5.0
            elif '6 years' in emp_str:
                return 6.0
            elif '7 years' in emp_str:
                return 7.0
            elif '8 years' in emp_str:
                return 8.0
            elif '9 years' in emp_str:
                return 9.0
            elif '10+ years' in emp_str:
                return 10.0
            else:
                # Try to extract number
                import re
                numbers = re.findall(r'\d+', emp_str)
                if numbers:
                    return float(numbers[0])
                else:
                    return 5.0  # Default
        
        return emp_length_series.apply(convert_to_years)
    
    def _convert_term_length(self, term_series: pd.Series) -> pd.Series:
        """Convert term length strings to numeric values (months)."""
        def convert_to_months(term_str):
            if pd.isna(term_str):
                return 36.0  # Default to 36 months
            
            term_str = str(term_str).lower().strip()
            
            if 'months' in term_str:
                # Extract number before "months"
                import re
                numbers = re.findall(r'\d+', term_str)
                if numbers:
                    return float(numbers[0])
            elif 'years' in term_str:
                # Convert years to months
                import re
                numbers = re.findall(r'\d+', term_str)
                if numbers:
                    return float(numbers[0]) * 12
            
            # Try to extract any number
            import re
            numbers = re.findall(r'\d+', term_str)
            if numbers:
                return float(numbers[0])
            else:
                return 36.0  # Default to 36 months
        
        return term_series.apply(convert_to_months)
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate the dataset."""
        logger.info("Cleaning dataset")
        
        initial_size = len(df)
        
        # Remove rows with missing target
        df = df.dropna(subset=['target_default'])
        
        # Remove extreme outliers
        if 'annual_income' in df.columns:
            # Remove income outliers (beyond 99th percentile)
            income_99th = df['annual_income'].quantile(0.99)
            df = df[df['annual_income'] <= income_99th]
        
        if 'fico_score' in df.columns:
            # Remove invalid FICO scores
            df = df[(df['fico_score'] >= 300) & (df['fico_score'] <= 850)]
        
        # Remove negative values where they don't make sense
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col not in ['target_default', 'debt_to_income_ratio', 'revolving_utilization']:
                df = df[df[col] >= 0]
        
        # Remove infinite values
        df = df.replace([np.inf, -np.inf], np.nan)
        
        final_size = len(df)
        logger.info(f"Cleaned dataset: {initial_size} -> {final_size} rows")
        
        return df
    
    def preprocess_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Preprocess features for modeling."""
        logger.info("Preprocessing features")
        
        # Separate features and target
        if 'target_default' in df.columns:
            X = df.drop('target_default', axis=1)
            y = df['target_default']
        else:
            X = df
        
        # Handle missing values
        X_imputed = pd.DataFrame(
            self.imputer.fit_transform(X) if fit else self.imputer.transform(X),
            columns=X.columns,
            index=X.index
        )
        
        # Scale numerical features
        X_scaled = pd.DataFrame(
            self.scaler.fit_transform(X_imputed) if fit else self.scaler.transform(X_imputed),
            columns=X_imputed.columns,
            index=X_imputed.index
        )
        
        # Add target back if it exists
        if 'target_default' in df.columns:
            X_scaled['target_default'] = y
        
        return X_scaled
    
    def split_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Split data into train, validation, and test sets."""
        from sklearn.model_selection import train_test_split
        
        logger.info("Splitting data into train/validation/test sets")
        
        # First split: train+val vs test
        train_val, test = train_test_split(
            df, 
            test_size=TEST_SIZE, 
            random_state=RANDOM_STATE,
            stratify=df['target_default']
        )
        
        # Second split: train vs validation
        train, val = train_test_split(
            train_val,
            test_size=VALIDATION_SIZE,
            random_state=RANDOM_STATE,
            stratify=train_val['target_default']
        )
        
        logger.info(f"Train: {len(train)}, Validation: {len(val)}, Test: {len(test)}")
        
        return train, val, test
    
    def save_preprocessing_artifacts(self):
        """Save preprocessing artifacts for inference."""
        logger.info("Saving preprocessing artifacts")
        
        # Ensure artifacts directory exists
        ARTIFACTS_ROOT.mkdir(exist_ok=True)
        
        # Save scaler
        joblib.dump(self.scaler, ARTIFACTS_ROOT / "scaler.pkl")
        
        # Save imputer
        joblib.dump(self.imputer, ARTIFACTS_ROOT / "imputer.pkl")
        
        # Save feature names
        import json
        with open(ARTIFACTS_ROOT / "feature_list.json", 'w') as f:
            json.dump(self.feature_names, f)
        
        logger.info("Preprocessing artifacts saved")
    
    def load_preprocessing_artifacts(self):
        """Load preprocessing artifacts for inference."""
        logger.info("Loading preprocessing artifacts")
        
        # Load scaler
        self.scaler = joblib.load(ARTIFACTS_ROOT / "scaler.pkl")
        
        # Load imputer
        self.imputer = joblib.load(ARTIFACTS_ROOT / "imputer.pkl")
        
        # Load feature names
        import json
        with open(ARTIFACTS_ROOT / "feature_list.json", 'r') as f:
            self.feature_names = json.load(f)
        
        logger.info("Preprocessing artifacts loaded")


def load_and_preprocess_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Main function to load and preprocess data."""
    
    loader = CreditDataLoader()
    
    # Load data
    df = loader.load_loan_data()
    
    # Create target variable
    df = loader.create_target_variable(df)
    
    # Select features
    df = loader.select_features(df)
    
    # Clean data
    df = loader.clean_data(df)
    
    # Preprocess features
    df = loader.preprocess_features(df, fit=True)
    
    # Split data
    train, val, test = loader.split_data(df)
    
    # Save preprocessing artifacts
    loader.save_preprocessing_artifacts()
    
    return train, val, test
