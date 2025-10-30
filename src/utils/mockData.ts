export const mockApplicants = [
  {
    id: "APP-2025-001",
    name: "Sarah Johnson",
    defaultProbability: 0.72,
    riskTier: "HIGH",
    status: "Manual Hold",
    timestamp: "2 mins ago",
    insights: {
      summary: "High-risk applicant with multiple concerning factors",
      topFactors: [
        {
          feature: "High Debt-to-Income Ratio",
          impact: 0.28,
          direction: "increases_risk" as const,
          description: "Debt payments represent 65% of monthly income, indicating significant financial strain."
        },
        {
          feature: "Recent Delinquencies",
          impact: 0.22,
          direction: "increases_risk" as const,
          description: "Two 90+ day late payments in the last 12 months suggest payment difficulties."
        },
        {
          feature: "High Revolving Utilization",
          impact: 0.18,
          direction: "increases_risk" as const,
          description: "Credit cards are 85% utilized, indicating heavy reliance on unsecured credit."
        }
      ],
      recommendations: [
        "Require additional income verification",
        "Consider higher interest rate or shorter term",
        "Request co-signer for additional security"
      ],
      applicantData: {
        age: 28,
        annual_income: 45000,
        debt_to_income_ratio: 0.65,
        revolving_utilization: 0.85,
        open_credit_lines: 4,
        delinquencies_2yrs: 2,
        dependents: 1,
        fico_score: 620,
        loan_amount: 25000,
        employment_length: 2
      }
    }
  },
  {
    id: "APP-2025-002",
    name: "Michael Chen",
    defaultProbability: 0.23,
    riskTier: "LOW",
    status: "Auto-Approved",
    timestamp: "5 mins ago",
    insights: {
      summary: "Excellent credit profile with strong financial stability",
      topFactors: [
        {
          feature: "High FICO Score",
          impact: 0.35,
          direction: "decreases_risk" as const,
          description: "FICO score of 780 indicates excellent credit management and low default risk."
        },
        {
          feature: "Low Debt-to-Income Ratio",
          impact: 0.25,
          direction: "decreases_risk" as const,
          description: "Debt payments only represent 25% of monthly income, showing strong financial capacity."
        },
        {
          feature: "Stable Employment",
          impact: 0.20,
          direction: "decreases_risk" as const,
          description: "8 years with current employer demonstrates job stability and consistent income."
        }
      ],
      recommendations: [
        "Approve with standard terms",
        "Consider offering premium rate",
        "Eligible for additional credit products"
      ],
      applicantData: {
        age: 35,
        annual_income: 85000,
        debt_to_income_ratio: 0.25,
        revolving_utilization: 0.20,
        open_credit_lines: 6,
        delinquencies_2yrs: 0,
        dependents: 2,
        fico_score: 780,
        loan_amount: 15000,
        employment_length: 8
      }
    }
  },
  {
    id: "APP-2025-003",
    name: "Emily Rodriguez",
    defaultProbability: 0.48,
    riskTier: "MEDIUM",
    status: "Review",
    timestamp: "12 mins ago",
    insights: {
      summary: "Moderate risk profile with mixed financial indicators",
      topFactors: [
        {
          feature: "Moderate Credit Score",
          impact: 0.20,
          direction: "increases_risk" as const,
          description: "FICO score of 680 is below average, indicating some credit management concerns."
        },
        {
          feature: "Recent Job Change",
          impact: 0.18,
          direction: "increases_risk" as const,
          description: "Only 6 months with current employer may indicate income instability."
        },
        {
          feature: "Reasonable Income",
          impact: 0.15,
          direction: "decreases_risk" as const,
          description: "Annual income of $65,000 provides adequate repayment capacity."
        }
      ],
      recommendations: [
        "Verify employment stability",
        "Consider shorter loan term",
        "Monitor for additional risk factors"
      ],
      applicantData: {
        age: 29,
        annual_income: 65000,
        debt_to_income_ratio: 0.40,
        revolving_utilization: 0.45,
        open_credit_lines: 3,
        delinquencies_2yrs: 1,
        dependents: 0,
        fico_score: 680,
        loan_amount: 20000,
        employment_length: 0.5
      }
    }
  },
  {
    id: "APP-2025-004",
    name: "David Thompson",
    defaultProbability: 0.15,
    riskTier: "LOW",
    status: "Auto-Approved",
    timestamp: "18 mins ago",
    insights: {
      summary: "Very low risk applicant with excellent financial profile",
      topFactors: [
        {
          feature: "Excellent Credit History",
          impact: 0.30,
          direction: "decreases_risk" as const,
          description: "No delinquencies and high credit score demonstrate responsible financial behavior."
        },
        {
          feature: "High Income",
          impact: 0.25,
          direction: "decreases_risk" as const,
          description: "Annual income of $120,000 provides strong repayment capacity."
        },
        {
          feature: "Low Credit Utilization",
          impact: 0.20,
          direction: "decreases_risk" as const,
          description: "Only 15% credit utilization shows conservative credit usage."
        }
      ],
      recommendations: [
        "Approve with best available terms",
        "Offer premium rate",
        "Consider higher loan amount"
      ],
      applicantData: {
        age: 42,
        annual_income: 120000,
        debt_to_income_ratio: 0.20,
        revolving_utilization: 0.15,
        open_credit_lines: 8,
        delinquencies_2yrs: 0,
        dependents: 3,
        fico_score: 795,
        loan_amount: 30000,
        employment_length: 12
      }
    }
  },
  {
    id: "APP-2025-005",
    name: "Lisa Wang",
    defaultProbability: 0.81,
    riskTier: "HIGH",
    status: "Manual Hold",
    timestamp: "24 mins ago",
    insights: {
      summary: "Very high-risk applicant requiring immediate attention",
      topFactors: [
        {
          feature: "Multiple Recent Delinquencies",
          impact: 0.35,
          direction: "increases_risk" as const,
          description: "Four 90+ day late payments in the last 18 months indicate severe payment difficulties."
        },
        {
          feature: "High Debt Burden",
          impact: 0.30,
          direction: "increases_risk" as const,
          description: "Debt-to-income ratio of 75% shows unsustainable financial obligations."
        },
        {
          feature: "Low Credit Score",
          impact: 0.25,
          direction: "increases_risk" as const,
          description: "FICO score of 580 is well below average and indicates high default risk."
        }
      ],
      recommendations: [
        "Decline application",
        "Suggest credit counseling",
        "Consider secured loan alternatives"
      ],
      applicantData: {
        age: 31,
        annual_income: 38000,
        debt_to_income_ratio: 0.75,
        revolving_utilization: 0.95,
        open_credit_lines: 2,
        delinquencies_2yrs: 4,
        dependents: 2,
        fico_score: 580,
        loan_amount: 15000,
        employment_length: 1
      }
    }
  },
];

export const mockRiskFactors = [
  {
    feature: "High Debt Ratio",
    impact: 0.28,
    direction: "increases_risk" as const,
    description: "Total monthly debt payments exceed 60% of monthly income, indicating high financial strain."
  },
  {
    feature: "Multiple Late Payments",
    impact: 0.22,
    direction: "increases_risk" as const,
    description: "History of 90+ day late payments suggests difficulty meeting financial obligations."
  },
  {
    feature: "High Revolving Utilization",
    impact: 0.18,
    direction: "increases_risk" as const,
    description: "Heavy reliance on unsecured credit increases default risk during economic stress."
  },
  {
    feature: "Stable Employment Income",
    impact: 0.15,
    direction: "decreases_risk" as const,
    description: "Consistent monthly income above $5,000 provides financial stability."
  },
  {
    feature: "Low Number of Dependents",
    impact: 0.08,
    direction: "decreases_risk" as const,
    description: "Fewer financial dependents reduces monthly expense burden."
  },
];

export const mockDashboardStats = {
  highRiskPercent: 18.3,
  avgDefaultProb: 0.34,
  approvalConfidence: 94.7,
  totalApplicants: 1247,
  riskDistribution: {
    low: 52,
    medium: 30,
    high: 18
  }
};

export function generateMockPrediction(formData: any) {
  // Simple mock scoring logic
  const riskScore = 
    (formData.debt_ratio * 0.3) +
    (formData.revolving_utilization * 0.25) +
    (formData.number_of_times_90_days_late * 0.15) +
    (Math.max(0, 1 - formData.monthly_income / 10000) * 0.2) +
    (Math.max(0, formData.number_of_dependents / 5) * 0.1);
  
  const probability = Math.min(0.95, Math.max(0.05, riskScore));
  
  let riskLabel: "LOW" | "MEDIUM" | "HIGH";
  if (probability < 0.33) riskLabel = "LOW";
  else if (probability < 0.66) riskLabel = "MEDIUM";
  else riskLabel = "HIGH";
  
  return {
    default_probability: probability,
    risk_label: riskLabel,
    top_factors: mockRiskFactors.slice(0, 3)
  };
}
