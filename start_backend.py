#!/usr/bin/env python3
"""
Startup script for the Credit Risk Analyzer backend.
"""
import sys
import subprocess
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if required dependencies are installed."""
    logger.info("Checking dependencies...")
    
    required_packages = [
        'fastapi', 'uvicorn', 'pandas', 'numpy', 'sklearn',
        'lightgbm', 'xgboost', 'catboost', 'shap', 'pydantic'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            logger.info(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            logger.error(f"❌ {package}")
    
    if missing_packages:
        logger.error(f"Missing packages: {missing_packages}")
        logger.info("Install with: pip install -r backend/requirements.txt")
        return False
    
    logger.info("All dependencies are installed!")
    return True

def check_data_files():
    """Check if required data files exist."""
    logger.info("Checking data files...")
    
    data_dir = Path("data")
    required_files = [
        "loan_processed_data.csv",
        "homecreditdata/application_train.csv"
    ]
    
    missing_files = []
    
    for file_path in required_files:
        full_path = data_dir / file_path
        if full_path.exists():
            logger.info(f"✅ {file_path}")
        else:
            missing_files.append(file_path)
            logger.error(f"❌ {file_path}")
    
    if missing_files:
        logger.error(f"Missing data files: {missing_files}")
        logger.info("Please ensure the data files are in the data/ directory")
        return False
    
    logger.info("All data files found!")
    return True

def check_model_artifacts():
    """Check if model artifacts exist."""
    logger.info("Checking model artifacts...")
    
    artifacts_dir = Path("backend/artifacts")
    required_artifacts = [
        "model.pkl",
        "scaler.pkl",
        "imputer.pkl",
        "feature_list.json"
    ]
    
    missing_artifacts = []
    
    for artifact in required_artifacts:
        artifact_path = artifacts_dir / artifact
        if artifact_path.exists():
            logger.info(f"✅ {artifact}")
        else:
            missing_artifacts.append(artifact)
            logger.error(f"❌ {artifact}")
    
    if missing_artifacts:
        logger.warning(f"Missing model artifacts: {missing_artifacts}")
        logger.info("Run model training first: python -m backend.training.train_model")
        return False
    
    logger.info("Model artifacts found!")
    return True

def train_model():
    """Train the model if artifacts are missing."""
    logger.info("Training model...")
    
    try:
        # Change to backend directory
        backend_dir = Path("backend")
        
        # Run training script
        result = subprocess.run([
            sys.executable, "-m", "training.train_model"
        ], cwd=backend_dir, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("✅ Model training completed successfully!")
            return True
        else:
            logger.error(f"❌ Model training failed: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error during model training: {e}")
        return False

def start_api_server():
    """Start the FastAPI server."""
    logger.info("Starting API server...")
    
    try:
        # Change to backend directory
        backend_dir = Path("backend")
        
        # Start server
        subprocess.run([
            sys.executable, "-m", "app.main"
        ], cwd=backend_dir)
        
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Error starting server: {e}")

def main():
    """Main startup function."""
    logger.info("🚀 Starting Credit Risk Analyzer Backend")
    logger.info("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        logger.error("❌ Dependency check failed. Please install required packages.")
        return
    
    # Check data files
    if not check_data_files():
        logger.error("❌ Data files check failed. Please ensure data files are present.")
        return
    
    # Check model artifacts
    if not check_model_artifacts():
        logger.info("🔄 Model artifacts missing. Training model...")
        if not train_model():
            logger.error("❌ Model training failed. Cannot start server.")
            return
    
    # Start API server
    logger.info("🎉 All checks passed! Starting API server...")
    logger.info("API will be available at: http://localhost:8000")
    logger.info("API docs will be available at: http://localhost:8000/docs")
    logger.info("Press Ctrl+C to stop the server")
    logger.info("=" * 50)
    
    start_api_server()

if __name__ == "__main__":
    main()
