import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Building,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function TenderSummaryView({ tender, summary, isAnalyzing }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      
      {/* Tender Details */}
      <div className="lg:col-span-1">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tender Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700">Organization</span>
              </div>
              <p className="text-slate-800 pl-6">{tender.organization}</p>
            </div>

            {tender.deadline && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Deadline</span>
                </div>
                <p className="text-slate-800 pl-6">
                  {format(new Date(tender.deadline), "MMMM d, yyyy")}
                </p>
              </div>
            )}

            {tender.location && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Location</span>
                </div>
                <p className="text-slate-800 pl-6">{tender.location}</p>
              </div>
            )}

            {(tender.budget_min || tender.budget_max) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Budget</span>
                </div>
                <p className="text-slate-800 pl-6">
                  {tender.budget_min && tender.budget_max 
                    ? `$${tender.budget_min.toLocaleString()} - $${tender.budget_max.toLocaleString()}`
                    : tender.budget_max 
                      ? `Up to $${tender.budget_max.toLocaleString()}`
                      : `From $${tender.budget_min.toLocaleString()}`
                  }
                </p>
              </div>
            )}

            {tender.category && (
              <div className="pt-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {tender.category}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      <div className="lg:col-span-2">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              AI Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ) : summary ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Executive Summary</h3>
                  <p className="text-slate-700 leading-relaxed">{summary.executive_summary}</p>
                </div>

                {summary.key_requirements && summary.key_requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Key Requirements</h3>
                    <div className="space-y-2">
                      {summary.key_requirements.map((req, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summary.estimated_effort && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Estimated Effort</h3>
                    <p className="text-slate-700">{summary.estimated_effort}</p>
                  </div>
                )}

                {summary.recommended_approach && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Recommended Approach</h3>
                    <p className="text-slate-700 leading-relaxed">{summary.recommended_approach}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-700 mb-2">No Analysis Available</h3>
                <p className="text-slate-500">
                  Click "AI Analysis" to generate a comprehensive analysis of this tender.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}