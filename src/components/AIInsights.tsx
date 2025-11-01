import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Brain,
  Target,
  Lightbulb,
  BarChart3,
  Loader2,
  X
} from "lucide-react";
import { apiService, ApiError, ApplicantData, PredictionResponse } from "@/services/api";

interface AIInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    id: string;
    name: string;
    insights: {
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

const AIInsights: React.FC<AIInsightsProps> = ({
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

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

  // AI Decision Intelligence
  const riskLabel = livePrediction?.risk_label || "UNKNOWN";
  const defaultProbability = livePrediction?.default_probability || 0;
  const applicantData = applicant.insights.applicantData;

  const getRecommendedAction = () => {
    if (riskLabel === "LOW") return "Approve";
    if (riskLabel === "MEDIUM") return "Approve with conditions";
    return "Manual review";
  };

  const getSuggestedRateBand = () => {
    if (riskLabel === "LOW") return "10% - 12% APR";
    if (riskLabel === "MEDIUM") return "14% - 18% APR";
    return "22% - 28% APR";
  };

  const getSuggestedTerm = () => {
    if (riskLabel === "LOW") return "48 - 60 months";
    if (riskLabel === "MEDIUM") return "36 - 48 months";
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-primary/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold font-display flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI-Powered Credit Intelligence
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Prediction Header */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold font-display">{applicant.name}</h3>
                <p className="text-muted-foreground font-mono text-sm">{applicant.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Brain className="h-4 w-4 text-primary" />
                  <p className="text-sm text-primary font-medium">Live AI Analysis powered by trained ML model</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge className={`${getRiskBadgeClass(riskLabel)} font-semibold text-sm px-3 py-1`}>
                  {riskLabel} RISK
                </Badge>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : livePrediction ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Live Analysis Complete
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Analysis Failed
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary font-display">
                  {loading ? "..." : formatPercentage(defaultProbability)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {loading ? "Calculating..." : "Live AI Predicted Default Probability"}
                </div>
                {livePrediction && (
                  <div className="text-xs text-green-600 mt-1">✓ Model Prediction</div>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 font-display">
                  {applicantData.fico_score}
                </div>
                <div className="text-sm text-muted-foreground">FICO Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 font-display">
                  ${applicantData.loan_amount?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Loan Amount</div>
              </div>
            </div>
          </Card>

          {error && (
            <Card className="p-4 border-red-500/20 bg-red-500/5">
              <AlertCircle className="h-4 w-4 text-red-500 mb-2" />
              <p className="text-sm text-red-600">{error}</p>
            </Card>
          )}

          {/* AI Decision Recommendations */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              AI Decision Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="p-4 bg-green-50/50 border-green-200">
                <div className="text-sm text-muted-foreground mb-1">Recommended Action</div>
                <div className="text-base font-semibold text-green-700">{getRecommendedAction()}</div>
              </Card>
              <Card className="p-4 bg-blue-50/50 border-blue-200">
                <div className="text-sm text-muted-foreground mb-1">Suggested Rate Band</div>
                <div className="text-base font-semibold text-blue-700">{getSuggestedRateBand()}</div>
              </Card>
              <Card className="p-4 bg-purple-50/50 border-purple-200">
                <div className="text-sm text-muted-foreground mb-1">Suggested Term</div>
                <div className="text-base font-semibold text-purple-700">{getSuggestedTerm()}</div>
              </Card>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <strong>Capacity Analysis:</strong> {capacityNote}
            </div>
          </Card>

          {/* Affordability & Capacity Analysis */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Affordability & Capacity
            </h4>
            {(() => {
              // Compute quick affordability metrics using suggested terms
              const amount = applicantData.loan_amount || 0;
              const annualRate = getSuggestedRateBand() === "10% - 12% APR" ? 0.11 : getSuggestedRateBand() === "14% - 18% APR" ? 0.16 : 0.25;
              const months = getSuggestedTerm().includes("60") ? 60 : getSuggestedTerm().includes("48") ? 48 : 36;
              const r = annualRate / 12;
              const emi = amount > 0 && r > 0 ? (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1) : 0;
              const monthlyIncome = (applicantData.annual_income || 0) / 12;
              const paymentToIncome = monthlyIncome > 0 ? emi / monthlyIncome : 0;
              const color = paymentToIncome < 0.25 ? "text-green-600" : paymentToIncome < 0.4 ? "text-yellow-600" : "text-red-600";
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Estimated Monthly EMI</div>
                    <div className="text-base font-semibold">${Math.round(emi).toLocaleString()}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Payment / Income</div>
                    <div className={`text-base font-semibold ${color}`}>{(paymentToIncome * 100).toFixed(1)}%</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Debt-to-Income (DTI)</div>
                    <div className="text-base font-semibold">{(applicantData.debt_to_income_ratio * 100).toFixed(1)}%</div>
                  </Card>
                </div>
              );
            })()}
            <div className="mt-3 text-sm text-muted-foreground">{capacityNote}</div>
          </Card>

          {/* AI Risk Factor Analysis */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">Live AI Risk Factor Analysis</span>
              {livePrediction && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-500/30">
                  <Brain className="h-3 w-3 mr-1" />
                  Live SHAP Analysis
                </Badge>
              )}
            </h4>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Running SHAP analysis...</span>
              </div>
            ) : livePrediction ? (
              <div className="space-y-4">
                <div className="mb-4 p-3 bg-green-50/50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Live Model Analysis Complete</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    SHAP values calculated from trained model for this specific applicant
                  </p>
                </div>
                {livePrediction.top_factors.map((factor, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      factor.direction === "increases_risk"
                        ? "border-red-500 bg-red-50/50"
                        : "border-green-500 bg-green-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-sm">
                        {factor.feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h5>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            factor.direction === "increases_risk"
                              ? "text-red-600 border-red-500/30"
                              : "text-green-600 border-green-500/30"
                          }
                        >
                          {factor.direction === "increases_risk" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {formatPercentage(factor.impact)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {factor.human_readable_reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Unable to generate live AI analysis</p>
                <p className="text-sm">Please check backend connection</p>
              </div>
            )}
          </Card>

          {/* Scenario Analysis (What-if) */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Scenario Analysis (What-if)
            </h4>
            {livePrediction ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const factors = livePrediction.top_factors;
                  const utilization = factors.find(f => /utilization|revolving/i.test(f.feature));
                  const dti = factors.find(f => /debt|dti|income/i.test(f.feature));
                  const delin = factors.find(f => /delinquenc/i.test(f.feature));
                  const cards: Array<{ title: string; desc: string; delta: number }>[] = [] as any;
                  const items: Array<{ title: string; desc: string; delta: number }> = [];
                  if (utilization) items.push({ title: "Reduce Utilization by 20%", desc: "Pay down revolving balances to lower utilization.", delta: -(utilization.impact * 0.2) });
                  if (dti) items.push({ title: "Reduce DTI by 10%", desc: "Increase income or reduce obligations.", delta: -(dti.impact * 0.15) });
                  if (delin) items.push({ title: "6 Months On-time Payments", desc: "Improve recent payment behavior.", delta: -(delin.impact * 0.1) });
                  return items.slice(0, 3).map((it, idx) => (
                    <Card key={idx} className="p-4 bg-muted/30">
                      <div className="font-medium mb-1">{it.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">{it.desc}</div>
                      <div className="text-sm">
                        Estimated change in default probability: <span className="font-semibold text-green-600">{(Math.max(-0.15, it.delta) * 100).toFixed(1)}%</span>
                      </div>
                    </Card>
                  ));
                })()}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Live model prediction required for what-if scenarios.</div>
            )}
          </Card>

          {/* Data Inputs Used */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Data Inputs Used for Analysis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-muted-foreground">Age:</span> <span className="font-medium">{applicantData.age}</span></div>
              <div><span className="text-muted-foreground">Annual Income:</span> <span className="font-medium">${applicantData.annual_income.toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">DTI:</span> <span className="font-medium">{(applicantData.debt_to_income_ratio * 100).toFixed(1)}%</span></div>
              <div><span className="text-muted-foreground">Utilization:</span> <span className="font-medium">{(applicantData.revolving_utilization * 100).toFixed(1)}%</span></div>
              <div><span className="text-muted-foreground">Open Lines:</span> <span className="font-medium">{applicantData.open_credit_lines}</span></div>
              <div><span className="text-muted-foreground">Delinquencies (2y):</span> <span className="font-medium">{applicantData.delinquencies_2yrs}</span></div>
              <div><span className="text-muted-foreground">Dependents:</span> <span className="font-medium">{applicantData.dependents}</span></div>
              <div><span className="text-muted-foreground">FICO Score:</span> <span className="font-medium">{applicantData.fico_score}</span></div>
              <div><span className="text-muted-foreground">Loan Amount:</span> <span className="font-medium">${(applicantData.loan_amount || 0).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Employment Length:</span> <span className="font-medium">{applicantData.employment_length} years</span></div>
            </div>
          </Card>

          {/* Actionable Improvements */}
          {actionableImprovements.length > 0 && (
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Actionable Improvements
              </h4>
              <div className="space-y-3">
                {actionableImprovements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{improvement.feature}</div>
                      <div className="text-sm text-muted-foreground">{improvement.tip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Model Info */}
          <Card className="p-6 border-primary/20 bg-primary/5">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Model Information
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>This analysis is powered by a trained machine learning model using SHAP (SHapley Additive exPlanations) values.</p>
              <p>Model Version: {livePrediction?.model_version || '1.0.0'}</p>
              <p>Analysis generated: {new Date().toLocaleString()}</p>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIInsights;
