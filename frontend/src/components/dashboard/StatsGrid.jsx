import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Briefcase, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsGrid({ 
  highMatchCount, 
  recentCount, 
  portfolioCount, 
  totalBudget, 
  isLoading 
}) {
  const stats = [
    {
      title: "High Match Tenders",
      value: highMatchCount,
      icon: Target,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      description: "85%+ match score"
    },
    {
      title: "Recent Opportunities",
      value: recentCount,
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      description: "Closing in 30 days"
    },
    {
      title: "Portfolio Items",
      value: portfolioCount,
      icon: Briefcase,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      description: "Active capabilities"
    },
    {
      title: "Potential Value",
      value: `$${(totalBudget / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      description: "High-match tenders"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
          <CardHeader className="relative p-6 pb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <CardTitle className="text-3xl font-bold text-slate-800">
                    {stat.value}
                  </CardTitle>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative px-6 pb-6">
            <p className="text-xs text-slate-500 font-medium">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}