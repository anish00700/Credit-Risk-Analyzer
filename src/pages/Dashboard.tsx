import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, AlertCircle, Activity, Wifi, WifiOff, Loader2, RefreshCw, Eye } from "lucide-react";
import { mockApplicants, mockDashboardStats } from "@/utils/mockData";
import { apiService } from "@/services/api";
import ApplicationInsights from "@/components/ApplicationInsights";

const Dashboard = () => {
  const [filter, setFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Check backend availability on component mount
  useEffect(() => {
    const checkBackend = async () => {
      const available = await apiService.isBackendAvailable();
      setBackendAvailable(available);
    };
    checkBackend();
  }, []);

  const generateSampleData = async () => {
    setIsGeneratingData(true);
    // Simulate generating sample data
    setTimeout(() => {
      setIsGeneratingData(false);
    }, 2000);
  };

  const handleViewInsights = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsInsightsOpen(true);
  };

  const handleCloseInsights = () => {
    setIsInsightsOpen(false);
    setSelectedApplicant(null);
  };

  const filteredApplicants = filter === "ALL" 
    ? mockApplicants 
    : mockApplicants.filter(app => app.riskTier === filter);

  const stats = [
    {
      label: "High Risk Applicants",
      value: `${mockDashboardStats.highRiskPercent}%`,
      change: "+2.3%",
      trend: "up" as const,
      icon: AlertCircle,
      color: "text-red-500"
    },
    {
      label: "Avg Default Probability",
      value: `${(mockDashboardStats.avgDefaultProb * 100).toFixed(1)}%`,
      change: "-1.2%",
      trend: "down" as const,
      icon: Activity,
      color: "text-primary"
    },
    {
      label: "Approval Confidence",
      value: `${mockDashboardStats.approvalConfidence}%`,
      change: "+0.8%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-green-500"
    },
  ];

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

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-display">Portfolio Risk Overview</h1>
            <p className="text-muted-foreground">Aggregated view of current applicant risk levels</p>
            
            {/* Backend Status */}
            <div className="mt-2 flex items-center gap-2">
              {backendAvailable === null ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Checking backend connection...</span>
                </div>
              ) : backendAvailable ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Backend connected - Live data</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Backend offline - Sample data</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {backendAvailable && (
              <Button
                onClick={generateSampleData}
                disabled={isGeneratingData}
                variant="outline"
                size="sm"
                className="mb-2"
              >
                {isGeneratingData ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Sample Data
                  </>
                )}
              </Button>
            )}
            
            {["ALL", "LOW", "MEDIUM", "HIGH"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f as any)}
                className={filter === f ? "bg-gradient-to-r from-primary to-secondary" : ""}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" ? "text-red-500" : "text-green-500"
                    }`}>
                      <TrendIcon className="h-3 w-3" />
                      {stat.change}
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold mb-1 font-display">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Risk Distribution */}
        <Card className="mb-8 border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-xl font-semibold mb-6 font-display">Risk Tier Breakdown</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  Low Risk
                </span>
                <span className="text-sm font-semibold">{mockDashboardStats.riskDistribution.low}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000"
                  style={{ width: `${mockDashboardStats.riskDistribution.low}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  Medium Risk
                </span>
                <span className="text-sm font-semibold">{mockDashboardStats.riskDistribution.medium}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
                  style={{ width: `${mockDashboardStats.riskDistribution.medium}%`, animationDelay: "0.2s" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  High Risk
                </span>
                <span className="text-sm font-semibold">{mockDashboardStats.riskDistribution.high}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-1000"
                  style={{ width: `${mockDashboardStats.riskDistribution.high}%`, animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Applicants Table */}
        <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <h3 className="text-xl font-semibold mb-6 font-display">Recent Applicants</h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Applicant ID</TableHead>
                  <TableHead className="font-semibold">Default Probability</TableHead>
                  <TableHead className="font-semibold">Risk Tier</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.map((applicant, index) => (
                  <TableRow
                    key={applicant.id}
                    className="border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                    style={{
                      animation: "fade-in 0.5s ease-out forwards",
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0
                    }}
                    onClick={() => handleViewInsights(applicant)}
                  >
                    <TableCell className="font-medium">
                      {applicant.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {applicant.id}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {(applicant.defaultProbability * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRiskBadgeClass(applicant.riskTier)} font-semibold`}>
                        {applicant.riskTier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(applicant.status)}>
                        {applicant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {applicant.timestamp}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInsights(applicant);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Application Insights Modal */}
      <ApplicationInsights
        isOpen={isInsightsOpen}
        onClose={handleCloseInsights}
        applicant={selectedApplicant}
      />
    </div>
  );
};

export default Dashboard;
