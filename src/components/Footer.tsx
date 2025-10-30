import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-1.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold font-display">Credit Risk Analyzer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered credit risk assessment platform for modern financial institutions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-display">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
              <li><a href="/assessment" className="hover:text-primary transition-colors">New Assessment</a></li>
              <li><a href="/explainability" className="hover:text-primary transition-colors">Insights</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-display">Compliance</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Fair Lending Standards</li>
              <li>FCRA Compliant</li>
              <li>Model Governance</li>
              <li>Audit Trail</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 Credit Risk Analyzer. For internal risk assessment use only.
            </p>
            <p className="text-xs text-muted-foreground/70 text-center md:text-right max-w-md">
              This tool provides decision support for credit analysts. Predictions do not guarantee future performance. Always review high-risk cases manually.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
