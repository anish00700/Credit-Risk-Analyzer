import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiService, ApiError, ApplicantData, PredictionResponse } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  User, 
  IndianRupee, 
  CreditCard, 
  Calendar,
  X
} from "lucide-react";

interface ApplicationInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    id: string;
    name: string;
    defaultProbability: number;
    riskTier: string;
    status: string;
    timestamp: string;
    insights: {
      summary: string;
      topFactors: Array<{
        feature: string;
        impact: number;
        direction: "increases_risk" | "decreases_risk";
        description: string;
      }>;
      recommendations: string[];
      applicantData: {
        age: number;
        annual_income: number;
        debt_to_income_ratio: number;
        revolving_utilization: number;
        open_credit_lines: number;
        delinquencies_2yrs: number;
        dependents: number;
        fico_score: number;
        loan_amount: number;
        employment_length: number;
      };
    };
  };
}

const ApplicationInsights: React.FC<ApplicationInsightsProps> = ({
  isOpen,
  onClose,
  applicant
}) => {
  if (!applicant) return null;

  const [livePrediction, setLivePrediction] = React.useState<PredictionResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPrediction = async () => {
      if (!isOpen || !applicant?.insights?.applicantData) return;
      try {
        setLoading(true);
        setError(null);
        const payload: ApplicantData = {
          age: applicant.insights.applicantData.age,
          annual_income: applicant.insights.applicantData.annual_income,
          debt_to_income_ratio: applicant.insights.applicantData.debt_to_income_ratio,
          revolving_utilization: applicant.insights.applicantData.revolving_utilization,
          open_credit_lines: applicant.insights.applicantData.open_credit_lines,
          delinquencies_2yrs: applicant.insights.applicantData.delinquencies_2yrs,
          dependents: applicant.insights.applicantData.dependents,
          fico_score: applicant.insights.applicantData.fico_score,
          loan_amount: applicant.insights.applicantData.loan_amount,
          employment_length: applicant.insights.applicantData.employment_length,
        };
        const prediction = await apiService.predictCreditRisk(payload);
        setLivePrediction(prediction);
      } catch (e) {
        setLivePrediction(null);
        if (e instanceof ApiError) setError(`API Error (${e.status}): ${e.message}`);
        else if (e instanceof Error) setError(e.message);
        else setError("Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [isOpen, applicant?.id]);

  const getRiskBadgeClass = (tier: string) => {
    switch (tier) {
      case "LOW":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0";
      case "HIGH":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0";
      default:
        return "";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Auto-Approved":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Manual Hold":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Review":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // --- Decision assistant helpers ---
  const resolvedRiskLabel = (livePrediction?.risk_label || applicant.riskTier) as "LOW" | "MEDIUM" | "HIGH";
  const resolvedProbability = livePrediction?.default_probability ?? applicant.defaultProbability;
  const applicantData = applicant.insights.applicantData;

  const getRecommendedAction = () => {
    if (resolvedRiskLabel === "LOW") return "Approve";
    if (resolvedRiskLabel === "MEDIUM") return "Approve with conditions";
    return "Manual review";
  };

  const getSuggestedRateBand = () => {
    // Simple tiered guidance; plug real pricing model here if available
    if (resolvedRiskLabel === "LOW") return "10% - 12% APR";
    if (resolvedRiskLabel === "MEDIUM") return "14% - 18% APR";
    return "22% - 28% APR";
  };

  const getSuggestedTerm = () => {
    if (resolvedRiskLabel === "LOW") return "48 - 60 months";
    if (resolvedRiskLabel === "MEDIUM") return "36 - 48 months";
    return "24 - 36 months";
  };

  const loanToIncome = applicantData.annual_income > 0 ? (applicantData.loan_amount || 0) / applicantData.annual_income : 0;
  const capacityNote = loanToIncome > 0.6
    ? "High loan-to-income ratio; consider reducing amount or extending term."
    : loanToIncome > 0.4
    ? "Moderate loan-to-income; ensure terms remain affordable."
    : "Healthy loan-to-income profile.";

  const actionableImprovements = (livePrediction?.top_factors || []).filter(f => f.direction === "increases_risk").slice(0, 3).map((f) => {
    const feature = f.feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    let tip = "Lower this risk driver to improve approval odds.";
    if (/debt|dti|income/i.test(f.feature)) tip = "Lower debt-to-income ratio below 40% by reducing obligations or increasing income.";
    else if (/utilization|revolving/i.test(f.feature)) tip = "Reduce revolving utilization under 30% by paying down card balances.";
    else if (/delinquenc/i.test(f.feature)) tip = "Avoid late payments for 6-12 months to improve credit behavior.";
    else if (/fico|credit/i.test(f.feature)) tip = "Improve credit score by lowering balances and maintaining on-time payments.";
    return { feature, impact: f.impact, tip };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="text-3xl font-bold font-display tracking-tight">
            Application Insights
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">Comprehensive credit risk analysis and recommendations</p>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Applicant Header */}
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border-2 border-primary/20 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-display tracking-tight">{applicant.name}</h3>
                <p className="text-muted-foreground font-mono text-sm">{applicant.id}</p>
                <p className="text-muted-foreground text-sm">{applicant.timestamp}</p>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end">
                <Badge className={`${getRiskBadgeClass(livePrediction?.risk_label || applicant.riskTier)} font-bold text-sm px-4 py-1.5 shadow-md`}>
                  {(livePrediction?.risk_label || applicant.riskTier)} RISK
                </Badge>
                <Badge variant="outline" className={`${getStatusBadgeClass(applicant.status)} font-semibold`}>
                  {applicant.status}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/30">
              <div className="text-center space-y-1">
                <div className="text-4xl font-bold text-primary font-display tracking-tight">
                  {formatPercentage(livePrediction?.default_probability ?? applicant.defaultProbability)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Default Probability</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-green-600 font-display tracking-tight">
                  {formatCurrency(applicant.insights.applicantData.loan_amount)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Loan Amount</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-blue-600 font-display tracking-tight">
                  {applicant.insights.applicantData.fico_score}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Credit Score (FICO/CIBIL)</div>
              </div>
            </div>
          </Card>

          {error && (
            <Card className="p-4 border-red-500/20 bg-red-500/5">
              <p className="text-sm text-red-600">{error}</p>
            </Card>
          )}

          {/* Summary */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Risk Assessment Summary
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {applicant.insights.summary}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Recommended Action</div>
                <div className="text-base font-semibold">{getRecommendedAction()}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Suggested Rate Band</div>
                <div className="text-base font-semibold">{getSuggestedRateBand()}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Suggested Term</div>
                <div className="text-base font-semibold">{getSuggestedTerm()}</div>
              </Card>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">{capacityNote}</div>
          </Card>

          {/* Top Risk Factors */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border/50">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h4 className="text-2xl font-extrabold tracking-tight font-display">Key Risk Factors</h4>
            </div>
            <div className="space-y-4">
              {(livePrediction ? livePrediction.top_factors.map(f => ({
                feature: f.feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                impact: f.impact,
                direction: f.direction as "increases_risk" | "decreases_risk",
                description: f.human_readable_reason,
              })) : applicant.insights.topFactors).map((factor, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                    factor.direction === "increases_risk"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-green-500/30 bg-green-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-bold text-base text-foreground capitalize">{factor.feature}</h5>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`font-semibold ${
                          factor.direction === "increases_risk"
                            ? "text-red-600 border-red-500/40 bg-red-500/10"
                            : "text-green-600 border-green-500/40 bg-green-500/10"
                        }`}
                      >
                        {factor.direction === "increases_risk" ? (
                          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {formatPercentage(factor.impact)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
            {actionableImprovements.length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-semibold mb-2">Actionable Improvements</h5>
                <div className="space-y-2">
                  {actionableImprovements.map((it, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      <span className="font-medium">{it.feature}:</span> {it.tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Applicant Details */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Applicant Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Age</div>
                    <div className="text-sm text-muted-foreground">{applicant.insights.applicantData.age} years</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Annual Income</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(applicant.insights.applicantData.annual_income)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Debt-to-Income Ratio</div>
                    <div className="text-sm text-muted-foreground">{formatPercentage(applicant.insights.applicantData.debt_to_income_ratio)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Credit Utilization</div>
                    <div className="text-sm text-muted-foreground">{formatPercentage(applicant.insights.applicantData.revolving_utilization)}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Open Credit Lines</div>
                    <div className="text-sm text-muted-foreground">{applicant.insights.applicantData.open_credit_lines}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Recent Delinquencies</div>
                    <div className="text-sm text-muted-foreground">{applicant.insights.applicantData.delinquencies_2yrs}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Dependents</div>
                    <div className="text-sm text-muted-foreground">{applicant.insights.applicantData.dependents}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Employment Length</div>
                    <div className="text-sm text-muted-foreground">{applicant.insights.applicantData.employment_length} years</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Recommendations
            </h4>
            <div className="space-y-3">
              {applicant.insights.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationInsights;
