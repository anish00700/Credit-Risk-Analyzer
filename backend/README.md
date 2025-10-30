# Credit Risk Analyzer Backend

AI-powered credit risk assessment backend with explainable insights using SHAP values.

## Overview

This backend service provides:

- **Credit Risk Prediction**: Predicts default probability for loan applicants
- **SHAP Explainability**: Provides human-readable explanations for risk factors
- **REST API**: FastAPI-based service for frontend integration
- **Model Training Pipeline**: Automated model training and evaluation

## Features

- 🎯 **High Accuracy**: Gradient boosting models (LightGBM, XGBoost, CatBoost)
- 🔍 **Explainable AI**: SHAP-based feature attribution
- 📊 **Risk Tiers**: LOW, MEDIUM, HIGH risk classification
- 🚀 **Production Ready**: FastAPI with comprehensive error handling
- 📈 **Model Evaluation**: ROC AUC, precision, recall, F1-score metrics

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Train the Model

```bash
# Train model on loan data
python -m training.train_model
```

This will:
- Load and preprocess the loan data
- Train multiple models (LightGBM, XGBoost, CatBoost)
- Evaluate and select the best model
- Save model artifacts to `artifacts/` directory

### 3. Start the API Server

```bash
# Start FastAPI server
python -m app.main
```

The API will be available at `http://localhost:8000`

### 4. Test the API

```bash
# Health check
curl http://localhost:8000/api/health

# Get model schema
curl http://localhost:8000/api/schema

# Make a prediction
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "annual_income": 75000,
    "debt_to_income_ratio": 0.3,
    "revolving_utilization": 0.4,
    "open_credit_lines": 5,
    "delinquencies_2yrs": 0,
    "dependents": 1,
    "fico_score": 720
  }'
```

## API Endpoints

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "version": "1.0"
}
```

### POST /api/predict
Predict credit risk for an applicant.

**Request Body:**
```json
{
  "age": 35,
  "annual_income": 75000,
  "debt_to_income_ratio": 0.3,
  "revolving_utilization": 0.4,
  "open_credit_lines": 5,
  "delinquencies_2yrs": 0,
  "dependents": 1,
  "fico_score": 720,
  "loan_amount": 25000,
  "employment_length": 5
}
```

**Response:**
```json
{
  "default_probability": 0.15,
  "risk_label": "LOW",
  "top_factors": [
    {
      "feature": "fico_score",
      "impact": 0.08,
      "direction": "decreases_risk",
      "human_readable_reason": "Higher credit score reflects good credit management and lower default risk"
    },
    {
      "feature": "debt_to_income_ratio",
      "impact": 0.05,
      "direction": "decreases_risk",
      "human_readable_reason": "Low debt-to-income ratio shows good financial management and repayment ability"
    }
  ],
  "model_version": "1.0"
}
```

### GET /api/schema
Get model schema and feature definitions.

**Response:**
```json
{
  "features": {
    "age": {
      "type": "integer",
      "min": 18,
      "max": 100,
      "description": "Applicant age in years"
    },
    "annual_income": {
      "type": "number",
      "min": 1000,
      "max": 10000000,
      "description": "Annual income in USD"
    }
  },
  "risk_thresholds": {
    "LOW": 0.33,
    "MEDIUM": 0.66,
    "HIGH": 1.0
  },
  "model_info": {
    "model_name": "lightgbm",
    "model_type": "LGBMRegressor"
  }
}
```

## Model Training

### Data Sources

The model is trained on:
- **Primary**: `loan_processed_data.csv` (~988K records)
- **Secondary**: Home Credit dataset for feature reference
- **Target**: Binary classification (default vs non-default)

### Feature Engineering

Core features used for training:
- `age`: Applicant age
- `annual_income`: Annual income
- `debt_to_income_ratio`: DTI ratio
- `revolving_utilization`: Credit utilization
- `open_credit_lines`: Number of credit accounts
- `delinquencies_2yrs`: Payment history
- `dependents`: Number of dependents
- `fico_score`: Credit score
- `loan_amount`: Requested amount
- `employment_length`: Job stability

### Model Selection

The training pipeline:
1. Trains LightGBM, XGBoost, and CatBoost models
2. Evaluates on validation set using ROC AUC and recall
3. Selects best model based on combined score
4. Saves model artifacts for inference

### Evaluation Metrics

- **ROC AUC**: Area under ROC curve
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1 Score**: Harmonic mean of precision and recall
- **KS Statistic**: Kolmogorov-Smirnov test statistic

## Project Structure

```
backend/
├── app/                    # FastAPI application
│   ├── __init__.py
│   ├── main.py            # FastAPI app entry point
│   ├── config.py          # Configuration settings
│   ├── schemas.py         # Pydantic models
│   ├── preprocessing.py   # Data preprocessing
│   ├── inference.py       # SHAP explainability
│   └── utils.py          # Utility functions
├── training/              # Model training pipeline
│   ├── __init__.py
│   ├── data_loader.py    # Data loading and preprocessing
│   └── train_model.py    # Model training script
├── artifacts/             # Model artifacts (generated)
│   ├── model.pkl         # Trained model
│   ├── scaler.pkl        # Feature scaler
│   ├── imputer.pkl       # Missing value imputer
│   ├── feature_list.json # Feature names
│   └── model_metadata.json # Model info
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Configuration

Key configuration options in `app/config.py`:

- **Model Parameters**: Hyperparameters for each model type
- **Risk Thresholds**: Probability thresholds for risk tiers
- **API Settings**: Host, port, CORS origins
- **Data Paths**: Paths to training data and artifacts

## Development

### Adding New Features

1. Update feature mapping in `data_loader.py`
2. Add feature descriptions in `inference.py`
3. Update validation in `utils.py`
4. Retrain model with new features

### Model Retraining

```bash
# Retrain with updated data
python -m training.train_model

# Restart API server
python -m app.main
```

### Testing

```bash
# Run API tests
pytest tests/

# Test specific endpoint
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "-m", "app.main"]
```

### Environment Variables

- `API_HOST`: API host (default: 0.0.0.0)
- `API_PORT`: API port (default: 8000)
- `LOG_LEVEL`: Logging level (default: INFO)

## Troubleshooting

### Common Issues

1. **Model not loaded**: Ensure `artifacts/` directory contains trained model files
2. **Import errors**: Install all dependencies with `pip install -r requirements.txt`
3. **CORS issues**: Check CORS origins in `config.py`
4. **Memory issues**: Reduce batch size or use data chunking for large datasets

### Logs

The API logs all requests and errors. Check console output for debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.
