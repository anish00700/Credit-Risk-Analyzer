import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Shield, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  BarChart3
} from "lucide-react";

const About = () => {
  const riskTiers = [
    { label: "LOW RISK", range: "0-33%", color: "from-green-500 to-emerald-600", description: "Strong financial indicators, low default probability" },
    { label: "MEDIUM RISK", range: "33-66%", color: "from-yellow-500 to-orange-500", description: "Moderate risk factors, requires evaluation" },
    { label: "HIGH RISK", range: "66-100%", color: "from-red-500 to-rose-600", description: "Significant risk factors, manual review recommended" },
  ];

  const features = [
    { icon: Brain, title: "Machine Learning", description: "Advanced ML models trained on historical loan performance data" },
    { icon: Shield, title: "Regulatory Aligned", description: "Designed for FCRA compliance and fair lending standards" },
    { icon: TrendingUp, title: "High Accuracy", description: "94.7% high-risk detection recall with low false positive rate" },
    { icon: BarChart3, title: "SHAP Explanations", description: "Transparent feature attribution using industry-standard SHAP values" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 font-display">About Credit Risk Analyzer</h1>
          <p className="text-muted-foreground text-lg">Compliance, Methodology & Intended Use</p>
        </div>

        {/* What is it */}
        <Card className="mb-8 border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up">
          <h2 className="text-2xl font-bold mb-4 font-display">What is Credit Risk Analyzer?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Credit Risk Analyzer is an AI-powered decision support platform designed for financial analysts, loan officers, and underwriters in modern lending institutions.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The platform estimates the probability that a loan applicant will default on their obligations and provides explainable insights into the key factors driving that prediction. By combining machine learning with transparent explanations, we help institutions make faster, fairer, and more confident credit decisions.
          </p>
        </Card>

        {/* How it Works */}
        <Card className="mb-8 border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl font-bold mb-6 font-display">How the Score Works</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Model Training</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We train machine learning models on historical loan performance data, including both approved and declined applications. The model learns patterns that correlate with default outcomes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-lg bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Probability Output</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For each new applicant, the model outputs a default probability score from 0.0 (extremely unlikely to default) to 1.0 (very likely to default).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Risk Tier Assignment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  To simplify decision-making, we categorize probabilities into three risk tiers:
                </p>
                <div className="space-y-2">
                  {riskTiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Badge className={`bg-gradient-to-r ${tier.color} text-white border-0 font-semibold`}>
                        {tier.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {tier.range} - {tier.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Explainability & SHAP */}
        <Card className="mb-8 border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-2xl font-bold mb-4 font-display">Explainability & SHAP</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use <strong>SHAP (SHapley Additive exPlanations)</strong>, an industry-standard explainable AI technique, to attribute which features most increased or decreased the predicted risk for each individual applicant.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            SHAP values ensure fairness, clarity, and auditability by showing exactly how each input (debt ratio, income, credit history, etc.) contributed to the final prediction. This transparency is critical for regulatory compliance, bias detection, and building stakeholder trust.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
              <h4 className="font-semibold mb-1">Fairness</h4>
              <p className="text-sm text-muted-foreground">
                Consistent feature importance across all applicants ensures unbiased decisions
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
              <h4 className="font-semibold mb-1">Auditability</h4>
              <p className="text-sm text-muted-foreground">
                Every prediction can be traced back to specific input factors
              </p>
            </div>
          </div>
        </Card>

        {/* Key Features */}
        <Card className="mb-8 border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-2xl font-bold mb-6 font-display">Platform Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Intended Use */}
        <Card className="mb-8 border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-2xl font-bold mb-4 font-display">Intended Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            This tool is a <strong>decision support assistant</strong> for analysts and underwriters. It is designed to augment—not replace—human judgment in the credit decision process.
          </p>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Use predictions to prioritize manual review of high-risk applicants
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Leverage explanations to understand risk drivers and communicate decisions
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Always review high-risk cases manually before making final decisions
              </p>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="border-yellow-500/20 bg-yellow-500/5 p-6 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Important Disclaimer</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• For internal risk assessment use only. Not a consumer-facing credit score.</li>
                <li>• Predictions do not guarantee future performance. Past patterns may not repeat.</li>
                <li>• This tool should be used in conjunction with other credit evaluation methods.</li>
                <li>• Final credit decisions remain the responsibility of qualified lending personnel.</li>
                <li>• Regular model monitoring and validation are required for continued accuracy.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
