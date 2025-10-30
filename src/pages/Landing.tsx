import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Shield, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Brain,
  FileCheck,
  Sparkles
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const kpis = [
    { label: "Scoring Latency", value: "<99ms", icon: Zap },
    { label: "Explainable Decisions", value: "100%", icon: Brain },
    { label: "Regulatory Aligned", value: "FCRA", icon: Shield },
    { label: "Detection Recall", value: "94.7%", icon: TrendingUp },
  ];

  const steps = [
    {
      number: "01",
      title: "Input Applicant Data",
      description: "Enter financial and demographic information through our intuitive form interface.",
      icon: FileCheck,
    },
    {
      number: "02",
      title: "Model Predicts Risk",
      description: "AI model analyzes patterns and outputs default probability in milliseconds.",
      icon: Brain,
    },
    {
      number: "03",
      title: "SHAP Explains Drivers",
      description: "Understand exactly which factors increase or decrease risk for this applicant.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-primary/20 blur-[120px] animate-float" />
          <div className="absolute bottom-20 right-10 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Next-Gen Risk Intelligence</span>
            </div>

            <h1 className="mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-6xl font-bold text-transparent md:text-7xl font-display animate-slide-up leading-tight md:leading-[1.05]">
              AI-Powered Credit Risk Intelligence
            </h1>

            <p className="mb-10 text-xl text-muted-foreground md:text-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Predict default probability. Understand why. Approve with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <Button
                size="lg"
                onClick={() => navigate("/assessment")}
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                <span className="relative flex items-center gap-2">
                  Start Assessment
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="text-lg font-semibold border-2 hover:bg-muted/50"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="py-16 border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/30 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
                  <Icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                  <div className="text-3xl font-bold text-foreground font-display mb-1">{kpi.value}</div>
                  <div className="text-sm text-muted-foreground">{kpi.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-display">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to intelligent credit decisioning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/30 hover:scale-105 animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-secondary/10 blur-3xl transition-all group-hover:bg-secondary/20" />
                  
                  <div className="relative">
                    <div className="mb-4 text-6xl font-bold text-primary/20 font-display">
                      {step.number}
                    </div>
                    
                    <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-primary to-secondary p-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold mb-3 font-display">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold mb-6 font-display">
                Why Explainable Risk Matters
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Prevent Defaults</h3>
                    <p className="text-muted-foreground">
                      Identify high-risk applicants before approval, reducing portfolio losses and protecting capital.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Reduce Bias</h3>
                    <p className="text-muted-foreground">
                      Transparent factor analysis ensures fair lending practices and compliance with regulations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Build Trust</h3>
                    <p className="text-muted-foreground">
                      Clear explanations help analysts understand and communicate credit decisions with confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl rounded-3xl" />
              <Card className="relative border-border/50 bg-card/80 p-12 backdrop-blur-sm">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-glow-pulse rounded-full" />
                    <Shield className="relative h-32 w-32 text-primary" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="text-5xl font-bold mb-2 font-display">94.7%</div>
                  <div className="text-muted-foreground">High-Risk Detection Recall</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-secondary/20 blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 font-display">
            Credit decisions don't have to be a black box
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start making transparent, AI-powered credit decisions today
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/assessment")}
            className="bg-gradient-to-r from-primary to-secondary text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Begin Your First Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
