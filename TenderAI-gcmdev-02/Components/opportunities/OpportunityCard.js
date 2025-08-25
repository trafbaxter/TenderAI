
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Star, 
  Building,
  Clock,
  Heart,
  FileText,
  Brain // Added Brain icon import
} from "lucide-react";
import { format } from "date-fns";
import { Tender } from "@/entities/all";
import { Link } from "react-router-dom"; // Added Link import
import { createPageUrl } from "@/utils"; // Added createPageUrl import

export default function OpportunityCard({ tender }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      await Tender.update(tender.id, { status: newStatus });
      // Reload would happen from parent component
    } catch (error) {
      console.error("Error updating tender status:", error);
    }
    setIsUpdating(false);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 85) return "from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300";
    if (score >= 70) return "from-blue-100 to-blue-200 text-blue-800 border-blue-300";
    if (score >= 50) return "from-amber-100 to-amber-200 text-amber-800 border-amber-300";
    return "from-slate-100 to-slate-200 text-slate-700 border-slate-300";
  };

  const getDaysUntilDeadline = () => {
    if (!tender.deadline) return null;
    const now = new Date();
    const deadline = new Date(tender.deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {tender.match_score && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <Badge className={`bg-gradient-to-r ${getMatchScoreColor(tender.match_score)} border font-semibold`}>
                    {tender.match_score}% match
                  </Badge>
                </div>
              )}
              {daysLeft !== null && (
                <Badge variant={daysLeft <= 7 ? "destructive" : daysLeft <= 14 ? "secondary" : "outline"}>
                  <Clock className="w-3 h-3 mr-1" />
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors mb-2">
              {tender.title}
            </CardTitle>
            
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <Building className="w-4 h-4" />
              <span className="font-medium">{tender.organization}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus(tender.status === 'interested' ? 'active' : 'interested')}
              disabled={isUpdating}
              className={`${tender.status === 'interested' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'hover:bg-red-50 hover:text-red-600'}`}
            >
              <Heart className={`w-4 h-4 ${tender.status === 'interested' ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-slate-600 line-clamp-3 leading-relaxed">
          {tender.description}
        </p>

        {/* Requirements */}
        {tender.requirements && tender.requirements.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Key Requirements
            </h4>
            <div className="space-y-1">
              {tender.requirements.slice(0, 3).map((req, index) => (
                <div key={index} className="text-sm text-slate-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
              {tender.requirements.length > 3 && (
                <p className="text-xs text-slate-500 pl-3.5">
                  +{tender.requirements.length - 3} more requirements
                </p>
              )}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          {tender.deadline && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="font-medium">Deadline</p>
                <p>{format(new Date(tender.deadline), "MMM d, yyyy")}</p>
              </div>
            </div>
          )}
          
          {(tender.budget_min || tender.budget_max) && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4" />
              <div>
                <p className="font-medium">Budget</p>
                <p>
                  {tender.budget_min && tender.budget_max 
                    ? `$${(tender.budget_min / 1000).toFixed(0)}K - $${(tender.budget_max / 1000).toFixed(0)}K`
                    : tender.budget_max 
                      ? `Up to $${(tender.budget_max / 1000).toFixed(0)}K`
                      : `From $${(tender.budget_min / 1000).toFixed(0)}K`
                  }
                </p>
              </div>
            </div>
          )}
          
          {tender.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <div>
                <p className="font-medium">Location</p>
                <p className="truncate">{tender.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus('applied')}
              disabled={isUpdating}
              className={tender.status === 'applied' ? 'bg-green-50 text-green-700 border-green-200' : ''}
            >
              {tender.status === 'applied' ? 'Applied' : 'Mark as Applied'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Link to={createPageUrl(`TenderAnalysis?id=${tender.id}`)}>
              <Button
                variant="outline"
                size="sm"
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </Button>
            </Link>
            {tender.source_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(tender.source_url, '_blank')}
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                View Details
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
