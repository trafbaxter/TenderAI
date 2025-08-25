import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Server, Shield, Database } from "lucide-react";

export default function TechRequirements({ tender, summary }) {
  const getTechIcon = (tech) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('database') || techLower.includes('sql') || techLower.includes('mongodb')) {
      return <Database className="w-4 h-4" />;
    }
    if (techLower.includes('security') || techLower.includes('encryption')) {
      return <Shield className="w-4 h-4" />;
    }
    if (techLower.includes('server') || techLower.includes('cloud') || techLower.includes('aws')) {
      return <Server className="w-4 h-4" />;
    }
    return <Code className="w-4 h-4" />;
  };

  const getTechColor = (tech) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('react') || techLower.includes('javascript')) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (techLower.includes('python') || techLower.includes('django')) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (techLower.includes('java') || techLower.includes('spring')) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    if (techLower.includes('database') || techLower.includes('sql')) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    if (techLower.includes('cloud') || techLower.includes('aws')) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="space-y-6">
      
      {/* Technology Stack */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Required Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.technology_stack && summary.technology_stack.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.technology_stack.map((tech, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50">
                  {getTechIcon(tech)}
                  <Badge className={`${getTechColor(tech)} border`}>
                    {tech}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Code className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                Run AI analysis to extract technology requirements
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Original Requirements */}
      {tender.requirements && tender.requirements.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Original Tender Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tender.requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                  <span className="text-slate-700">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Requirements */}
      {summary?.compliance_requirements && summary.compliance_requirements.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compliance & Regulatory Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.compliance_requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <Shield className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}