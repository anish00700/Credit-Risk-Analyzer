import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Brain, Loader2, Sparkles } from "lucide-react";

interface AIPrepareDialogProps {
  open: boolean;
}

const AIPrepareDialog: React.FC<AIPrepareDialogProps> = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md border-primary/20 bg-background/95 backdrop-blur-xl animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-lg font-semibold">Generating AI Report</div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Running model inference and SHAP analysis...</span>
        </div>
        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-primary to-secondary animate-[progress_1.2s_ease_infinite]" />
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Optimizing explanations...</span>
        </div>
        <style>{`
          @keyframes progress { 0%{transform:translateX(-100%)} 50%{transform:translateX(20%)} 100%{transform:translateX(120%)} }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AIPrepareDialog;


