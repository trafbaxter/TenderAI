import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

export default function RiskAssessment({ tender, summary }) {
  const parseRisks = (riskText) => {
    if (!riskText) return [];
    
    // Simple parsing - in real implementation, you'd use more sophisticated NLP
    const sentences = riskText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.map((sentence, index) => ({
      id: index,
      description: sentence.trim(),
      level: getRiskLevel(sentence),
      category: getRiskCategory(sentence)
    }));
  };

  const getRiskLevel = (text) => {
    const highKeywords = ['critical', 'major', 'significant', 'severe', 'high'];
    const mediumKeywords = ['moderate', 'medium', 'considerable'];
    const lowKeywords = ['minor', 'low', 'minimal'];
    
    const textLower = text.toLowerCase();
    
    if (highKeywords.some(keyword => textLower.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => textLower.includes(keyword))) return 'medium';
    if (lowKeywords.some(keyword => textLower.includes(keyword))) return 'low';
    
    return 'medium'; // default
  };

  const getRiskCategory = (text) => {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('technical') || textLower.includes('technology')) return 'Technical';
    if (textLower.includes('timeline') || textLower.includes('schedule')) return 'Schedule';
    if (textLower.includes('budget') || textLower.includes('cost')) return 'Financial';
    if (textLower.includes('compliance') || textLower.includes('regulatory')) return 'Compliance';
    if (textLower.includes('resource') || textLower.includes('staffing')) return 'Resource';
    
    return 'General';
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'high': return "bg-red-100 text-red-800 border-red-200";
      case 'medium': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'low': return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const risks = summary?.risk_assessment ? parseRisks(summary.risk_assessment) : [];

  return (
    <div className="space-y-6">
      
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50/80 backdrop-blur-sm border border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">High Risk</span>
            </div>
            <p className="text-2xl font-bold text-red-800">
              {risks.filter(r => r.level === 'high').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50/80 backdrop-blur-sm border border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Medium Risk</span>
            </div>
            <p className="text-2xl font-bold text-amber-800">
              {risks.filter(r => r.level === 'medium').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50/80 backdrop-blur-sm border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Low Risk</span>
            </div>
            <p className="text-2xl font-bold text-green-800">
              {risks.filter(r => r.level === 'low').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Analysis */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Detailed Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.risk_assessment ? (
            <div className="space-y-6">
              {/* Raw Risk Assessment */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">AI Risk Assessment</h3>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-slate-700 leading-relaxed">{summary.risk_assessment}</p>
                </div>
              </div>

              {/* Parsed Risks */}
              {risks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Identified Risk Factors</h3>
                  <div className="space-y-3">
                    {risks.map((risk) => (
                      <div key={risk.id} className="flex items-start gap-3 p-4 rounded-lg border bg-white">
                        {getRiskIcon(risk.level)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getRiskBadgeColor(risk.level)} border`}>
                              {risk.level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-100 text-slate-700">
                              {risk.category}
                            </Badge>
                          </div>
                          <p className="text-slate-700">{risk.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No Risk Analysis Available</h3>
              <p className="text-slate-500">
                Run AI analysis to identify potential risks and mitigation strategies.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}