import React, { useState, useEffect } from "react";
import { Tender, Portfolio, AgentConfig } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  Briefcase, 
  Target, 
  Clock, 
  DollarSign,
  ArrowRight,
  Bot,
  Zap,
  Star
} from "lucide-react";
import { format } from "date-fns";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentMatches from "../components/dashboard/RecentMatches";
import AgentActivity from "../components/dashboard/AgentActivity";

export default function Dashboard() {
  const [tenders, setTenders] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tendersData, portfolioData] = await Promise.all([
        Tender.list('-match_score', 10),
        Portfolio.list('-created_date', 5)
      ]);
      setTenders(tendersData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const highMatchTenders = tenders.filter(t => t.match_score >= 80);
  const recentTenders = tenders.filter(t => {
    const deadline = new Date(t.deadline);
    const now = new Date();
    const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && diffDays > 0;
  });

  const totalBudget = highMatchTenders.reduce((sum, t) => sum + (t.budget_max || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Welcome to TenderMatch AI
            </h1>
            <p className="text-slate-600 text-lg">
              Your intelligent tender discovery platform is actively finding opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Portfolio")}>
              <Button variant="outline" className="bg-white/80 hover:bg-white">
                <Briefcase className="w-4 h-4 mr-2" />
                Update Portfolio
              </Button>
            </Link>
            <Link to={createPageUrl("Opportunities")}>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25">
                <Target className="w-4 h-4 mr-2" />
                View All Matches
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid 
          highMatchCount={highMatchTenders.length}
          recentCount={recentTenders.length}
          portfolioCount={portfolio.length}
          totalBudget={totalBudget}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent High-Match Tenders */}
          <div className="lg:col-span-2">
            <RecentMatches 
              tenders={highMatchTenders.slice(0, 5)}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <AgentActivity />
            
            {/* Portfolio Summary */}
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50">
              <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Briefcase className="w-5 h-5" />
                  Portfolio Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!isLoading && portfolio.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{item.title}</h4>
                          <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                          <Badge variant="secondary" className="mt-2 bg-slate-200 text-slate-700">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Link to={createPageUrl("Portfolio")}>
                      <Button variant="outline" className="w-full mt-4">
                        View Full Portfolio
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 mb-4">Build your portfolio to get better matches</p>
                    <Link to={createPageUrl("Portfolio")}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Add Portfolio Items
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}