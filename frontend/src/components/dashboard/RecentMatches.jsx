import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, DollarSign, MapPin, ArrowRight } from "lucide-react";
import { formatDate } from "@/utils";

export default function RecentMatches({ tenders, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            High-Match Tenders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            High-Match Tenders
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            {tenders.length} matches
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {tenders.length > 0 ? (
          <div className="space-y-6">
            {tenders.map((tender) => (
              <div key={tender.id} className="group p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-emerald-700">
                      {tender.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {tender.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tender.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(tender.deadline)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${(tender.budget_max / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {tender.match_score}% match
                    </Badge>
                    <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All High-Match Tenders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">No high-match tenders found</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Expand Search Criteria
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}