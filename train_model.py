#!/usr/bin/env python3
"""
Standalone script to train the credit risk model.
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

def main():
    """Train the credit risk model."""
    logger.info("🎯 Starting Credit Risk Model Training")
    logger.info("=" * 60)
    
    try:
        # Import training function
        from training.train_model import train_credit_risk_model
        
        # Run training
        logger.info("Loading and preprocessing data...")
        trainer, results = train_credit_risk_model()
        
        logger.info("=" * 60)
        logger.info("🎉 MODEL TRAINING COMPLETED SUCCESSFULLY!")
        logger.info("=" * 60)
        
        # Print results summary
        logger.info("Model Evaluation Results:")
        for model_name, metrics in results.items():
            logger.info(f"\n{model_name.upper()}:")
            logger.info(f"  AUC: {metrics['auc']:.4f}")
            logger.info(f"  Precision: {metrics['precision']:.4f}")
            logger.info(f"  Recall: {metrics['recall']:.4f}")
            logger.info(f"  F1 Score: {metrics['f1']:.4f}")
            logger.info(f"  KS Statistic: {metrics['ks_statistic']:.4f}")
        
        logger.info(f"\nBest Model: {trainer.best_model_name}")
        logger.info(f"Model saved to: backend/artifacts/model.pkl")
        logger.info(f"Preprocessing artifacts saved to: backend/artifacts/")
        
        logger.info("\n✅ Ready to start the API server!")
        logger.info("Run: python start_backend.py")
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        logger.error("Please check the error above and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
