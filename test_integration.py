#!/usr/bin/env python3
"""
Test script to verify backend-frontend integration
This script tests the backend API endpoints and provides sample data for frontend testing
"""

import requests
import json
import time
from typing import Dict, Any

# Backend API configuration
API_BASE_URL = "http://localhost:8000/api"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_prediction_endpoint():
    """Test the prediction endpoint with sample data"""
    print("\n🔍 Testing prediction endpoint...")
    
    # Sample applicant data matching the frontend schema
    sample_data = {
        "age": 35,
        "annual_income": 75000,
        "debt_to_income_ratio": 0.45,
        "revolving_utilization": 0.6,
        "open_credit_lines": 5,
        "delinquencies_2yrs": 2,
        "dependents": 1,
        "fico_score": 720,
        "loan_amount": 25000,
        "employment_length": 5
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict",
            json=sample_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Prediction successful!")
            print(f"   Default Probability: {data['default_probability']:.3f}")
            print(f"   Risk Label: {data['risk_label']}")
            print(f"   Top Factors: {len(data['top_factors'])} factors")
            
            # Print top factors
            for i, factor in enumerate(data['top_factors'][:3], 1):
                print(f"   {i}. {factor['feature']}: {factor['impact']:.3f} ({factor['direction']})")
            
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction failed: {e}")
        return False

def test_schema_endpoint():
    """Test the schema endpoint"""
    print("\n🔍 Testing schema endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/schema", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Schema endpoint working!")
            print(f"   Features: {len(data.get('features', {}))}")
            return True
        else:
            print(f"❌ Schema endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Schema endpoint failed: {e}")
        return False

def generate_test_scenarios():
    """Generate various test scenarios for frontend testing"""
    print("\n📋 Generating test scenarios for frontend...")
    
    scenarios = [
        {
            "name": "Low Risk Applicant",
            "data": {
                "age": 45,
                "annual_income": 120000,
                "debt_to_income_ratio": 0.25,
                "revolving_utilization": 0.3,
                "open_credit_lines": 3,
                "delinquencies_2yrs": 0,
                "dependents": 2,
                "fico_score": 780,
                "loan_amount": 15000,
                "employment_length": 10
            }
        },
        {
            "name": "Medium Risk Applicant",
            "data": {
                "age": 35,
                "annual_income": 65000,
                "debt_to_income_ratio": 0.45,
                "revolving_utilization": 0.6,
                "open_credit_lines": 7,
                "delinquencies_2yrs": 1,
                "dependents": 1,
                "fico_score": 680,
                "loan_amount": 20000,
                "employment_length": 5
            }
        },
        {
            "name": "High Risk Applicant",
            "data": {
                "age": 28,
                "annual_income": 40000,
                "debt_to_income_ratio": 0.65,
                "revolving_utilization": 0.85,
                "open_credit_lines": 12,
                "delinquencies_2yrs": 3,
                "dependents": 3,
                "fico_score": 580,
                "loan_amount": 30000,
                "employment_length": 2
            }
        }
    ]
    
    print("Test scenarios generated:")
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{i}. {scenario['name']}:")
        for key, value in scenario['data'].items():
            print(f"   {key}: {value}")
    
    return scenarios

def main():
    """Main test function"""
    print("🚀 Starting Backend-Frontend Integration Test")
    print("=" * 50)
    
    # Test backend endpoints
    health_ok = test_health_endpoint()
    prediction_ok = test_prediction_endpoint()
    schema_ok = test_schema_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Health Endpoint: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Prediction Endpoint: {'✅ PASS' if prediction_ok else '❌ FAIL'}")
    print(f"   Schema Endpoint: {'✅ PASS' if schema_ok else '❌ FAIL'}")
    
    if health_ok and prediction_ok:
        print("\n🎉 Backend is ready for frontend integration!")
        generate_test_scenarios()
        
        print("\n📝 Next Steps:")
        print("   1. Start the frontend: npm run dev")
        print("   2. Navigate to http://localhost:5173")
        print("   3. Test the Assessment page with the sample data above")
        print("   4. Check the Explainability page for SHAP explanations")
        print("   5. Verify Dashboard shows backend connection status")
    else:
        print("\n⚠️  Backend issues detected. Please check:")
        print("   1. Backend server is running: python start_backend.py")
        print("   2. Model training completed: python train_model.py")
        print("   3. All dependencies installed: pip install -r backend/requirements.txt")

if __name__ == "__main__":
    main()
