"""
SHAP explainability and risk factor analysis.
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
import logging
import shap
import joblib
from pathlib import Path

from .config import ARTIFACTS_ROOT

logger = logging.getLogger(__name__)


class SHAPExplainer:
    """Handles SHAP-based explainability for credit risk predictions."""
    
    def __init__(self):
        self.explainer = None
        self.feature_names = []
        self.feature_descriptions = {}
        self.model = None
        
    def load_model_and_setup(self, model, feature_names: List[str]):
        """Load model and setup SHAP explainer."""
        
        self.model = model
        self.feature_names = feature_names
        
        # Setup SHAP explainer based on model type
        if hasattr(model, 'predict_proba'):
            # Tree-based models (XGBoost, CatBoost)
            self.explainer = shap.TreeExplainer(model)
        elif hasattr(model, 'predict'):
            # LightGBM
            self.explainer = shap.TreeExplainer(model)
        else:
            logger.warning("Unknown model type, using default explainer")
            self.explainer = shap.Explainer(model)
        
        # Setup feature descriptions
        self._setup_feature_descriptions()
        
        logger.info("SHAP explainer setup completed")
    
    def _setup_feature_descriptions(self):
        """Setup human-readable feature descriptions."""
        
        self.feature_descriptions = {
            'age': 'Applicant age',
            'annual_income': 'Annual income',
            'monthly_income': 'Monthly income',
            'debt_to_income_ratio': 'Debt-to-income ratio',
            'revolving_utilization': 'Revolving credit utilization',
            'open_credit_lines': 'Number of open credit lines',
            'delinquencies_2yrs': 'Delinquencies in past 2 years',
            'dependents': 'Number of dependents',
            'fico_score': 'FICO credit score (CIBIL)',
            'loan_amount': 'Requested loan amount',
            'employment_length': 'Employment length in years',
            'term_length': 'Loan term length',
            'loan_to_income_ratio': 'Loan-to-income ratio',
            'high_utilization': 'High credit utilization flag'
        }
    
    def explain_prediction(self, X: np.ndarray) -> Dict[str, Any]:
        """Generate SHAP explanation for a single prediction."""
        
        if self.explainer is None:
            raise ValueError("Explainer not initialized. Call load_model_and_setup first.")
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X)
        
        # Handle different SHAP output formats
        if isinstance(shap_values, list):
            # Binary classification - use positive class
            shap_values = shap_values[1]
        
        # Get prediction
        if hasattr(self.model, 'predict_proba'):
            prediction = self.model.predict_proba(X)[0, 1]
        else:
            prediction = self.model.predict(X)[0]
        
        # Create feature impact analysis
        feature_impacts = self._analyze_feature_impacts(shap_values[0])
        
        return {
            'prediction': prediction,
            'shap_values': shap_values[0].tolist(),
            'feature_impacts': feature_impacts
        }
    
    def _analyze_feature_impacts(self, shap_values: np.ndarray) -> List[Dict[str, Any]]:
        """Analyze feature impacts and create human-readable explanations."""
        
        # Create feature impact pairs
        impacts = []
        for i, (feature, impact) in enumerate(zip(self.feature_names, shap_values)):
            
            # Determine direction
            direction = "increases_risk" if impact > 0 else "decreases_risk"
            
            # Create human-readable explanation
            explanation = self._create_explanation(feature, impact, direction)
            
            impacts.append({
                'feature': feature,
                'impact': float(abs(impact)),
                'direction': direction,
                'human_readable_reason': explanation
            })
        
        # Sort by absolute impact
        impacts.sort(key=lambda x: x['impact'], reverse=True)
        
        return impacts
    
    def _create_explanation(self, feature: str, impact: float, direction: str) -> str:
        """Create human-readable explanation for a feature impact."""
        
        feature_desc = self.feature_descriptions.get(feature, feature)
        
        explanations = {
            'age': {
                'increases_risk': "Higher age may indicate approaching retirement or health concerns",
                'decreases_risk': "Younger age suggests longer earning potential and career growth"
            },
            'annual_income': {
                'increases_risk': "Lower income reduces ability to handle unexpected expenses",
                'decreases_risk': "Higher income provides better financial stability and repayment capacity"
            },
            'debt_to_income_ratio': {
                'increases_risk': "High debt-to-income ratio indicates financial strain and limited repayment capacity",
                'decreases_risk': "Low debt-to-income ratio shows good financial management and repayment ability"
            },
            'revolving_utilization': {
                'increases_risk': "High revolving utilization suggests heavy credit usage and potential financial stress",
                'decreases_risk': "Low revolving utilization indicates responsible credit management"
            },
            'open_credit_lines': {
                'increases_risk': "Many open credit lines may indicate overextension and difficulty managing multiple debts",
                'decreases_risk': "Fewer credit lines suggest focused borrowing and easier debt management"
            },
            'delinquencies_2yrs': {
                'increases_risk': "Recent delinquencies indicate difficulty meeting financial obligations",
                'decreases_risk': "No recent delinquencies show consistent payment history"
            },
            'dependents': {
                'increases_risk': "More dependents increase financial obligations and reduce disposable income",
                'decreases_risk': "Fewer dependents reduce financial burden and increase repayment capacity"
            },
            'fico_score': {
                'increases_risk': "Lower credit score indicates higher risk of default based on credit history",
                'decreases_risk': "Higher credit score reflects good credit management and lower default risk"
            },
            'loan_amount': {
                'increases_risk': "Larger loan amount increases repayment burden and default risk",
                'decreases_risk': "Smaller loan amount reduces repayment burden and default risk"
            },
            'employment_length': {
                'increases_risk': "Shorter employment history suggests job instability and income uncertainty",
                'decreases_risk': "Longer employment history indicates job stability and consistent income"
            }
        }
        
        # Get specific explanation or create generic one
        if feature in explanations and direction in explanations[feature]:
            return explanations[feature][direction]
        else:
            if direction == "increases_risk":
                return f"Higher {feature_desc.lower()} increases default risk"
            else:
                return f"Lower {feature_desc.lower()} decreases default risk"
    
    def get_top_risk_factors(self, X: np.ndarray, top_n: int = 5) -> List[Dict[str, Any]]:
        """Get top risk factors for a prediction."""
        
        explanation = self.explain_prediction(X)
        return explanation['feature_impacts'][:top_n]
