import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Calendar, MapPin, DollarSign, ExternalLink, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecentMatches({ tenders, isLoading }) {
  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200/50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="w-5 h-5" />
            High-Match Opportunities
          </CardTitle>
          <Link to={createPageUrl("Opportunities")}>
            <Button variant="outline" size="sm" className="bg-white/80">
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : tenders.length > 0 ? (
          <div className="divide-y divide-slate-200/50">
            {tenders.map((tender) => (
              <div key={tender.id} className="p-6 hover:bg-slate-50/50 transition-colors duration-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-lg mb-2 line-clamp-2">
                        {tender.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                        {tender.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Star className="w-4 h-4 text-amber-500" />
                      <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300">
                        {tender.match_score}% match
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {tender.deadline ? format(new Date(tender.deadline), "MMM d, yyyy") : "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {tender.budget_max ? `Up to $${(tender.budget_max / 1000).toFixed(0)}K` : "Budget TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{tender.location || "Location TBD"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-700">
                      {tender.organization}
                    </p>
                    <div className="flex gap-2">
                      {tender.source_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(tender.source_url, '_blank')}
                          className="bg-white/80 hover:bg-white"
                        >
                          View Details
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No high-match tenders yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              The AI agent is working to find opportunities that match your portfolio. 
              Check back soon or refine your portfolio for better matches.
            </p>
            <Link to={createPageUrl("Portfolio")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Enhance Portfolio
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}