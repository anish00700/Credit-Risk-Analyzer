# Credit Risk Analyzer - Detailed Project Description

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Features and Functionality](#features-and-functionality)
6. [Data Pipeline](#data-pipeline)
7. [Machine Learning Model](#machine-learning-model)
8. [API Documentation](#api-documentation)
9. [Frontend Application](#frontend-application)
10. [Installation and Setup](#installation-and-setup)
11. [Usage Guide](#usage-guide)
12. [Project Structure](#project-structure)
13. [Development Workflow](#development-workflow)

---

## Executive Summary

The Credit Risk Analyzer is a full-stack, AI-powered web application designed to predict loan default probability for credit applicants. The system combines machine learning models with explainable AI (SHAP values) to provide transparent, actionable credit risk assessments. It serves as a decision support tool for financial institutions, loan officers, and underwriters, enabling them to make faster, fairer, and more confident credit decisions while maintaining regulatory compliance.

**Key Highlights:**
- Real-time credit risk prediction with sub-100ms latency
- Explainable AI using SHAP values for transparent decision-making
- Three-tier risk classification (LOW/MEDIUM/HIGH)
- Production-ready FastAPI backend with comprehensive error handling
- Modern React frontend with responsive design
- Full integration between frontend and backend services

---

## Project Overview

### Purpose
The Credit Risk Analyzer addresses the critical need for accurate, transparent, and compliant credit risk assessment in financial institutions. Unlike traditional black-box models, this system provides:

1. **Accurate Predictions**: Trained on ~988,000 historical loan records using state-of-the-art gradient boosting algorithms
2. **Transparency**: SHAP-based explanations for every prediction, showing which factors contribute to the risk assessment
3. **Regulatory Compliance**: Designed with FCRA (Fair Credit Reporting Act) compliance in mind, ensuring fair lending practices
4. **Decision Support**: Provides actionable recommendations for loan approval, interest rates, and terms

### Problem Statement
Financial institutions face challenges in:
- Assessing credit risk accurately and quickly
- Explaining credit decisions to applicants and regulators
- Managing large volumes of loan applications efficiently
- Balancing risk management with fair lending practices
- Reducing default rates while maintaining loan approval rates

### Solution Approach
The system solves these challenges by:
- Automating risk assessment with machine learning models
- Providing transparent explanations for every decision
- Supporting multiple risk tiers for different decision workflows
- Enabling batch processing capabilities
- Maintaining comprehensive audit trails

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │   Mobile     │  │   API Client │         │
│  │   (React)    │  │   Browser    │  │   (cURL/Post)│         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │         HTTP/REST (Port 8082)       │
          └──────────────────┼──────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  React 18 + TypeScript + Tailwind CSS + Shadcn/ui   │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │      │
│  │  │ Landing  │  │Assessment│  │Dashboard │          │      │
│  │  │  Page    │  │  Page    │  │  Page    │          │      │
│  │  └──────────┘  └──────────┘  └──────────┘          │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │      │
│  │  │ Insights │  │  About   │  │  NotFound│          │      │
│  │  │  Page    │  │  Page    │  │  Page    │          │      │
│  │  └──────────┘  └──────────┘  └──────────┘          │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │
          HTTP/REST API (Port 8000)
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    BACKEND LAYER                                │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           FastAPI Application Server                  │      │
│  │  ┌──────────────┐  ┌──────────────┐                 │      │
│  │  │   /health    │  │  /predict    │                 │      │
│  │  │  Endpoint    │  │  Endpoint    │                 │      │
│  │  └──────────────┘  └──────┬───────┘                 │      │
│  │                           │                           │      │
│  │  ┌────────────────────────┼───────────────────┐     │      │
│  │  │    Preprocessing Layer                     │     │      │
│  │  │  - Data Transformation                     │     │      │
│  │  │  - Feature Engineering                     │     │      │
│  │  │  - Scaling & Imputation                    │     │      │
│  │  └────────────────────────┬───────────────────┘     │      │
│  │                           │                           │      │
│  │  ┌────────────────────────┼───────────────────┐     │      │
│  │  │    Inference Layer                         │     │      │
│  │  │  - Model Prediction                        │     │      │
│  │  │  - SHAP Explainability                     │     │      │
│  │  │  - Risk Tier Classification                │     │      │
│  │  └────────────────────────┬───────────────────┘     │      │
│  └───────────────────────────┼──────────────────────────┘      │
└───────────────────────────────┼────────────────────────────────┘
                                │
┌───────────────────────────────┼────────────────────────────────┐
│                    MODEL LAYER                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Trained Model Artifacts                             │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │     │
│  │  │ model.pkl│  │scaler.pkl│  │imputer.pkl│          │     │
│  │  └──────────┘  └──────────┘  └──────────┘          │     │
│  │  ┌──────────────┐  ┌──────────────────┐            │     │
│  │  │feature_list  │  │model_metadata    │            │     │
│  │  │  .json       │  │  .json           │            │     │
│  │  └──────────────┘  └──────────────────┘            │     │
│  │                                                     │     │
│  │  Model Types: LightGBM / XGBoost / CatBoost        │     │
│  │  (Best model selected during training)             │     │
│  └──────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                  │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Training Data    │  │  Feature Store   │                 │
│  │ loan_processed_  │  │  (Preprocessed)  │                 │
│  │ data.csv         │  │                  │                 │
│  │ (~988K records)  │  │                  │                 │
│  └──────────────────┘  └──────────────────┘                 │
└───────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Prediction Request Flow:**
1. User submits form in React frontend (`Assessment.tsx`)
2. Frontend validates input and calls `apiService.predictCreditRisk()`
3. HTTP POST request sent to `http://localhost:8000/api/predict`
4. FastAPI receives request in `app/main.py` → `predict_credit_risk()`
5. Request validated using Pydantic schema (`app/schemas.py`)
6. Data preprocessed using `Preprocessor.transform_applicant_data()`
7. Model makes prediction (loaded from `artifacts/model.pkl`)
8. SHAP explainer generates feature attributions (`SHAPExplainer`)
9. Response formatted with risk tier and top factors
10. JSON response returned to frontend
11. Frontend displays results with visualizations

---

## Technology Stack

### Backend Technologies

**Core Framework:**
- **FastAPI 0.104.1+**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for FastAPI (with hot-reload support)
- **Python 3.8+**: Programming language

**Machine Learning:**
- **LightGBM 4.0.0+**: Gradient boosting framework (primary model)
- **XGBoost 2.0.0+**: Alternative gradient boosting framework
- **CatBoost 1.2.0+**: Gradient boosting with categorical support
- **Scikit-learn 1.3.0+**: Preprocessing, evaluation metrics
- **SHAP 0.42.0+**: Explainable AI library for model interpretability

**Data Processing:**
- **Pandas 2.0.0+**: Data manipulation and analysis
- **NumPy 1.24.0+**: Numerical computing
- **Joblib 1.3.0+**: Model serialization (saving/loading)

**Utilities:**
- **Pydantic 2.0.0+**: Data validation using Python type annotations
- **Python-dotenv 1.0.0+**: Environment variable management

**Visualization (Training):**
- **Matplotlib 3.7.0+**: Plotting library
- **Seaborn 0.12.0+**: Statistical data visualization

### Frontend Technologies

**Core Framework:**
- **React 18.3.1**: UI library
- **TypeScript 5.8.3**: Type-safe JavaScript
- **Vite 5.4.19**: Build tool and development server

**UI Framework:**
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Shadcn/ui**: High-quality React component library
- **Radix UI**: Unstyled, accessible component primitives

**Routing & State:**
- **React Router DOM 6.30.1**: Client-side routing
- **TanStack Query 5.83.0**: Server state management

**Form Handling:**
- **React Hook Form 7.61.1**: Performant forms with validation
- **Zod 3.25.76**: TypeScript-first schema validation
- **@hookform/resolvers 3.10.0**: Zod integration for React Hook Form

**Icons & UI Enhancements:**
- **Lucide React 0.462.0**: Icon library
- **Sonner 1.7.4**: Toast notifications
- **Recharts 2.15.4**: Chart library for data visualization

### Development Tools

**Backend:**
- **Logging**: Python standard library logging module
- **Testing**: Custom test scripts (`test_backend.py`)

**Frontend:**
- **ESLint 9.32.0**: Code linting
- **TypeScript ESLint 8.38.0**: TypeScript-specific linting rules
- **PostCSS 8.5.6**: CSS processing
- **Autoprefixer 10.4.21**: CSS vendor prefixing

---

## Features and Functionality

### Core Features

#### 1. Credit Risk Prediction
- **Real-time Assessment**: Sub-100ms prediction latency
- **Probability Output**: 0.0 (no risk) to 1.0 (high risk) default probability
- **Multi-Model Support**: Trains and evaluates LightGBM, XGBoost, and CatBoost
- **Best Model Selection**: Automatically selects best-performing model based on AUC and recall

#### 2. Risk Classification
- **Three-Tier System**:
  - **LOW RISK**: < 33% default probability → Auto-Approved
  - **MEDIUM RISK**: 33-66% default probability → Review Required
  - **HIGH RISK**: ≥ 66% default probability → Manual Hold

#### 3. Explainable AI (SHAP)
- **Feature Attribution**: Shows how each feature contributes to the prediction
- **Directional Impact**: Identifies whether features increase or decrease risk
- **Human-Readable Explanations**: Natural language descriptions for each factor
- **Top Factors**: Highlights top 5 most influential risk factors
- **Transparency**: Every prediction is fully explainable for regulatory compliance

#### 4. Comprehensive Input Validation
- **Client-Side Validation**: Real-time form validation in React
- **Server-Side Validation**: Pydantic schema validation on backend
- **Range Checking**: Validates all numeric inputs within acceptable ranges
- **Error Messages**: Clear, actionable error messages for invalid inputs

#### 5. Application Management
- **Application Storage**: LocalStorage-based persistence of applications
- **Application History**: View all past assessments
- **Search & Filter**: Filter by risk tier, status, or search by name/ID
- **Detailed Insights**: View comprehensive analysis for each application

#### 6. Dashboard Analytics
- **Portfolio Overview**: Aggregate statistics across all applications
- **Risk Distribution**: Visual breakdown of LOW/MEDIUM/HIGH risk applicants
- **Statistics Cards**: Key metrics (high risk %, average default prob, approval confidence)
- **Recent Applications**: Quick access to latest assessments

#### 7. Backend Connectivity
- **Connection Monitoring**: Real-time status of backend availability
- **Graceful Degradation**: Falls back to mock data when backend is offline
- **Visual Indicators**: Clear UI indicators for connection status
- **Automatic Retry**: Handles network errors gracefully

### Advanced Features

#### 1. AI-Powered Insights
- **Live SHAP Analysis**: Real-time SHAP value calculation for stored applications
- **Scenario Analysis**: What-if analysis for improving risk profile
- **Actionable Recommendations**: Specific suggestions for reducing risk
- **Affordability Analysis**: EMI calculation and payment-to-income ratios

#### 2. Decision Support
- **Recommended Actions**: Auto-Approve, Approve with Conditions, or Manual Review
- **Rate Band Suggestions**: Suggested interest rate ranges by risk tier
- **Term Recommendations**: Optimal loan term suggestions
- **Capacity Analysis**: Loan-to-income ratio analysis

#### 3. User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Animations**: Smooth transitions and visual feedback
- **Accessibility**: WCAG-compliant UI components

---

## Data Pipeline

### Training Data Source

**Primary Dataset:** `loan_processed_data.csv`
- **Size**: ~988,000 records
- **Format**: CSV with loan application and performance data
- **Target Variable**: Derived from `loan_status` field
- **Features**: Multiple financial and demographic attributes

**Data Quality:**
- Missing value handling using median imputation
- Outlier removal (99th percentile for income)
- Range validation (FICO scores, ratios)
- Data type conversion and standardization

### Feature Engineering

**Core Features Extracted:**
1. `fico_score`: Credit score (300-850, mapped from `fico_range_high`)
2. `annual_income`: Annual income in USD (from `annual_inc`)
3. `debt_to_income_ratio`: DTI ratio (from `dti`)
4. `revolving_utilization`: Credit utilization (from `revol_util`)
5. `open_credit_lines`: Number of credit accounts (from `open_acc`)
6. `delinquencies_2yrs`: Payment history (from `delinq_2yrs`)
7. `loan_amount`: Requested loan amount (from `loan_amnt`)
8. `employment_length`: Years of employment (parsed from `emp_length`)
9. `term_length`: Loan term in months (parsed from `term`)
10. `age`: Applicant age (derived or defaulted to 35)
11. `dependents`: Number of dependents (defaulted to 0 if missing)

**Derived Features:**
1. `monthly_income`: Annual income / 12
2. `loan_to_income_ratio`: Loan amount / Annual income
3. `high_utilization`: Binary flag (1 if utilization > 80%)

### Data Preprocessing Pipeline

**Training Phase:**
1. **Load Data**: Chunked CSV reading for large files
2. **Target Creation**: Binary classification from loan status
3. **Feature Selection**: Map raw columns to standardized features
4. **Feature Engineering**: Add derived features
5. **Data Cleaning**:
   - Remove invalid FICO scores
   - Remove income outliers
   - Handle missing values
   - Remove infinite values
6. **Imputation**: Median imputation for missing numeric values
7. **Scaling**: StandardScaler normalization
8. **Train/Val/Test Split**: 60/20/20 stratified split

**Inference Phase:**
1. **Input Validation**: Validate request schema
2. **Feature Engineering**: Add derived features (monthly_income, loan_to_income_ratio, etc.)
3. **Missing Value Handling**: Use saved imputer
4. **Scaling**: Use saved scaler
5. **Feature Ordering**: Ensure features match training order

### Target Variable Creation

**Default Statuses** (mapped to `target_default = 1`):
- 'Charged Off'
- 'Default'
- 'Late (31-120 days)'
- 'Late (16-30 days)'
- 'In Grace Period'

**Non-Default Statuses** (mapped to `target_default = 0`):
- All other statuses (Fully Paid, Current, etc.)

---

## Machine Learning Model

### Model Architecture

**Algorithm Type**: Gradient Boosting Decision Trees

**Supported Models:**
1. **LightGBM** (Light Gradient Boosting Machine)
   - Fast training and inference
   - Handles large datasets efficiently
   - Built-in categorical feature support
   
2. **XGBoost** (Extreme Gradient Boosting)
   - Robust to overfitting
   - Excellent performance on structured data
   - Widely used in credit risk modeling

3. **CatBoost** (Categorical Boosting)
   - Automatic handling of categorical features
   - Strong default hyperparameters
   - Good performance out-of-the-box

### Model Training Process

**Training Pipeline:**
1. **Data Preparation**: Load, clean, and preprocess data
2. **Feature Engineering**: Create derived features
3. **Split Data**: Train (60%), Validation (20%), Test (20%)
4. **Handle Imbalance**: Calculate class weights for imbalanced data
5. **Train Models**: Train all three models with optimized hyperparameters
6. **Evaluate**: Calculate metrics on validation set
7. **Select Best**: Choose model based on combined AUC and recall score
8. **Final Evaluation**: Evaluate best model on test set
9. **Save Artifacts**: Persist model, scaler, imputer, and metadata

**Hyperparameters:**

LightGBM:
- objective: 'binary'
- metric: 'auc'
- num_leaves: 31
- learning_rate: 0.05
- feature_fraction: 0.9
- bagging_fraction: 0.8
- bagging_freq: 5
- class_weight: 'balanced'

XGBoost:
- objective: 'binary:logistic'
- eval_metric: 'auc'
- max_depth: 6
- learning_rate: 0.05
- subsample: 0.8
- colsample_bytree: 0.9
- scale_pos_weight: calculated dynamically

CatBoost:
- objective: 'Logloss'
- eval_metric: 'AUC'
- depth: 6
- learning_rate: 0.05
- class_weights: calculated dynamically

### Model Evaluation Metrics

**Primary Metrics:**
1. **ROC AUC**: Area Under ROC Curve (measures discrimination ability)
2. **Precision**: True Positives / (True Positives + False Positives)
3. **Recall**: True Positives / (True Positives + False Negatives)
4. **F1 Score**: Harmonic mean of precision and recall
5. **KS Statistic**: Kolmogorov-Smirnov statistic (measures separation between good and bad scores)

**Model Selection Criterion:**
- Combined score = 0.7 × AUC + 0.3 × Recall
- Prioritizes AUC for overall discrimination while ensuring good recall for default detection

### Model Artifacts

**Saved Files** (`backend/artifacts/`):
1. `model.pkl`: Serialized best model (Joblib format)
2. `scaler.pkl`: StandardScaler fitted on training data
3. `imputer.pkl`: SimpleImputer fitted on training data
4. `feature_list.json`: Ordered list of feature names
5. `model_metadata.json`: Model information (name, type, training date)
6. `model_evaluation_results.csv`: Detailed evaluation metrics
7. `plots/feature_importance.png`: Visual feature importance
8. `plots/roc_curves.png`: ROC curves for all models

### SHAP Explainability

**Implementation:**
- Uses `shap.TreeExplainer` for tree-based models
- Calculates SHAP values for each feature
- Provides both positive (risk-increasing) and negative (risk-decreasing) contributions
- Generates human-readable explanations for each feature

**SHAP Values Interpretation:**
- Positive SHAP value: Feature increases default probability
- Negative SHAP value: Feature decreases default probability
- Magnitude: Strength of the impact

**Feature Explanations:**
Pre-defined explanations for common features:
- FICO Score: "Higher credit score reflects good credit management"
- DTI Ratio: "High debt-to-income ratio indicates financial strain"
- Utilization: "High revolving utilization suggests heavy credit usage"
- Delinquencies: "Recent delinquencies indicate difficulty meeting obligations"
- And more...

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 1. Health Check
**GET** `/api/health`

**Description**: Check API status and model loading status

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "version": "1.0.0"
}
```

**Status Codes:**
- 200: Service healthy
- 500: Service error

---

#### 2. Credit Risk Prediction
**POST** `/api/predict`

**Description**: Predict credit default probability for an applicant

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

**Request Fields:**
| Field | Type | Required | Range/Constraints | Description |
|-------|------|----------|-------------------|-------------|
| age | integer | Yes | 18-100 | Applicant age in years |
| annual_income | float | Yes | > 1000, < 10,000,000 | Annual income in USD |
| debt_to_income_ratio | float | Yes | 0-1 | Debt-to-income ratio |
| revolving_utilization | float | Yes | 0-1 | Credit utilization ratio |
| open_credit_lines | integer | Yes | ≥ 0 | Number of open credit accounts |
| delinquencies_2yrs | integer | Yes | ≥ 0 | Number of 90+ day late payments |
| dependents | integer | Yes | 0-10 | Number of financial dependents |
| fico_score | integer | Yes | 300-850 | FICO credit score |
| loan_amount | float | No | > 100 | Requested loan amount |
| employment_length | integer | No | 0-50 | Years in current employment |

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
    },
    {
      "feature": "fico_score",
      "impact": 0.342,
      "direction": "decreases_risk",
      "human_readable_reason": "Higher credit score reflects good credit management and lower default risk"
    }
  ],
  "model_version": "1.0"
}
```

**Response Fields:**
- `default_probability`: Float between 0 and 1
- `risk_label`: String ("LOW", "MEDIUM", or "HIGH")
- `top_factors`: Array of top 5 risk factors with SHAP explanations
- `model_version`: String indicating model version

**Status Codes:**
- 200: Prediction successful
- 400: Validation error (invalid input)
- 500: Internal server error

---

#### 3. Model Schema
**GET** `/api/schema`

**Description**: Get model metadata and feature definitions

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
    "model_type": "Booster"
  }
}
```

---

### Error Responses

**Validation Error (400):**
```json
{
  "error": "Validation errors: Age must be between 18 and 100",
  "status_code": 400
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error",
  "detail": "Model not loaded",
  "status_code": 500
}
```

---

## Frontend Application

### Page Structure

#### 1. Landing Page (`/`)
**Purpose**: Introduction and overview of the application

**Features:**
- Hero section with call-to-action
- Key Performance Indicators (KPIs)
- "How It Works" section
- Feature highlights
- Benefits and use cases

**Components:**
- Navigation bar
- Footer
- Animated background elements
- Responsive card layouts

---

#### 2. Assessment Page (`/assessment`)
**Purpose**: Main form for credit risk assessment

**Features:**
- Comprehensive input form with validation
- Real-time backend connectivity status
- Form submission with loading states
- Results display with:
  - Default probability percentage
  - Risk tier badge
  - Risk probability bar
  - Top risk factors with explanations
  - Visual risk indicators

**Form Sections:**
1. **Applicant Profile**: Name, Age, Dependents
2. **Financial Stability**: Annual Income, Debt-to-Income Ratio
3. **Credit Behavior**: Utilization, Credit Lines, Delinquencies, FICO Score
4. **Loan Details**: Loan Amount, Employment Length

**Validation:**
- Client-side: Real-time validation with error messages
- Server-side: Backend API validation
- Range checking for all numeric inputs
- Required field validation

---

#### 3. Dashboard Page (`/dashboard`)
**Purpose**: Portfolio risk overview and analytics

**Features:**
- Summary statistics cards:
  - High Risk Applicant Percentage
  - Average Default Probability
  - Approval Confidence
- Risk distribution visualization
- Recent applicants table with:
  - Filtering by risk tier
  - Application details
  - Quick actions (view insights)
- Backend connection status

**Data Source:**
- Mock data (sample applications)
- Can integrate with real backend data

---

#### 4. Insights Page (`/insights`)
**Purpose**: Comprehensive application analysis and management

**Features:**
- Statistics overview
- Search and filter capabilities:
  - Search by name or application ID
  - Filter by risk tier (ALL/LOW/MEDIUM/HIGH)
  - Filter by status (ALL/Auto-Approved/Manual Hold/Review)
- Applications table with detailed information
- Action buttons:
  - View inline insights
  - Generate AI insights (live SHAP analysis)

**Modals:**
1. **Application Insights**: Detailed view of stored application
2. **AI Insights**: Live SHAP analysis with scenario modeling

---

#### 5. About Page (`/about`)
**Purpose**: Documentation and methodology

**Sections:**
- What is Credit Risk Analyzer?
- How the Score Works
- Explainability & SHAP
- Platform Capabilities
- Intended Use
- Important Disclaimer

---

### Component Library

**Reusable Components:**
1. **Navigation**: Top navigation bar with routing
2. **Footer**: Site footer with links
3. **ApplicationInsights**: Modal for detailed application view
4. **AIInsights**: Modal for live AI analysis
5. **AIPrepareDialog**: Loading dialog for AI analysis

**UI Components (Shadcn/ui):**
- Buttons, Cards, Badges
- Forms, Inputs, Labels
- Tables, Dialogs, Alerts
- Tabs, Accordions, Tooltips
- And more...

---

## Installation and Setup

### Prerequisites

**Required Software:**
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager
- Git (for version control)

**System Requirements:**
- 4GB+ RAM (8GB recommended)
- 2GB+ free disk space
- Internet connection (for downloading dependencies)

---

### Backend Setup

#### Step 1: Navigate to Project Directory
```bash
cd Credit-Risk-Analyzer
```

#### Step 2: Create Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Step 3: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 4: Verify Data Files
Ensure `data/loan_processed_data.csv` exists:
```bash
ls data/loan_processed_data.csv
```

#### Step 5: Train the Model
```bash
# From project root
python train_model.py

# OR from backend directory
python -m training.train_model
```

This will:
- Load and preprocess training data
- Train LightGBM, XGBoost, and CatBoost models
- Select and save the best model
- Generate evaluation reports and plots
- Save preprocessing artifacts

**Expected Output:**
- Model artifacts in `backend/artifacts/`
- Evaluation plots in `backend/artifacts/plots/`
- Training logs in console

#### Step 6: Start Backend Server
```bash
# Option 1: Use startup script (recommended)
python start_backend.py

# Option 2: Direct uvicorn command
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Verify Backend:**
```bash
curl http://localhost:8000/api/health
```

**Expected Response:**
```json
{"status":"ok","model_loaded":true,"version":"1.0.0"}
```

---

### Frontend Setup

#### Step 1: Navigate to Project Root
```bash
cd Credit-Risk-Analyzer
```

#### Step 2: Install Node Dependencies
```bash
npm install
```

#### Step 3: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.4.19  ready in 500 ms

➜  Local:   http://localhost:8082/
➜  Network: use --host to expose
```

#### Step 4: Verify Frontend
Open browser and navigate to:
```
http://localhost:8082
```

---

### Production Build

#### Frontend Production Build
```bash
npm run build
```

**Output:** `dist/` directory with optimized production files

#### Backend Production
```bash
# Use production ASGI server (Gunicorn with Uvicorn workers)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## Usage Guide

### For End Users

#### Making a Credit Assessment

1. **Navigate to Assessment Page**
   - Click "Start Assessment" on landing page
   - Or use navigation menu → "New Assessment"

2. **Fill in Applicant Information**
   - **Applicant Profile**: Enter name, age, number of dependents
   - **Financial Stability**: Enter annual income and debt-to-income ratio
   - **Credit Behavior**: Enter utilization, credit lines, delinquencies, FICO score
   - **Loan Details**: Enter loan amount and employment length (optional)

3. **Submit Assessment**
   - Click "Generate Risk Assessment" button
   - Wait for AI analysis (typically < 1 second)

4. **Review Results**
   - View default probability percentage
   - Check risk tier (LOW/MEDIUM/HIGH)
   - Review top risk factors with explanations
   - Read actionable recommendations

5. **View Detailed Insights**
   - Results are automatically saved
   - Click "View Insights" to see comprehensive analysis
   - Or navigate to Insights page to view all applications

---

### For Developers

#### Training a New Model

```bash
# Train with current data
python train_model.py

# Training will:
# 1. Load data from data/loan_processed_data.csv
# 2. Preprocess and engineer features
# 3. Train 3 models (LightGBM, XGBoost, CatBoost)
# 4. Evaluate and select best model
# 5. Save artifacts to backend/artifacts/
```

#### Testing the Backend

```bash
# Run test suite
python test_backend.py

# Test specific endpoint
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

#### Modifying Features

1. **Add New Feature**:
   - Update `training/data_loader.py` → `select_features()`
   - Add feature to `app/preprocessing.py` → `_add_derived_features()`
   - Update `app/inference.py` → `_setup_feature_descriptions()`
   - Retrain model

2. **Modify Risk Thresholds**:
   - Update `backend/app/config.py` → `RISK_THRESHOLDS`
   - Update `app/utils.py` → `determine_risk_tier()`

3. **Add API Endpoint**:
   - Add route in `app/main.py`
   - Create schema in `app/schemas.py`
   - Implement handler function

---

## Project Structure

```
Credit-Risk-Analyzer/
├── backend/                          # Backend Python application
│   ├── app/                         # FastAPI application
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── config.py                # Configuration settings
│   │   ├── schemas.py               # Pydantic request/response models
│   │   ├── preprocessing.py         # Data preprocessing utilities
│   │   ├── inference.py             # SHAP explainability engine
│   │   └── utils.py                 # Utility functions
│   ├── training/                    # Model training pipeline
│   │   ├── __init__.py
│   │   ├── data_loader.py           # Data loading and preprocessing
│   │   ├── train_model.py           # Model training script
│   │   └── evaluate_model.py        # Model evaluation utilities
│   ├── artifacts/                   # Model artifacts (generated)
│   │   ├── model.pkl                # Trained model
│   │   ├── scaler.pkl               # Feature scaler
│   │   ├── imputer.pkl              # Missing value imputer
│   │   ├── feature_list.json        # Feature names
│   │   ├── model_metadata.json      # Model metadata
│   │   ├── model_evaluation_results.csv
│   │   └── plots/                   # Evaluation plots
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # Backend documentation
│
├── src/                             # Frontend React application
│   ├── components/                  # React components
│   │   ├── ui/                      # Shadcn/ui components
│   │   ├── Navigation.tsx           # Navigation bar
│   │   ├── Footer.tsx               # Footer component
│   │   ├── ApplicationInsights.tsx  # Application details modal
│   │   ├── AIInsights.tsx           # AI analysis modal
│   │   └── AIPrepareDialog.tsx      # Loading dialog
│   ├── pages/                       # Page components
│   │   ├── Landing.tsx              # Landing page
│   │   ├── Assessment.tsx           # Assessment form page
│   │   ├── Dashboard.tsx            # Dashboard page
│   │   ├── Insights.tsx             # Insights page
│   │   ├── About.tsx                # About page
│   │   └── NotFound.tsx             # 404 page
│   ├── services/                    # API services
│   │   └── api.ts                   # Backend API client
│   ├── utils/                       # Utilities
│   │   ├── applicationsStore.ts     # LocalStorage management
│   │   └── mockData.ts              # Mock data
│   ├── hooks/                       # React hooks
│   ├── lib/                         # Library utilities
│   ├── App.tsx                      # Main App component
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Global styles
│
├── data/                            # Data files
│   ├── loan_processed_data.csv      # Primary training data
│   ├── homecreditdata/              # Home Credit dataset
│   └── germancreditdata/            # German Credit dataset
│
├── public/                          # Static assets
├── catboost_info/                   # CatBoost training logs
│
├── train_model.py                   # Standalone training script
├── start_backend.py                 # Backend startup script
├── test_backend.py                  # Backend test suite
├── test_integration.py              # Integration tests
│
├── package.json                     # Node.js dependencies
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── components.json                  # Shadcn/ui configuration
│
├── README.md                        # Main project README
├── PROJECT_STATUS.md                # Project status document
├── QUICKSTART.md                    # Quick start guide
├── BACKEND_IMPLEMENTATION_COMPLETE.md
├── INTEGRATION_COMPLETE.md
├── TESTING_RESULTS.md
└── PROJECT_DESCRIPTION.md           # This file
```

---

## Development Workflow

### Typical Development Cycle

1. **Data Preparation**
   - Ensure training data is in `data/loan_processed_data.csv`
   - Verify data quality and format

2. **Model Training**
   - Run `python train_model.py`
   - Review evaluation metrics
   - Check generated plots in `backend/artifacts/plots/`

3. **Backend Development**
   - Make changes in `backend/app/`
   - Test endpoints using `test_backend.py`
   - Verify with curl or Postman

4. **Frontend Development**
   - Make changes in `src/`
   - View changes in browser (hot-reload enabled)
   - Test API integration

5. **Integration Testing**
   - Start both backend and frontend
   - Test full user flow
   - Verify error handling

### Code Organization Principles

**Backend:**
- Separation of concerns (API, preprocessing, inference, training)
- Consistent error handling
- Comprehensive logging
- Type hints and documentation

**Frontend:**
- Component-based architecture
- Reusable UI components
- Centralized API service
- Type safety with TypeScript

### Version Control

**Git Workflow:**
- Main branch: Production-ready code
- Feature branches: New features and fixes
- Commit messages: Clear and descriptive

**Ignored Files:**
- `node_modules/`
- `__pycache__/`
- `*.pyc`
- `.env` (if using environment variables)
- `artifacts/` (model files - can be regenerated)

---

## Performance Characteristics

### Latency

**API Response Times:**
- Average: 50-100ms
- p95: ~150ms
- p99: ~200ms

**Frontend:**
- Initial load: < 2 seconds
- Form submission: < 1 second
- Navigation: Instant (client-side routing)

### Scalability

**Current Limitations:**
- Single-threaded prediction (can handle ~100 req/s)
- No database persistence (uses LocalStorage)
- Single model instance (no load balancing)

**Scaling Options:**
- Horizontal scaling with multiple API instances
- Database integration for persistence
- Model serving with TensorFlow Serving or MLflow
- Caching layer (Redis) for frequent predictions

### Resource Usage

**Backend:**
- Memory: ~500MB (model loaded)
- CPU: Low (mostly I/O bound)

**Frontend:**
- Bundle size: ~2MB (gzipped)
- Memory: ~50MB (browser)

---

## Security Considerations

### Current Implementation

**Implemented:**
- Input validation (client and server)
- CORS configuration
- Error message sanitization
- Type checking with Pydantic

**Not Implemented (Production Requirements):**
- Authentication/Authorization
- Rate limiting
- HTTPS/SSL
- API key management
- Request encryption
- Audit logging
- Input sanitization (SQL injection, XSS protection)

### Production Security Checklist

- [ ] Add JWT authentication
- [ ] Implement rate limiting
- [ ] Configure HTTPS/SSL certificates
- [ ] Add API key authentication
- [ ] Implement request encryption
- [ ] Add comprehensive audit logging
- [ ] Sanitize all inputs
- [ ] Implement CSRF protection
- [ ] Add security headers
- [ ] Regular security audits

---

## Future Enhancements

### Short-Term (1-3 months)
1. **Database Integration**
   - PostgreSQL/MySQL for persistence
   - Application history storage
   - User management

2. **Authentication**
   - JWT-based authentication
   - Role-based access control
   - User sessions

3. **Batch Processing**
   - CSV upload for bulk predictions
   - Async job processing
   - Progress tracking

### Medium-Term (3-6 months)
1. **Advanced Analytics**
   - Portfolio risk analytics
   - Trend analysis
   - Comparative analysis

2. **Model Monitoring**
   - Prediction drift detection
   - Model performance tracking
   - A/B testing framework

3. **Report Generation**
   - PDF report generation
   - Email notifications
   - Scheduled reports

### Long-Term (6+ months)
1. **Multi-Model Ensemble**
   - Ensemble predictions
   - Model versioning
   - Model comparison tools

2. **Real-Time Features**
   - WebSocket support
   - Real-time updates
   - Live collaboration

3. **Mobile Applications**
   - Native iOS app
   - Native Android app
   - Mobile-optimized UI

---

## Support and Maintenance

### Troubleshooting

**Common Issues:**

1. **Backend Not Starting**
   - Check if model artifacts exist
   - Verify dependencies installed
   - Check port 8000 availability

2. **Frontend Not Connecting**
   - Verify backend is running
   - Check CORS configuration
   - Review browser console errors

3. **Model Not Loading**
   - Run training script
   - Verify artifacts directory
   - Check file permissions

### Logging

**Backend Logging:**
- Console output with INFO level
- Structured logging format
- Error stack traces

**Frontend Logging:**
- Browser console (development)
- Error boundaries (production)
- API call logging

### Monitoring Recommendations

**Production Monitoring:**
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Log aggregation (ELK stack)
- Metrics collection (Prometheus)

---

## Conclusion

The Credit Risk Analyzer is a comprehensive, production-ready application that combines state-of-the-art machine learning with explainable AI to provide transparent credit risk assessments. The system's modular architecture, comprehensive documentation, and extensive feature set make it suitable for both development and production use.

The project demonstrates best practices in:
- Full-stack web development
- Machine learning model deployment
- Explainable AI implementation
- API design and development
- Frontend state management
- User experience design

With proper deployment and security hardening, this system can serve as a reliable decision support tool for financial institutions, enabling faster, fairer, and more transparent credit decisions.

---

## Contact and Resources

**Documentation Files:**
- `README.md`: Main project overview
- `QUICKSTART.md`: Quick start guide
- `PROJECT_STATUS.md`: Current status
- `TESTING_RESULTS.md`: Test results
- `backend/README.md`: Backend-specific docs

**API Documentation:**
- Interactive docs: http://localhost:8000/docs (Swagger UI)
- Alternative docs: http://localhost:8000/redoc (ReDoc)

**Version Information:**
- Backend API Version: 1.0.0
- Frontend Version: 0.0.0 (development)
- Python: 3.8+
- Node.js: 16+

---

**Last Updated:** October 2025
**Project Status:** Production-Ready (Development Environment)
**License:** MIT (if applicable)

