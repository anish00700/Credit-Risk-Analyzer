# Quick Start Guide

## Your Application is Already Running! 🚀

Both the backend and frontend are currently running:
- **Frontend**: http://localhost:8082
- **Backend API**: http://localhost:8000

## How to Use the Application

### Step 1: Open the Web Interface
Open your browser and navigate to:
```
http://localhost:8082
```

### Step 2: Fill in the Credit Assessment Form
The form includes the following fields:

**Applicant Profile:**
- Age (18-100)
- Number of Dependents (0-10)

**Financial Stability:**
- Annual Income ($)
- Debt-to-Income Ratio (0-1, e.g., 0.45 for 45%)

**Credit History:**
- Revolving Utilization (0-1, e.g., 0.6 for 60%)
- Open Credit Lines (number of open accounts)
- Delinquencies in Last 2 Years
- FICO Score (300-850)

**Loan Details:**
- Loan Amount ($)
- Employment Length (years)

### Step 3: Submit and View Results
1. Click "Analyze Credit Risk"
2. Wait for the prediction (should take 1-2 seconds)
3. View the results:
   - **Default Probability**: The likelihood of loan default (0-100%)
   - **Risk Label**: LOW, MEDIUM, or HIGH
   - **Top Risk Factors**: The features that most influence the prediction

## Example Test Data

Try these sample applicants:

### Low Risk Applicant
```
Age: 45
Annual Income: $85,000
Debt-to-Income Ratio: 0.25
Revolving Utilization: 0.30
Open Credit Lines: 8
Delinquencies (2 yrs): 0
Dependents: 2
FICO Score: 780
Loan Amount: $15,000
Employment Length: 10 years
```

### High Risk Applicant
```
Age: 28
Annual Income: $35,000
Debt-to-Income Ratio: 0.65
Revolving Utilization: 0.95
Open Credit Lines: 3
Delinquencies (2 yrs): 4
Dependents: 0
FICO Score: 580
Loan Amount: $30,000
Employment Length: 1 year
```

## Testing via API (Advanced)

If you prefer to test via command line:

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

## Stopping the Application

### Stop the Frontend
```bash
# Find the npm process
ps aux | grep "npm run dev"

# Kill it using the PID
kill <PID>
```

### Stop the Backend
```bash
# Find the uvicorn process
ps aux | grep uvicorn

# Kill it using the PID
kill <PID>
```

Or simply press `Ctrl+C` in the terminal where each service is running.

## Restarting the Application

### Start Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend
```bash
npm run dev
```

## Understanding the Results

### Default Probability
- **0-33%**: LOW risk - Applicant likely to repay
- **33-66%**: MEDIUM risk - Moderate default risk
- **66-100%**: HIGH risk - Significant default risk

### Top Risk Factors
The application shows the features that most influenced the prediction:
- **Increases Risk** (red): Features pushing the prediction towards default
- **Decreases Risk** (green): Features reducing default probability

Each factor includes a human-readable explanation of why it matters.

## Troubleshooting

### "Backend not available" message
1. Check if backend is running: `curl http://localhost:8000/api/health`
2. If not, restart the backend (see above)

### Form not submitting
1. Ensure all required fields are filled
2. Check that values are within valid ranges
3. Open browser DevTools (F12) and check Console for errors

### Prediction takes too long
1. Check backend logs for errors
2. Ensure model artifacts exist in `backend/artifacts/`
3. Try restarting the backend

## Need Help?

- Check `PROJECT_STATUS.md` for detailed project information
- Review `backend/README.md` for backend-specific documentation
- Check browser console (F12) for frontend errors
- Check terminal logs for backend errors

---

**Happy Testing! 🎉**

Your AI-powered credit risk analyzer is ready to evaluate loan applications with explainable predictions!

