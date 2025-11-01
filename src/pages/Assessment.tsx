import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, CheckCircle, AlertTriangle, AlertCircle, Wifi, WifiOff, User, DollarSign, CreditCard, TrendingUp, Briefcase } from "lucide-react";
import { apiService, ApplicantData, PredictionResponse, ApiError } from "@/services/api";
import { addApplication, generateApplicationId } from "@/utils/applicationsStore";
import { useNavigate } from "react-router-dom";

const Assessment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: 35,
    annual_income: 5000 * 12, // Convert to annual income
    debt_to_income_ratio: 0.45,
    revolving_utilization: 0.6,
    open_credit_lines: 5,
    delinquencies_2yrs: 2,
    dependents: 1,
    fico_score: 720,
    loan_amount: 25000,
    employment_length: 5,
  });

  // Check backend availability on component mount
  useEffect(() => {
    const checkBackend = async () => {
      const available = await apiService.isBackendAvailable();
      setBackendAvailable(available);
    };
    checkBackend();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'name' ? value : (parseFloat(value) || 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Prepare data for API
      const applicantData: ApplicantData = {
        name: formData.name,
        age: formData.age,
        annual_income: formData.annual_income,
        debt_to_income_ratio: formData.debt_to_income_ratio,
        revolving_utilization: formData.revolving_utilization,
        open_credit_lines: formData.open_credit_lines,
        delinquencies_2yrs: formData.delinquencies_2yrs,
        dependents: formData.dependents,
        fico_score: formData.fico_score,
        loan_amount: formData.loan_amount,
        employment_length: formData.employment_length,
      };
      
      console.log('Sending to API:', applicantData);

      // Call backend API
      const prediction = await apiService.predictCreditRisk(applicantData);
      setResult(prediction);

      // Persist to applications store with AI insights
      const id = generateApplicationId();
      addApplication({
        id,
        name: formData.name || "New Applicant",
        defaultProbability: prediction.default_probability,
        riskTier: prediction.risk_label,
        status: prediction.risk_label === "HIGH" ? "Manual Hold" : prediction.risk_label === "MEDIUM" ? "Review" : "Auto-Approved",
        timestamp: "Just now",
        insights: {
          summary: `AI-generated insights for ${formData.name || "applicant"}`,
          topFactors: prediction.top_factors.map((f) => ({
            feature: f.feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            impact: f.impact,
            direction: f.direction as any,
            description: f.human_readable_reason,
          })),
          recommendations: [
            prediction.risk_label === "HIGH" ? "Manual review recommended" : "Proceed with standard terms",
          ],
          applicantData: {
            age: formData.age,
            annual_income: formData.annual_income,
            debt_to_income_ratio: formData.debt_to_income_ratio,
            revolving_utilization: formData.revolving_utilization,
            open_credit_lines: formData.open_credit_lines,
            delinquencies_2yrs: formData.delinquencies_2yrs,
            dependents: formData.dependents,
            fico_score: formData.fico_score,
            loan_amount: formData.loan_amount,
            employment_length: formData.employment_length,
          },
        },
      });

      // Navigate to Insights and auto-open modal via query param
      navigate(`/insights?id=${encodeURIComponent(id)}`);
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API Error (${err.status}): ${err.message}`);
      } else {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskIcon = () => {
    if (!result) return null;
    switch (result.risk_label) {
      case "LOW":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "MEDIUM":
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case "HIGH":
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    if (!result) return "";
    switch (result.risk_label) {
      case "LOW":
        return "from-green-500 to-emerald-600";
      case "MEDIUM":
        return "from-yellow-500 to-orange-500";
      case "HIGH":
        return "from-red-500 to-rose-600";
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-display tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Credit Risk Assessment
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter applicant financial and demographic information to generate an AI-powered credit risk analysis with explainable insights
          </p>
          
          {/* Backend Status */}
          <div className="mt-6 flex justify-center">
            {backendAvailable === null ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking backend connection...</span>
              </div>
            ) : backendAvailable ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-600 font-medium">
                <Wifi className="h-4 w-4" />
                <span>Backend Connected - Live AI Analysis</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 font-medium">
                <WifiOff className="h-4 w-4" />
                <span>Backend Offline - Using Mock Data</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-8 border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <Card className="mb-8 border border-border/50 bg-card shadow-xl shadow-black/5 p-8 sm:p-10 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Applicant Profile */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display tracking-tight">Applicant Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5 md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="age" className="text-sm font-semibold text-foreground">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Applicant's current age in years</p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="dependents" className="text-sm font-semibold text-foreground">
                    Number of Dependents <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dependents"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.dependents}
                    onChange={(e) => handleChange("dependents", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Financial dependents under care</p>
                </div>
              </div>
            </div>

            {/* Financial Stability */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display tracking-tight">Financial Stability</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="annual_income" className="text-sm font-semibold text-foreground">
                    Annual Income ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="annual_income"
                    type="number"
                    min="1000"
                    max="10000000"
                    step="1000"
                    value={formData.annual_income}
                    onChange={(e) => handleChange("annual_income", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Gross annual income before taxes</p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="debt_to_income_ratio" className="text-sm font-semibold text-foreground">
                    Debt-to-Income Ratio (0-1) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="debt_to_income_ratio"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.debt_to_income_ratio}
                    onChange={(e) => handleChange("debt_to_income_ratio", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Total monthly debt payments / total monthly income</p>
                </div>
              </div>
            </div>

            {/* Credit Behavior */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display tracking-tight">Credit Behavior</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="revolving_utilization" className="text-sm font-semibold text-foreground">
                    Revolving Utilization (0-1) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="revolving_utilization"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.revolving_utilization}
                    onChange={(e) => handleChange("revolving_utilization", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Balance / available credit on revolving accounts</p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="open_credit_lines" className="text-sm font-semibold text-foreground">
                    Number of Open Credit Lines <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="open_credit_lines"
                    type="number"
                    min="0"
                    value={formData.open_credit_lines}
                    onChange={(e) => handleChange("open_credit_lines", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Active credit accounts (cards, loans, etc.)</p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="delinquencies_2yrs" className="text-sm font-semibold text-foreground">
                    Delinquencies in Past 2 Years (DPD) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="delinquencies_2yrs"
                    type="number"
                    min="0"
                    value={formData.delinquencies_2yrs}
                    onChange={(e) => handleChange("delinquencies_2yrs", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Number of times payment was 90+ days overdue (DPD 90+)</p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="fico_score" className="text-sm font-semibold text-foreground">
                    FICO Credit Score (CIBIL) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fico_score"
                    type="number"
                    min="300"
                    max="850"
                    value={formData.fico_score}
                    onChange={(e) => handleChange("fico_score", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Credit score (FICO 300–850, CIBIL 300–900)</p>
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display tracking-tight">Loan Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="loan_amount" className="text-sm font-semibold text-foreground">
                    Loan Amount ($)
                  </Label>
                  <Input
                    id="loan_amount"
                    type="number"
                    min="100"
                    value={formData.loan_amount}
                    onChange={(e) => handleChange("loan_amount", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Requested loan amount</p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="employment_length" className="text-sm font-semibold text-foreground">
                    Employment Length (Years)
                  </Label>
                  <Input
                    id="employment_length"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.employment_length}
                    onChange={(e) => handleChange("employment_length", e.target.value)}
                    className="h-11 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50 border-border/80"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">Years in current employment</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.01] transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Risk...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Risk Assessment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Results */}
        {result && (
          <Card className="border border-border/50 bg-card shadow-xl shadow-black/5 p-8 sm:p-10 animate-scale-in">
            <div className="text-center mb-10">
              <div className="mb-5 inline-flex scale-125">{getRiskIcon()}</div>
              <h3 className="text-3xl sm:text-4xl font-bold mb-3 font-display tracking-tight">Assessment Complete</h3>
              <p className="text-base text-muted-foreground">AI-powered risk analysis generated successfully</p>
            </div>

            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="text-7xl sm:text-8xl font-bold mb-3 font-display tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {(result.default_probability * 100).toFixed(1)}
                  <span className="text-4xl sm:text-5xl text-muted-foreground">%</span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Default Probability</p>
              </div>

              <div className="space-y-2">
                <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${getRiskColor()} transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${result.default_probability * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Risk (0%)</span>
                  <span>High Risk (100%)</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Badge className={`bg-gradient-to-r ${getRiskColor()} text-white border-0 px-6 py-2.5 text-base font-bold shadow-lg`}>
                  {result.risk_label} RISK
                </Badge>
              </div>

              <div className="rounded-xl border-2 border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 p-6 sm:p-8">
                {result.risk_label === "LOW" && (
                  <div className="text-center space-y-2">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-base leading-relaxed text-foreground">
                      This applicant is considered <strong className="text-green-600">LOW RISK</strong>. Financial indicators suggest stable repayment capability. Recommended for standard approval process.
                    </p>
                  </div>
                )}
                {result.risk_label === "MEDIUM" && (
                  <div className="text-center space-y-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-base leading-relaxed text-foreground">
                      This applicant is considered <strong className="text-yellow-600">MEDIUM RISK</strong>. Some concerning factors present. Additional verification or adjusted terms may be appropriate.
                    </p>
                  </div>
                )}
                {result.risk_label === "HIGH" && (
                  <div className="text-center space-y-2">
                    <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-base leading-relaxed text-foreground">
                      This applicant is considered <strong className="text-red-600">HIGH RISK</strong>. Multiple risk factors indicate elevated default probability. <strong className="text-red-600">Manual review is strongly recommended</strong> before approval.
                    </p>
                  </div>
                )}
              </div>

              {/* Top Risk Factors */}
              {result.top_factors && result.top_factors.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h4 className="text-2xl sm:text-3xl font-extrabold text-center font-display tracking-tight">
                      Key Risk Factors
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {result.top_factors.slice(0, 3).map((factor, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-4 p-4 sm:p-5 rounded-xl border-2 ${
                          factor.direction === 'increases_risk' 
                            ? 'border-red-500/30 bg-red-500/5' 
                            : 'border-green-500/30 bg-green-500/5'
                        } transition-all hover:shadow-md`}
                      >
                        <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                          factor.direction === 'increases_risk' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base mb-1.5 capitalize text-foreground">
                            {factor.feature.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {factor.human_readable_reason}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-foreground flex-shrink-0">
                          {(factor.impact * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Assessment;
