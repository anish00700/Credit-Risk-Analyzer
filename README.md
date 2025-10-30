# Credit Risk Analyzer 🎯

An AI-powered credit risk assessment system with explainable predictions using machine learning and SHAP values.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Quick Start

**Your application is already running!**

- **Frontend**: http://localhost:8082
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

Open http://localhost:8082 in your browser to start analyzing credit risk!

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Model Information](#model-information)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Backend
- ✅ **Machine Learning Model**: Gradient Boosted Trees (LightGBM/XGBoost/CatBoost)
- ✅ **Explainable AI**: SHAP values for feature importance
- ✅ **RESTful API**: FastAPI with automatic documentation
- ✅ **Data Pipeline**: Automated preprocessing and feature engineering
- ✅ **Model Evaluation**: Comprehensive metrics and visualizations
- ✅ **Class Imbalance Handling**: Proper handling of imbalanced datasets
- ✅ **CORS Support**: Ready for frontend integration

### Frontend
- ✅ **Modern UI**: React with TypeScript and Tailwind CSS
- ✅ **Real-time Validation**: Form validation with immediate feedback
- ✅ **Risk Visualization**: Clear display of risk levels and factors
- ✅ **Explainable Results**: Human-readable explanations for predictions
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Error Handling**: Graceful error messages and loading states

## 🏗 Architecture

```
┌─────────────────┐      HTTP/REST      ┌─────────────────┐
│                 │ ←─────────────────→ │                 │
│  React Frontend │                     │  FastAPI Backend│
│  (Port 8082)    │                     │  (Port 8000)    │
│                 │                     │                 │
└─────────────────┘                     └────────┬────────┘
                                                 │
                                                 │ Loads
                                                 ↓
                                        ┌─────────────────┐
                                        │ ML Model +      │
                                        │ SHAP Explainer  │
                                        │ Artifacts       │
                                        └─────────────────┘
```

### Tech Stack

**Backend:**
- Python 3.8+
- FastAPI (Web framework)
- LightGBM/XGBoost/CatBoost (ML models)
- SHAP (Explainability)
- Pandas, NumPy (Data processing)
- Scikit-learn (Preprocessing)

**Frontend:**
- React 18+
- TypeScript
- Tailwind CSS
- Vite (Build tool)
- Shadcn/ui (UI components)

## 🎯 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd /path/to/CreditScore
```

2. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Install Frontend Dependencies**
```bash
npm install
```

### Training the Model

```bash
python train_model.py
```

This will:
- Load and preprocess the training data
- Train multiple model variants (LightGBM, XGBoost, CatBoost)
- Evaluate and select the best model
- Save model artifacts to `backend/artifacts/`
- Generate evaluation plots

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access the application at http://localhost:8082

## 💡 Usage

### Web Interface

1. Navigate to http://localhost:8082
2. Fill in the credit assessment form with applicant details
3. Click "Analyze Credit Risk"
4. View the prediction results:
   - Default probability (0-100%)
   - Risk label (LOW/MEDIUM/HIGH)
   - Top risk factors with explanations

### API Usage

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Predict Credit Risk:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "annual_income": 60000,
    "debt_to_income_ratio": 0.45,
    "revolving_utilization": 0.6,
    "open_credit_lines": 5,
    "delinquencies_2yrs": 2,
    "dependents": 1,
    "fico_score": 720,
    "loan_amount": 25000,
    "employment_length": 5
  }'
```

**Get Model Schema:**
```bash
curl http://localhost:8000/api/schema
```

## 📚 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

#### GET /api/health
Returns the health status of the API and model loading status.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "version": "1.0.0"
}
```

#### POST /api/predict
Predicts credit default probability for an applicant.

**Request Body:**
```json
{
  "age": 35,
  "annual_income": 60000,
  "debt_to_income_ratio": 0.45,
  "revolving_utilization": 0.6,
  "open_credit_lines": 5,
  "delinquencies_2yrs": 2,
  "dependents": 1,
  "fico_score": 720,
  "loan_amount": 25000,
  "employment_length": 5
}
```

**Response:**
```json
{
  "default_probability": 0.665,
  "risk_label": "HIGH",
  "top_factors": [
    {
      "feature": "loan_to_income_ratio",
      "impact": 0.471,
      "direction": "increases_risk",
      "human_readable_reason": "Higher loan-to-income ratio increases default risk"
    }
  ],
  "model_version": "1.0"
}
```

#### GET /api/schema
Returns model metadata and feature definitions.

## 🤖 Model Information

### Training Data
- **Source**: `loan_processed_data.csv`
- **Target**: Binary classification (default vs. non-default)
- **Features**: 14 features including FICO score, income, DTI, utilization, etc.

### Model Type
Gradient Boosted Trees (best of LightGBM, XGBoost, CatBoost selected based on validation performance)

### Features Used
1. FICO Score (300-850)
2. Annual Income ($)
3. Debt-to-Income Ratio (0-1)
4. Revolving Utilization (0-1)
5. Open Credit Lines (count)
6. Delinquencies in Last 2 Years (count)
7. Loan Amount ($)
8. Employment Length (years)
9. Age (years)
10. Dependents (count)
11. Monthly Income (derived)
12. Loan-to-Income Ratio (derived)
13. High Utilization Flag (derived)
14. Term Length (months)

### Risk Thresholds
- **LOW**: < 33% default probability
- **MEDIUM**: 33% - 66% default probability
- **HIGH**: ≥ 66% default probability

### Model Performance
Check `backend/artifacts/model_evaluation_results.csv` for detailed metrics including:
- ROC AUC
- Precision
- Recall
- F1 Score
- KS Statistic

## 🧪 Testing

### Test Cases

See `TESTING_RESULTS.md` for comprehensive test results.

**Example Test Cases:**

**Low Risk:**
```json
{
  "age": 45, "annual_income": 85000, "debt_to_income_ratio": 0.25,
  "revolving_utilization": 0.30, "open_credit_lines": 8,
  "delinquencies_2yrs": 0, "dependents": 2, "fico_score": 780,
  "loan_amount": 15000, "employment_length": 10
}
```
Expected: ~23% default probability, LOW risk

**High Risk:**
```json
{
  "age": 28, "annual_income": 35000, "debt_to_income_ratio": 0.65,
  "revolving_utilization": 0.95, "open_credit_lines": 3,
  "delinquencies_2yrs": 4, "dependents": 0, "fico_score": 580,
  "loan_amount": 30000, "employment_length": 1
}
```
Expected: ~82% default probability, HIGH risk

## 🚀 Deployment

### Production Checklist

Before deploying to production:

- [ ] Add authentication (JWT, OAuth)
- [ ] Set up database for prediction history
- [ ] Implement rate limiting
- [ ] Configure HTTPS/SSL
- [ ] Set up logging and monitoring
- [ ] Add input sanitization
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Add automated tests
- [ ] Configure backup and recovery

### Deployment Options

**Backend:**
- AWS EC2 / Lambda
- Google Cloud Run
- Azure App Service
- Heroku
- DigitalOcean

**Frontend:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 📁 Project Structure

```
CreditScore/
├── backend/                    # Backend API
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── config.py          # Configuration
│   │   ├── schemas.py         # Pydantic models
│   │   ├── preprocessing.py   # Data preprocessing
│   │   ├── inference.py       # Model inference & SHAP
│   │   └── utils.py           # Utilities
│   ├── training/
│   │   ├── data_loader.py     # Data loading
│   │   ├── train_model.py     # Model training
│   │   └── evaluate_model.py  # Model evaluation
│   ├── artifacts/             # Model artifacts
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Backend docs
├── src/                       # Frontend source
│   ├── pages/
│   │   └── Assessment.tsx     # Main page
│   ├── services/
│   │   └── api.ts            # API service
│   └── components/           # UI components
├── data/                      # Training data
├── train_model.py            # Training script
├── start_backend.py          # Backend launcher
├── QUICKSTART.md             # Quick start guide
├── PROJECT_STATUS.md         # Project status
├── TESTING_RESULTS.md        # Test results
└── README.md                 # This file
```

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

1. **Authentication & Authorization**: Add user management
2. **Database Integration**: Store predictions and user data
3. **Model Monitoring**: Track model performance over time
4. **Batch Processing**: Support CSV uploads for bulk predictions
5. **Advanced Features**: A/B testing, model versioning, etc.
6. **Mobile App**: Native iOS/Android applications
7. **Advanced Visualizations**: More detailed charts and graphs

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues:
1. Check the documentation files (`QUICKSTART.md`, `PROJECT_STATUS.md`, `TESTING_RESULTS.md`)
2. Review the API documentation at http://localhost:8000/docs
3. Check the backend logs in the terminal
4. Check the browser console for frontend errors

## 🎉 Acknowledgments

- Built with FastAPI, React, and modern ML tools
- SHAP library for explainable AI
- Gradient boosting libraries (LightGBM, XGBoost, CatBoost)
- Shadcn/ui for beautiful UI components

---

**🚀 Start using your Credit Risk Analyzer at http://localhost:8082**

*Last updated: October 27, 2025*
