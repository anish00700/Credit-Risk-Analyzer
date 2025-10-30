import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, CheckCircle, AlertTriangle, AlertCircle, Wifi, WifiOff } from "lucide-react";
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
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 font-display">New Applicant Assessment</h1>
          <p className="text-muted-foreground">Enter applicant details below to generate a credit risk score</p>
          
          {/* Backend Status */}
          <div className="mt-4 flex justify-center">
            {backendAvailable === null ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking backend connection...</span>
              </div>
            ) : backendAvailable ? (
              <div className="flex items-center gap-2 text-green-600">
                <Wifi className="h-4 w-4" />
                <span>Backend connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span>Backend offline - using mock data</span>
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
        <Card className="mb-8 border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Applicant Profile */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-display">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Applicant Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Applicant's current age</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dependents">Number of Dependents</Label>
                  <Input
                    id="dependents"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.dependents}
                    onChange={(e) => handleChange("dependents", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Financial dependents under care</p>
                </div>
              </div>
            </div>

            {/* Financial Stability */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-display">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Financial Stability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="annual_income">Annual Income (₹)</Label>
                  <Input
                    id="annual_income"
                    type="number"
                    min="1000"
                    max="10000000"
                    step="1000"
                    value={formData.annual_income}
                    onChange={(e) => handleChange("annual_income", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Gross annual income before taxes</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debt_to_income_ratio">Debt-to-Income Ratio (0-1)</Label>
                  <Input
                    id="debt_to_income_ratio"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.debt_to_income_ratio}
                    onChange={(e) => handleChange("debt_to_income_ratio", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Total monthly debt / total monthly income</p>
                </div>
              </div>
            </div>

            {/* Credit Behavior */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-display">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Credit Behavior
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="revolving_utilization">Revolving Utilization (0-1)</Label>
                  <Input
                    id="revolving_utilization"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.revolving_utilization}
                    onChange={(e) => handleChange("revolving_utilization", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Balance / available credit on revolving accounts</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="open_credit_lines">Number of Open Credit Lines</Label>
                  <Input
                    id="open_credit_lines"
                    type="number"
                    min="0"
                    value={formData.open_credit_lines}
                    onChange={(e) => handleChange("open_credit_lines", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Active credit accounts (cards, loans, etc.)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delinquencies_2yrs">Delinquencies in Past 2 Years</Label>
                  <Input
                    id="delinquencies_2yrs"
                    type="number"
                    min="0"
                    value={formData.delinquencies_2yrs}
                    onChange={(e) => handleChange("delinquencies_2yrs", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Number of times payment was 90+ days overdue</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fico_score">FICO Credit Score</Label>
                  <Input
                    id="fico_score"
                    type="number"
                    min="300"
                    max="850"
                    value={formData.fico_score}
                    onChange={(e) => handleChange("fico_score", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Credit score (300-850)</p>
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-display">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Loan Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="loan_amount">Loan Amount (₹)</Label>
                  <Input
                    id="loan_amount"
                    type="number"
                    min="100"
                    value={formData.loan_amount}
                    onChange={(e) => handleChange("loan_amount", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">Requested loan amount</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_length">Employment Length (Years)</Label>
                  <Input
                    id="employment_length"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.employment_length}
                    onChange={(e) => handleChange("employment_length", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">Years in current employment</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Risk...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Risk Score
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results */}
        {result && (
          <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-scale-in">
            <div className="text-center mb-8">
              <div className="mb-4 inline-flex">{getRiskIcon()}</div>
              <h3 className="text-2xl font-bold mb-2 font-display">Assessment Complete</h3>
              <p className="text-muted-foreground">Risk analysis generated successfully</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2 font-display">
                  {(result.default_probability * 100).toFixed(1)}
                  <span className="text-3xl text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Default Probability</p>
              </div>

              <div className="relative h-4 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getRiskColor()} transition-all duration-1000`}
                  style={{ width: `${result.default_probability * 100}%` }}
                />
              </div>

              <div className="flex justify-center">
                <Badge className={`bg-gradient-to-r ${getRiskColor()} text-white border-0 px-6 py-2 text-lg font-semibold`}>
                  {result.risk_label} RISK
                </Badge>
              </div>

              <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
                {result.risk_label === "LOW" && (
                  <p className="text-center leading-relaxed">
                    ✓ This applicant is considered <strong>LOW RISK</strong>. Financial indicators suggest stable repayment capability. Recommended for standard approval process.
                  </p>
                )}
                {result.risk_label === "MEDIUM" && (
                  <p className="text-center leading-relaxed">
                    ⚠ This applicant is considered <strong>MEDIUM RISK</strong>. Some concerning factors present. Additional verification or adjusted terms may be appropriate.
                  </p>
                )}
                {result.risk_label === "HIGH" && (
                  <p className="text-center leading-relaxed">
                    ⚠ This applicant is considered <strong>HIGH RISK</strong>. Multiple risk factors indicate elevated default probability. <strong>Manual review is strongly recommended</strong> before approval.
                  </p>
                )}
              </div>

              {/* Top Risk Factors */}
              {result.top_factors && result.top_factors.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-center font-display">Key Risk Factors</h4>
                  <div className="space-y-3">
                    {result.top_factors.slice(0, 3).map((factor, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          factor.direction === 'increases_risk' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium capitalize">
                            {factor.feature.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {factor.human_readable_reason}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
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
