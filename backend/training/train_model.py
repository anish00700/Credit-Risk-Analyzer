"""
Model training pipeline for credit risk assessment.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List
import logging
import joblib
from pathlib import Path
from sklearn.metrics import (
    roc_auc_score, 
    classification_report, 
    confusion_matrix,
    precision_recall_curve,
    roc_curve,
    precision_score,
    recall_score,
    f1_score
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
import matplotlib.pyplot as plt
import seaborn as sns

# Import models
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostClassifier

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.config import (
    MODEL_PARAMS, 
    RANDOM_STATE, 
    ARTIFACTS_ROOT,
    MODEL_PATH
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelTrainer:
    """Handles training and evaluation of credit risk models."""
    
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.best_model_name = None
        self.feature_importance = {}
        
    def train_models(self, X_train: pd.DataFrame, y_train: pd.Series, 
                    X_val: pd.DataFrame, y_val: pd.Series) -> Dict[str, Any]:
        """Train multiple models and select the best one."""
        
        logger.info("Training multiple models")
        
        # Calculate class weights for imbalanced data
        class_counts = y_train.value_counts()
        scale_pos_weight = class_counts[0] / class_counts[1]
        
        logger.info(f"Class distribution: {class_counts}")
        logger.info(f"Scale pos weight: {scale_pos_weight:.3f}")
        
        # Update model parameters with class weights
        params = MODEL_PARAMS.copy()
        params['xgboost']['scale_pos_weight'] = scale_pos_weight
        params['catboost']['class_weights'] = [1, scale_pos_weight]
        
        # Train LightGBM
        logger.info("Training LightGBM...")
        lgb_train = lgb.Dataset(X_train, label=y_train)
        lgb_val = lgb.Dataset(X_val, label=y_val, reference=lgb_train)
        
        lgb_model = lgb.train(
            params['lightgbm'],
            lgb_train,
            valid_sets=[lgb_val],
            num_boost_round=1000,
            callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
        )
        
        # Train XGBoost
        logger.info("Training XGBoost...")
        xgb_model = xgb.XGBClassifier(**params['xgboost'])
        xgb_model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        
        # Train CatBoost
        logger.info("Training CatBoost...")
        cat_model = CatBoostClassifier(**params['catboost'])
        cat_model.fit(
            X_train, y_train,
            eval_set=(X_val, y_val),
            early_stopping_rounds=100,
            verbose=False
        )
        
        # Store models
        self.models = {
            'lightgbm': lgb_model,
            'xgboost': xgb_model,
            'catboost': cat_model
        }
        
        return self.models
    
    def evaluate_models(self, X_val: pd.DataFrame, y_val: pd.Series) -> Dict[str, Dict[str, float]]:
        """Evaluate all trained models."""
        
        logger.info("Evaluating models")
        
        results = {}
        
        for name, model in self.models.items():
            logger.info(f"Evaluating {name}")
            
            # Get predictions
            if name == 'lightgbm':
                y_pred_proba = model.predict(X_val)
            else:
                y_pred_proba = model.predict_proba(X_val)[:, 1]
            
            y_pred = (y_pred_proba > 0.5).astype(int)
            
            # Calculate metrics
            auc = roc_auc_score(y_val, y_pred_proba)
            precision = precision_score(y_val, y_pred)
            recall = recall_score(y_val, y_pred)
            f1 = f1_score(y_val, y_pred)
            
            # Calculate KS statistic
            ks_stat = self._calculate_ks_statistic(y_val, y_pred_proba)
            
            results[name] = {
                'auc': auc,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'ks_statistic': ks_stat
            }
            
            logger.info(f"{name} - AUC: {auc:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")
        
        return results
    
    def _calculate_ks_statistic(self, y_true: pd.Series, y_pred_proba: pd.Series) -> float:
        """Calculate Kolmogorov-Smirnov statistic."""
        from scipy import stats
        
        # Separate predictions by class
        good_scores = y_pred_proba[y_true == 0]
        bad_scores = y_pred_proba[y_true == 1]
        
        # Calculate KS statistic
        ks_stat, _ = stats.ks_2samp(good_scores, bad_scores)
        
        return ks_stat
    
    def select_best_model(self, results: Dict[str, Dict[str, float]]) -> str:
        """Select the best model based on AUC and recall."""
        
        logger.info("Selecting best model")
        
        # Score models based on AUC and recall
        model_scores = {}
        for name, metrics in results.items():
            # Weight AUC more heavily, but also consider recall for default detection
            score = 0.7 * metrics['auc'] + 0.3 * metrics['recall']
            model_scores[name] = score
        
        # Select best model
        best_model_name = max(model_scores, key=model_scores.get)
        self.best_model = self.models[best_model_name]
        self.best_model_name = best_model_name
        
        logger.info(f"Best model: {best_model_name} (score: {model_scores[best_model_name]:.4f})")
        
        return best_model_name
    
    def save_model(self):
        """Save the best model and metadata."""
        
        logger.info(f"Saving best model: {self.best_model_name}")
        
        # Ensure artifacts directory exists
        ARTIFACTS_ROOT.mkdir(exist_ok=True)
        
        # Save model
        joblib.dump(self.best_model, MODEL_PATH)
        
        # Save model metadata
        metadata = {
            'model_name': self.best_model_name,
            'model_type': type(self.best_model).__name__,
            'feature_importance': self._get_feature_importance(),
            'training_date': pd.Timestamp.now().isoformat()
        }
        
        import json
        with open(ARTIFACTS_ROOT / "model_metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info("Model saved successfully")
    
    def _get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from the best model."""
        
        if self.best_model_name == 'lightgbm':
            importance = self.best_model.feature_importance(importance_type='gain')
            feature_names = self.best_model.feature_name()
        elif self.best_model_name == 'xgboost':
            importance = self.best_model.feature_importances_
            feature_names = self.best_model.get_booster().feature_names
        elif self.best_model_name == 'catboost':
            importance = self.best_model.feature_importances_
            feature_names = self.best_model.feature_names_
        else:
            return {}
        
        # Create feature importance dictionary
        feature_importance = dict(zip(feature_names, importance))
        
        # Sort by importance
        feature_importance = dict(sorted(feature_importance.items(), 
                                       key=lambda x: x[1], reverse=True))
        
        return feature_importance
    
    def generate_evaluation_report(self, X_test: pd.DataFrame, y_test: pd.Series, 
                                  results: Dict[str, Dict[str, float]]):
        """Generate comprehensive evaluation report."""
        
        logger.info("Generating evaluation report")
        
        # Create plots directory
        plots_dir = ARTIFACTS_ROOT / "plots"
        plots_dir.mkdir(exist_ok=True)
        
        # Plot ROC curves for all models
        plt.figure(figsize=(10, 8))
        for name, model in self.models.items():
            if name == 'lightgbm':
                y_pred_proba = model.predict(X_test)
            else:
                y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
            auc = results[name]['auc']
            
            plt.plot(fpr, tpr, label=f'{name} (AUC = {auc:.3f})')
        
        plt.plot([0, 1], [0, 1], 'k--', label='Random')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curves - Model Comparison')
        plt.legend()
        plt.grid(True)
        plt.savefig(plots_dir / "roc_curves.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # Plot feature importance for best model
        if self.best_model_name:
            feature_importance = self._get_feature_importance()
            
            plt.figure(figsize=(12, 8))
            features = list(feature_importance.keys())[:15]  # Top 15 features
            importance_values = [feature_importance[f] for f in features]
            
            plt.barh(features, importance_values)
            plt.xlabel('Feature Importance')
            plt.title(f'Top 15 Feature Importance - {self.best_model_name.title()}')
            plt.gca().invert_yaxis()
            plt.tight_layout()
            plt.savefig(plots_dir / "feature_importance.png", dpi=300, bbox_inches='tight')
            plt.close()
        
        # Save detailed results
        results_df = pd.DataFrame(results).T
        results_df.to_csv(ARTIFACTS_ROOT / "model_evaluation_results.csv")
        
        logger.info("Evaluation report generated")


def train_credit_risk_model():
    """Main function to train the credit risk model."""
    
    logger.info("Starting credit risk model training")
    
    # Import data loader
    from .data_loader import load_and_preprocess_data
    
    # Load and preprocess data
    train, val, test = load_and_preprocess_data()
    
    # Prepare features and target
    X_train = train.drop('target_default', axis=1)
    y_train = train['target_default']
    X_val = val.drop('target_default', axis=1)
    y_val = val['target_default']
    X_test = test.drop('target_default', axis=1)
    y_test = test['target_default']
    
    logger.info(f"Training data shape: {X_train.shape}")
    logger.info(f"Validation data shape: {X_val.shape}")
    logger.info(f"Test data shape: {X_test.shape}")
    
    # Train models
    trainer = ModelTrainer()
    models = trainer.train_models(X_train, y_train, X_val, y_val)
    
    # Evaluate models
    results = trainer.evaluate_models(X_val, y_val)
    
    # Select best model
    best_model_name = trainer.select_best_model(results)
    
    # Generate evaluation report
    trainer.generate_evaluation_report(X_test, y_test, results)
    
    # Save best model
    trainer.save_model()
    
    logger.info("Model training completed successfully")
    
    return trainer, results


if __name__ == "__main__":
    train_credit_risk_model()
