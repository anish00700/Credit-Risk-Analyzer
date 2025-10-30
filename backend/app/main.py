"""
FastAPI application for credit risk assessment.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import Dict, Any
import numpy as np

from .config import API_TITLE, API_DESCRIPTION, API_VERSION, CORS_ORIGINS
from .schemas import (
    ApplicantRequest, 
    PredictionResponse, 
    HealthResponse, 
    ErrorResponse,
    ModelSchemaResponse
)
from .preprocessing import Preprocessor
from .inference import SHAPExplainer
from .utils import (
    load_model_artifacts, 
    validate_applicant_data, 
    format_prediction_response,
    get_model_schema
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model artifacts
model_artifacts = None
preprocessor = None
shap_explainer = None


@app.on_event("startup")
async def startup_event():
    """Load model artifacts on startup."""
    global model_artifacts, preprocessor, shap_explainer
    
    try:
        logger.info("Loading model artifacts...")
        
        # Load model artifacts
        model_artifacts = load_model_artifacts()
        
        # Initialize preprocessor
        preprocessor = Preprocessor()
        preprocessor.load_artifacts()
        
        # Initialize SHAP explainer
        shap_explainer = SHAPExplainer()
        shap_explainer.load_model_and_setup(
            model_artifacts['model'],
            model_artifacts['feature_names']
        )
        
        logger.info("Model artifacts loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load model artifacts: {e}")
        raise


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    
    model_loaded = model_artifacts is not None and preprocessor is not None
    
    return HealthResponse(
        status="ok",
        model_loaded=model_loaded,
        version=API_VERSION
    )


@app.post("/api/predict", response_model=PredictionResponse)
async def predict_credit_risk(applicant: ApplicantRequest):
    """Predict credit risk for an applicant."""
    
    try:
        # Validate input data
        validation_errors = validate_applicant_data(applicant.dict())
        if validation_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Validation errors: {', '.join(validation_errors)}"
            )
        
        # Convert to dictionary
        applicant_data = applicant.dict()
        
        # Preprocess data
        X = preprocessor.transform_applicant_data(applicant_data)
        
        # Make prediction
        model = model_artifacts['model']
        
        if hasattr(model, 'predict_proba'):
            probability = model.predict_proba(X)[0, 1]
        else:
            probability = model.predict(X)[0]
        
        # Get SHAP explanations
        risk_factors = shap_explainer.get_top_risk_factors(X, top_n=5)
        
        # Format response
        response = format_prediction_response(probability, risk_factors)
        
        logger.info(f"Prediction completed: {probability:.3f} probability, {response['risk_label']} risk")
        
        return PredictionResponse(**response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/schema", response_model=ModelSchemaResponse)
async def get_model_schema():
    """Get model schema and feature definitions."""
    
    try:
        schema = get_model_schema()
        return ModelSchemaResponse(**schema)
        
    except Exception as e:
        logger.error(f"Schema error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving model schema: {str(e)}"
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with custom error format."""
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            status_code=exc.status_code
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    
    logger.error(f"Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc),
            status_code=500
        ).dict()
    )


if __name__ == "__main__":
    import uvicorn
    from .config import API_HOST, API_PORT
    
    uvicorn.run(
        "app.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=True,
        log_level="info"
    )
