import React, { useState, useEffect } from "react";
import { Integration } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Brain, 
  MessageSquare, 
  Calendar, 
  Video, 
  Briefcase,
  Mail,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

import DatabaseIntegrations from "../components/integrations/DatabaseIntegrations";
import AIModelIntegrations from "../components/integrations/AIModelIntegrations";
import CommunicationIntegrations from "../components/integrations/CommunicationIntegrations";
import ProjectManagementIntegrations from "../components/integrations/ProjectManagementIntegrations";
import CalendarIntegrations from "../components/integrations/CalendarIntegrations";
import MeetingIntegrations from "../components/integrations/MeetingIntegrations";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("database");

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await Integration.list();
      setIntegrations(data);
    } catch (error) {
      console.error("Error loading integrations:", error);
    }
    setIsLoading(false);
  };

  const getIntegrationsByType = (type) => {
    return integrations.filter(int => int.type === type);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const integrationCategories = [
    {
      id: "database",
      title: "Database",
      icon: Database,
      description: "External database connections",
      count: getIntegrationsByType("database").length
    },
    {
      id: "ai_model",
      title: "AI Models",
      icon: Brain,
      description: "AI and language models",
      count: getIntegrationsByType("ai_model").length
    },
    {
      id: "communication",
      title: "Communication",
      icon: MessageSquare,
      description: "Chat and messaging platforms",
      count: getIntegrationsByType("communication").length
    },
    {
      id: "project_management",
      title: "Project Tools",
      icon: Briefcase,
      description: "Project management systems",
      count: getIntegrationsByType("project_management").length
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: Calendar,
      description: "Calendar and scheduling",
      count: getIntegrationsByType("calendar").length
    },
    {
      id: "meeting",
      title: "Meetings",
      icon: Video,
      description: "Video conferencing platforms",
      count: getIntegrationsByType("meeting").length
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Integrations</h1>
            <p className="text-slate-600 text-lg">
              Connect your tender management system with external services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">
                {integrations.filter(i => i.status === 'active').length} Active
              </span>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Integration Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationCategories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl ${
                activeTab === category.id ? 'ring-2 ring-blue-500 shadow-blue-200/50' : 'shadow-slate-200/50'
              }`}
              onClick={() => setActiveTab(category.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                      <category.icon className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800">{category.title}</CardTitle>
                      <p className="text-sm text-slate-600">{category.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    {category.count}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Integration Configuration */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm">
            {integrationCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2"
              >
                <category.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="database" className="mt-6">
            <DatabaseIntegrations 
              integrations={getIntegrationsByType("database")}
              onUpdate={loadIntegrations}
            />
          </TabsContent>

          <TabsContent value="ai_model" className="mt-6">
            <AIModelIntegrations 
              integrations={getIntegrationsByType("ai_model")}
              onUpdate={loadIntegrations}
            />
          </TabsContent>

          <TabsContent value="communication" className="mt-6">
            <CommunicationIntegrations 
              integrations={getIntegrationsByType("communication")}
              onUpdate={loadIntegrations}
            />
          </TabsContent>

          <TabsContent value="project_management" className="mt-6">
            <ProjectManagementIntegrations 
              integrations={getIntegrationsByType("project_management")}
              onUpdate={loadIntegrations}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CalendarIntegrations 
              integrations={getIntegrationsByType("calendar")}
              onUpdate={loadIntegrations}
            />
          </TabsContent>

          <TabsContent value="meeting" className="mt-6">
            <MeetingIntegrations 
              integrations={getIntegrationsByType("meeting")}
              onUpdate={loadIntegrations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}