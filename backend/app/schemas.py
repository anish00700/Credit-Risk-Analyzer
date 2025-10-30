"""
Pydantic schemas for API request/response models.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
import numpy as np


class ApplicantRequest(BaseModel):
    """Request schema for credit risk prediction."""
    
    age: int = Field(..., ge=18, le=100, description="Applicant age in years")
    annual_income: float = Field(..., gt=0, description="Annual income in USD")
    debt_to_income_ratio: float = Field(..., ge=0, le=1, description="Debt-to-income ratio (0-1)")
    revolving_utilization: float = Field(..., ge=0, le=1, description="Revolving credit utilization (0-1)")
    open_credit_lines: int = Field(..., ge=0, description="Number of open credit lines")
    delinquencies_2yrs: int = Field(..., ge=0, description="Number of delinquencies in past 2 years")
    dependents: int = Field(..., ge=0, le=10, description="Number of dependents")
    fico_score: int = Field(..., ge=300, le=850, description="FICO credit score")
    loan_amount: Optional[float] = Field(None, gt=0, description="Requested loan amount")
    employment_length: Optional[int] = Field(None, ge=0, le=50, description="Employment length in years")
    
    @validator('annual_income')
    def validate_income(cls, v):
        if v < 1000:  # Minimum reasonable income
            raise ValueError('Annual income must be at least $1,000')
        if v > 10000000:  # Maximum reasonable income
            raise ValueError('Annual income cannot exceed $10,000,000')
        return v
    
    @validator('loan_amount')
    def validate_loan_amount(cls, v):
        if v is not None and v < 100:
            raise ValueError('Loan amount must be at least $100')
        return v


class RiskFactor(BaseModel):
    """Schema for individual risk factor explanation."""
    
    feature: str = Field(..., description="Feature name")
    impact: float = Field(..., description="SHAP impact score")
    direction: str = Field(..., description="Direction: 'increases_risk' or 'decreases_risk'")
    human_readable_reason: str = Field(..., description="Human-readable explanation")


class PredictionResponse(BaseModel):
    """Response schema for credit risk prediction."""
    
    default_probability: float = Field(..., ge=0, le=1, description="Probability of default (0-1)")
    risk_label: str = Field(..., description="Risk tier: LOW, MEDIUM, or HIGH")
    top_factors: List[RiskFactor] = Field(..., description="Top risk factors with explanations")
    model_version: str = Field(default="1.0", description="Model version used for prediction")


class HealthResponse(BaseModel):
    """Response schema for health check endpoint."""
    
    status: str = Field(default="ok", description="Service status")
    model_loaded: bool = Field(..., description="Whether model is loaded and ready")
    version: str = Field(default="1.0", description="API version")


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    status_code: int = Field(..., description="HTTP status code")


class ModelSchemaResponse(BaseModel):
    """Response schema for model schema endpoint."""
    
    features: Dict[str, Dict[str, Any]] = Field(..., description="Feature definitions and constraints")
    risk_thresholds: Dict[str, float] = Field(..., description="Risk tier thresholds")
    model_info: Dict[str, Any] = Field(..., description="Model metadata")
