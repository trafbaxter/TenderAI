import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, Clock, CheckCircle } from "lucide-react";

export default function AgentActivity() {
  const activities = [
    {
      action: "Scanned 45 new tenders",
      time: "2 hours ago",
      status: "completed",
      icon: CheckCircle
    },
    {
      action: "Found 3 high-match opportunities",
      time: "2 hours ago", 
      status: "completed",
      icon: Zap
    },
    {
      action: "Next scan scheduled",
      time: "In 6 hours",
      status: "pending",
      icon: Clock
    }
  ];

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Bot className="w-5 h-5" />
          Agent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.status === 'completed' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-500 text-white">Active</Badge>
            <span className="text-sm font-medium text-blue-800">Agent Status</span>
          </div>
          <p className="text-xs text-blue-700">
            Monitoring 12 bidding sites • Daily scans enabled
          </p>
        </div>
      </CardContent>
    </Card>
  );
}