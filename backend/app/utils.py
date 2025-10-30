"""
Utility functions for the credit risk API.
"""
import logging
import json
from typing import Dict, Any, List
from pathlib import Path
import joblib

from .config import ARTIFACTS_ROOT, RISK_THRESHOLDS

logger = logging.getLogger(__name__)


def load_model_artifacts() -> Dict[str, Any]:
    """Load all model artifacts for inference."""
    
    artifacts = {}
    
    try:
        # Load model
        artifacts['model'] = joblib.load(ARTIFACTS_ROOT / "model.pkl")
        
        # Load preprocessing artifacts
        artifacts['scaler'] = joblib.load(ARTIFACTS_ROOT / "scaler.pkl")
        artifacts['imputer'] = joblib.load(ARTIFACTS_ROOT / "imputer.pkl")
        
        # Load feature names
        with open(ARTIFACTS_ROOT / "feature_list.json", 'r') as f:
            artifacts['feature_names'] = json.load(f)
        
        # Load model metadata
        try:
            with open(ARTIFACTS_ROOT / "model_metadata.json", 'r') as f:
                artifacts['metadata'] = json.load(f)
        except FileNotFoundError:
            artifacts['metadata'] = {'model_name': 'unknown', 'model_type': 'unknown'}
        
        logger.info("Model artifacts loaded successfully")
        
    except Exception as e:
        logger.error(f"Error loading model artifacts: {e}")
        raise
    
    return artifacts


def determine_risk_tier(probability: float) -> str:
    """Determine risk tier based on default probability."""
    
    if probability < RISK_THRESHOLDS['LOW']:
        return "LOW"
    elif probability < RISK_THRESHOLDS['MEDIUM']:
        return "MEDIUM"
    else:
        return "HIGH"


def validate_applicant_data(data: Dict[str, Any]) -> List[str]:
    """Validate applicant data and return list of errors."""
    
    errors = []
    
    # Required fields
    required_fields = [
        'age', 'annual_income', 'debt_to_income_ratio', 
        'revolving_utilization', 'open_credit_lines', 
        'delinquencies_2yrs', 'dependents', 'fico_score'
    ]
    
    for field in required_fields:
        if field not in data or data[field] is None:
            errors.append(f"Missing required field: {field}")
    
    # Validate ranges
    if 'age' in data:
        if not (18 <= data['age'] <= 100):
            errors.append("Age must be between 18 and 100")
    
    if 'annual_income' in data:
        if data['annual_income'] <= 0:
            errors.append("Annual income must be positive")
        elif data['annual_income'] > 10000000:
            errors.append("Annual income cannot exceed $10,000,000")
    
    if 'debt_to_income_ratio' in data:
        if not (0 <= data['debt_to_income_ratio'] <= 1):
            errors.append("Debt-to-income ratio must be between 0 and 1")
    
    if 'revolving_utilization' in data:
        if not (0 <= data['revolving_utilization'] <= 1):
            errors.append("Revolving utilization must be between 0 and 1")
    
    if 'fico_score' in data:
        if not (300 <= data['fico_score'] <= 850):
            errors.append("FICO score must be between 300 and 850")
    
    if 'open_credit_lines' in data:
        if data['open_credit_lines'] < 0:
            errors.append("Number of open credit lines cannot be negative")
    
    if 'delinquencies_2yrs' in data:
        if data['delinquencies_2yrs'] < 0:
            errors.append("Number of delinquencies cannot be negative")
    
    if 'dependents' in data:
        if not (0 <= data['dependents'] <= 10):
            errors.append("Number of dependents must be between 0 and 10")
    
    return errors


def format_prediction_response(probability: float, risk_factors: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Format prediction response according to API schema."""
    
    risk_tier = determine_risk_tier(probability)
    
    # Format risk factors
    formatted_factors = []
    for factor in risk_factors:
        formatted_factors.append({
            'feature': factor['feature'],
            'impact': factor['impact'],
            'direction': factor['direction'],
            'human_readable_reason': factor['human_readable_reason']
        })
    
    return {
        'default_probability': float(probability),
        'risk_label': risk_tier,
        'top_factors': formatted_factors,
        'model_version': '1.0'
    }


def get_model_schema() -> Dict[str, Any]:
    """Get model schema information."""
    
    try:
        # Load feature names
        with open(ARTIFACTS_ROOT / "feature_list.json", 'r') as f:
            feature_names = json.load(f)
        
        # Load model metadata
        try:
            with open(ARTIFACTS_ROOT / "model_metadata.json", 'r') as f:
                metadata = json.load(f)
        except FileNotFoundError:
            metadata = {'model_name': 'unknown', 'model_type': 'unknown'}
        
        # Define feature constraints
        feature_constraints = {
            'age': {'type': 'integer', 'min': 18, 'max': 100, 'description': 'Applicant age in years'},
            'annual_income': {'type': 'number', 'min': 1000, 'max': 10000000, 'description': 'Annual income in USD'},
            'debt_to_income_ratio': {'type': 'number', 'min': 0, 'max': 1, 'description': 'Debt-to-income ratio'},
            'revolving_utilization': {'type': 'number', 'min': 0, 'max': 1, 'description': 'Revolving credit utilization'},
            'open_credit_lines': {'type': 'integer', 'min': 0, 'description': 'Number of open credit lines'},
            'delinquencies_2yrs': {'type': 'integer', 'min': 0, 'description': 'Delinquencies in past 2 years'},
            'dependents': {'type': 'integer', 'min': 0, 'max': 10, 'description': 'Number of dependents'},
            'fico_score': {'type': 'integer', 'min': 300, 'max': 850, 'description': 'FICO credit score'},
            'loan_amount': {'type': 'number', 'min': 100, 'description': 'Requested loan amount (optional)'},
            'employment_length': {'type': 'integer', 'min': 0, 'max': 50, 'description': 'Employment length in years (optional)'}
        }
        
        # Filter constraints to only include features used by the model
        features = {k: v for k, v in feature_constraints.items() if k in feature_names}
        
        return {
            'features': features,
            'risk_thresholds': RISK_THRESHOLDS,
            'model_info': metadata
        }
        
    except Exception as e:
        logger.error(f"Error getting model schema: {e}")
        raise
