import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, CheckCircle, Search, Zap } from "lucide-react";

export default function AgentActivity() {
  const activities = [
    {
      id: 1,
      type: "scan",
      message: "Scanned 247 new tenders from government portals",
      timestamp: "2 minutes ago",
      status: "completed"
    },
    {
      id: 2,
      type: "match",
      message: "Found 12 new high-match opportunities",
      timestamp: "15 minutes ago",
      status: "completed"
    },
    {
      id: 3,
      type: "analysis",
      message: "Analyzing technical requirements for healthcare tender",
      timestamp: "1 hour ago",
      status: "in_progress"
    },
    {
      id: 4,
      type: "notification",
      message: "Deadline alert sent for 3 upcoming submissions",
      timestamp: "2 hours ago",
      status: "completed"
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'scan': return <Search className="w-4 h-4" />;
      case 'match': return <Zap className="w-4 h-4" />;
      case 'analysis': return <Bot className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'scan': return 'text-blue-600';
      case 'match': return 'text-amber-600';
      case 'analysis': return 'text-purple-600';
      default: return 'text-green-600';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Agent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors">
              <div className={`p-2 rounded-full bg-slate-100 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp}
                  </span>
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 'secondary'}
                    className={activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                    }
                  >
                    {activity.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {activity.status === 'completed' ? 'Done' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}