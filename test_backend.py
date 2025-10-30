#!/usr/bin/env python3
"""
Test script to verify the backend training pipeline works correctly.
"""
import sys
from pathlib import Path
import logging

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.append(str(backend_path))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_data_loading():
    """Test data loading functionality."""
    logger.info("Testing data loading...")
    
    try:
        from training.data_loader import CreditDataLoader
        
        loader = CreditDataLoader()
        
        # Test loading a small sample
        logger.info("Loading loan data...")
        df = loader.load_loan_data()
        logger.info(f"Loaded {len(df)} records")
        
        # Test target creation
        logger.info("Creating target variable...")
        df = loader.create_target_variable(df)
        logger.info(f"Target distribution: {df['target_default'].value_counts()}")
        
        # Test feature selection
        logger.info("Selecting features...")
        df = loader.select_features(df)
        logger.info(f"Selected {len(df.columns)} features")
        
        # Test data cleaning
        logger.info("Cleaning data...")
        df = loader.clean_data(df)
        logger.info(f"Cleaned data shape: {df.shape}")
        
        logger.info("✅ Data loading test passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Data loading test failed: {e}")
        return False

def test_model_training():
    """Test model training with a small sample."""
    logger.info("Testing model training...")
    
    try:
        import pandas as pd
        import numpy as np
        from training.train_model import ModelTrainer
        
        # Create synthetic data for testing
        logger.info("Creating synthetic test data...")
        np.random.seed(42)
        n_samples = 1000
        
        X_train = pd.DataFrame({
            'age': np.random.randint(18, 80, n_samples),
            'annual_income': np.random.uniform(20000, 150000, n_samples),
            'debt_to_income_ratio': np.random.uniform(0, 0.8, n_samples),
            'revolving_utilization': np.random.uniform(0, 1, n_samples),
            'open_credit_lines': np.random.randint(0, 20, n_samples),
            'delinquencies_2yrs': np.random.randint(0, 5, n_samples),
            'dependents': np.random.randint(0, 5, n_samples),
            'fico_score': np.random.randint(300, 850, n_samples),
            'loan_amount': np.random.uniform(1000, 50000, n_samples),
            'employment_length': np.random.randint(0, 30, n_samples),
            'monthly_income': np.random.uniform(2000, 12000, n_samples),
            'loan_to_income_ratio': np.random.uniform(0.1, 0.5, n_samples),
            'high_utilization': np.random.randint(0, 2, n_samples)
        })
        
        # Create synthetic target
        y_train = np.random.randint(0, 2, n_samples)
        
        # Split into train/val
        from sklearn.model_selection import train_test_split
        X_tr, X_val, y_tr, y_val = train_test_split(
            X_train, y_train, test_size=0.2, random_state=42
        )
        
        # Test model training
        trainer = ModelTrainer()
        models = trainer.train_models(X_tr, y_tr, X_val, y_val)
        logger.info(f"Trained {len(models)} models")
        
        # Test evaluation
        results = trainer.evaluate_models(X_val, y_val)
        logger.info(f"Model evaluation results: {results}")
        
        # Test model selection
        best_model = trainer.select_best_model(results)
        logger.info(f"Best model: {best_model}")
        
        logger.info("✅ Model training test passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Model training test failed: {e}")
        return False

def test_api_schemas():
    """Test API schema definitions."""
    logger.info("Testing API schemas...")
    
    try:
        from app.schemas import ApplicantRequest, PredictionResponse, HealthResponse
        
        # Test applicant request schema
        applicant_data = {
            "age": 35,
            "annual_income": 75000,
            "debt_to_income_ratio": 0.3,
            "revolving_utilization": 0.4,
            "open_credit_lines": 5,
            "delinquencies_2yrs": 0,
            "dependents": 1,
            "fico_score": 720
        }
        
        applicant = ApplicantRequest(**applicant_data)
        logger.info(f"Created applicant request: {applicant.age} years old")
        
        # Test prediction response schema
        prediction_data = {
            "default_probability": 0.15,
            "risk_label": "LOW",
            "top_factors": [
                {
                    "feature": "fico_score",
                    "impact": 0.08,
                    "direction": "decreases_risk",
                    "human_readable_reason": "Higher credit score reflects good credit management"
                }
            ]
        }
        
        prediction = PredictionResponse(**prediction_data)
        logger.info(f"Created prediction response: {prediction.risk_label} risk")
        
        # Test health response schema
        health = HealthResponse(status="ok", model_loaded=True)
        logger.info(f"Created health response: {health.status}")
        
        logger.info("✅ API schemas test passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ API schemas test failed: {e}")
        return False

def main():
    """Run all tests."""
    logger.info("Starting backend tests...")
    
    tests = [
        ("Data Loading", test_data_loading),
        ("Model Training", test_model_training),
        ("API Schemas", test_api_schemas)
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running {test_name} Test")
        logger.info(f"{'='*50}")
        
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    logger.info(f"\n{'='*50}")
    logger.info("TEST SUMMARY")
    logger.info(f"{'='*50}")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
        if result:
            passed += 1
    
    logger.info(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        logger.info("🎉 All tests passed! Backend is ready.")
    else:
        logger.error("⚠️  Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main()
