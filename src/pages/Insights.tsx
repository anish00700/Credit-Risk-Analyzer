import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  User,
  DollarSign,
  CreditCard,
  Activity,
  Wifi,
  WifiOff,
  Loader2
} from "lucide-react";
import { loadApplications } from "@/utils/applicationsStore";
import { apiService } from "@/services/api";
import ApplicationInsights from "@/components/ApplicationInsights";
import AIInsights from "@/components/AIInsights";
import AIPrepareDialog from "@/components/AIPrepareDialog";

const Insights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicants, setApplicants] = useState(loadApplications());
  const [filteredApplicants, setFilteredApplicants] = useState(loadApplications());
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Auto-Approved" | "Manual Hold" | "Review">("ALL");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const [isAIPrepareOpen, setIsAIPrepareOpen] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  // Load apps and check backend availability on mount
  useEffect(() => {
    setApplicants(loadApplications());
    setFilteredApplicants(loadApplications());
    const checkBackend = async () => {
      const available = await apiService.isBackendAvailable();
      setBackendAvailable(available);
    };
    checkBackend();
  }, []);

  // If navigated with ?id=..., auto-open insights modal for that applicant
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      const app = loadApplications().find(a => a.id === id);
      if (app) {
        setSelectedApplicant(app);
        setIsInsightsOpen(true);
      }
    }
  }, [location.search]);

  // Filter applicants based on search and filters
  useEffect(() => {
    let filtered = applicants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk filter
    if (riskFilter !== "ALL") {
      filtered = filtered.filter(applicant => applicant.riskTier === riskFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(applicant => applicant.status === statusFilter);
    }

    setFilteredApplicants(filtered);
  }, [applicants, searchTerm, riskFilter, statusFilter]);

  const handleViewInsights = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsInsightsOpen(true);
  };

  const handleCloseInsights = () => {
    setIsInsightsOpen(false);
    setSelectedApplicant(null);
  };

  const handleCloseAIInsights = () => {
    setIsAIInsightsOpen(false);
    setSelectedApplicant(null);
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

  // Calculate statistics
  const totalApplicants = applicants.length;
  const lowRiskCount = applicants.filter(app => app.riskTier === "LOW").length;
  const mediumRiskCount = applicants.filter(app => app.riskTier === "MEDIUM").length;
  const highRiskCount = applicants.filter(app => app.riskTier === "HIGH").length;
  const avgDefaultProb = applicants.reduce((sum, app) => sum + app.defaultProbability, 0) / totalApplicants;

  const stats = [
    {
      label: "Total Applications",
      value: totalApplicants.toString(),
      icon: User,
      color: "text-blue-500"
    },
    {
      label: "Low Risk",
      value: lowRiskCount.toString(),
      icon: TrendingDown,
      color: "text-green-500"
    },
    {
      label: "Medium Risk",
      value: mediumRiskCount.toString(),
      icon: Activity,
      color: "text-yellow-500"
    },
    {
      label: "High Risk",
      value: highRiskCount.toString(),
      icon: AlertCircle,
      color: "text-red-500"
    },
    {
      label: "Avg Default Probability",
      value: `${(avgDefaultProb * 100).toFixed(1)}%`,
      icon: CreditCard,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-display">Application Insights</h1>
            <p className="text-muted-foreground">Comprehensive analysis of all credit applications</p>
            
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
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5 blur-xl transition-all group-hover:bg-primary/10" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  
                  <div className="text-2xl font-bold mb-1 font-display">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Risk:</span>
                {["ALL", "LOW", "MEDIUM", "HIGH"].map((filter) => (
                  <Button
                    key={filter}
                    variant={riskFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRiskFilter(filter as any)}
                    className={riskFilter === filter ? "bg-gradient-to-r from-primary to-secondary" : ""}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {["ALL", "Auto-Approved", "Manual Hold", "Review"].map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter as any)}
                    className={statusFilter === filter ? "bg-gradient-to-r from-primary to-secondary" : ""}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Applications Table */}
        <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold font-display">All Applications</h3>
            <Badge variant="outline" className="text-sm">
              {filteredApplicants.length} of {totalApplicants} applications
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Application ID</TableHead>
                  <TableHead className="font-semibold">Default Probability</TableHead>
                  <TableHead className="font-semibold">Risk Tier</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
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
                      animationDelay: `${index * 0.05}s`,
                      opacity: 0
                    }}
                    onClick={() => handleViewInsights(applicant)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        {applicant.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {applicant.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {(applicant.defaultProbability * 100).toFixed(1)}%
                        </span>
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              applicant.defaultProbability < 0.33
                                ? "bg-green-500"
                                : applicant.defaultProbability < 0.66
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${applicant.defaultProbability * 100}%` }}
                          />
                        </div>
                      </div>
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
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {applicant.timestamp}
                      </div>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInsights(applicant);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        aria-label="Open inline insights"
                        title="Open inline insights"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplicant(applicant);
                          setIsAIPrepareOpen(true);
                          setTimeout(() => {
                            setIsAIPrepareOpen(false);
                            setIsAIInsightsOpen(true);
                          }, 1200);
                        }}
                      >
                        AI Insights
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredApplicants.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </Card>

        {/* Application Insights Modal */}
        <ApplicationInsights
          isOpen={isInsightsOpen}
          onClose={handleCloseInsights}
          applicant={selectedApplicant}
        />

        {/* AI Insights Modal */}
        <AIInsights
          isOpen={isAIInsightsOpen}
          onClose={handleCloseAIInsights}
          applicant={selectedApplicant}
        />

        {/* AI Preparation Dialog */}
        <AIPrepareDialog open={isAIPrepareOpen} />
      </div>
    </div>
  );
};

export default Insights;
