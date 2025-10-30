"""
Model evaluation utilities and metrics.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    roc_auc_score, 
    precision_score, 
    recall_score, 
    f1_score,
    confusion_matrix,
    classification_report,
    precision_recall_curve,
    roc_curve
)
from scipy import stats
import logging

logger = logging.getLogger(__name__)


def calculate_ks_statistic(y_true: np.ndarray, y_pred_proba: np.ndarray) -> float:
    """Calculate Kolmogorov-Smirnov statistic."""
    
    # Separate predictions by class
    good_scores = y_pred_proba[y_true == 0]
    bad_scores = y_pred_proba[y_true == 1]
    
    # Calculate KS statistic
    ks_stat, _ = stats.ks_2samp(good_scores, bad_scores)
    
    return ks_stat


def evaluate_model_performance(y_true: np.ndarray, y_pred: np.ndarray, 
                             y_pred_proba: np.ndarray) -> Dict[str, float]:
    """Calculate comprehensive model performance metrics."""
    
    metrics = {
        'auc': roc_auc_score(y_true, y_pred_proba),
        'precision': precision_score(y_true, y_pred),
        'recall': recall_score(y_true, y_pred),
        'f1': f1_score(y_true, y_pred),
        'ks_statistic': calculate_ks_statistic(y_true, y_pred_proba)
    }
    
    return metrics


def plot_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray, 
                         model_name: str, save_path: str = None):
    """Plot confusion matrix."""
    
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Good', 'Bad'], 
                yticklabels=['Good', 'Bad'])
    plt.title(f'Confusion Matrix - {model_name}')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_roc_curves(models_results: Dict[str, Dict], save_path: str = None):
    """Plot ROC curves for multiple models."""
    
    plt.figure(figsize=(10, 8))
    
    for model_name, results in models_results.items():
        fpr = results['fpr']
        tpr = results['tpr']
        auc = results['auc']
        
        plt.plot(fpr, tpr, label=f'{model_name} (AUC = {auc:.3f})')
    
    plt.plot([0, 1], [0, 1], 'k--', label='Random')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curves - Model Comparison')
    plt.legend()
    plt.grid(True)
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_precision_recall_curves(models_results: Dict[str, Dict], 
                                save_path: str = None):
    """Plot precision-recall curves for multiple models."""
    
    plt.figure(figsize=(10, 8))
    
    for model_name, results in models_results.items():
        precision = results['precision']
        recall = results['recall']
        
        plt.plot(recall, precision, label=f'{model_name}')
    
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curves - Model Comparison')
    plt.legend()
    plt.grid(True)
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def generate_evaluation_report(y_true: np.ndarray, y_pred: np.ndarray, 
                             y_pred_proba: np.ndarray, model_name: str) -> Dict[str, Any]:
    """Generate comprehensive evaluation report."""
    
    # Calculate metrics
    metrics = evaluate_model_performance(y_true, y_pred, y_pred_proba)
    
    # Classification report
    class_report = classification_report(y_true, y_pred, output_dict=True)
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # ROC curve
    fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
    
    # Precision-recall curve
    precision, recall, _ = precision_recall_curve(y_true, y_pred_proba)
    
    report = {
        'model_name': model_name,
        'metrics': metrics,
        'classification_report': class_report,
        'confusion_matrix': cm.tolist(),
        'roc_curve': {
            'fpr': fpr.tolist(),
            'tpr': tpr.tolist()
        },
        'precision_recall_curve': {
            'precision': precision.tolist(),
            'recall': recall.tolist()
        }
    }
    
    return report


def save_evaluation_results(results: Dict[str, Any], save_path: str):
    """Save evaluation results to JSON file."""
    
    import json
    
    with open(save_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Evaluation results saved to {save_path}")
