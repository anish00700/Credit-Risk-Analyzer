/**
 * API service for communicating with the backend credit risk analyzer
 */
const API_BASE_URL = 'http://localhost:8000/api';

export interface ApplicantData {
  name: string;
  age: number;
  annual_income: number;
  debt_to_income_ratio: number;
  revolving_utilization: number;
  open_credit_lines: number;
  delinquencies_2yrs: number;
  dependents: number;
  fico_score: number;
  loan_amount?: number;
  employment_length?: number;
}

export interface RiskFactor {
  feature: string;
  impact: number;
  direction: string;
  human_readable_reason: string;
}

export interface PredictionResponse {
  default_probability: number;
  risk_label: string;
  top_factors: RiskFactor[];
  model_version: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  version: string;
}

export interface ModelSchema {
  features: Record<string, any>;
  risk_thresholds: Record<string, number>;
  model_info: Record<string, any>;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const apiService = {
  /**
   * Check if the backend service is healthy
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<HealthResponse>(response);
  },

  /**
   * Get model schema and feature definitions
   */
  async getModelSchema(): Promise<ModelSchema> {
    const response = await fetch(`${API_BASE_URL}/schema`);
    return handleResponse<ModelSchema>(response);
  },

  /**
   * Predict credit risk for an applicant
   */
  async predictCreditRisk(applicantData: ApplicantData): Promise<PredictionResponse> {
    console.log('Making API request to:', `${API_BASE_URL}/predict`);
    console.log('Request body:', JSON.stringify(applicantData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicantData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    return handleResponse<PredictionResponse>(response);
  },

  /**
   * Check if backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.warn('Backend not available:', error);
      return false;
    }
  }
};

export { ApiError };
