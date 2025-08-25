import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Integration } from "@/entities/all";
import { Briefcase, Plus, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function ProjectManagementIntegrations({ integrations, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    provider: "",
    config: {
      instance_url: "",
      username: "",
      api_token: "",
      project_key: ""
    }
  });

  const pmProviders = [
    { 
      id: "jira", 
      name: "Jira", 
      icon: "🔄",
      description: "Create tickets for tender tasks and track progress"
    },
    { 
      id: "servicenow", 
      name: "ServiceNow", 
      icon: "⚙️",
      description: "Integrate with ServiceNow workflows"
    },
    { 
      id: "asana", 
      name: "Asana", 
      icon: "📋",
      description: "Create projects and tasks in Asana"
    },
    { 
      id: "monday", 
      name: "Monday.com", 
      icon: "📊",
      description: "Sync with Monday.com boards"
    },
    { 
      id: "trello", 
      name: "Trello", 
      icon: "📝",
      description: "Create cards and boards in Trello"
    },
    { 
      id: "linear", 
      name: "Linear", 
      icon: "📐",
      description: "Track issues and projects in Linear"
    }
  ];

  const handleAddIntegration = async () => {
    try {
      await Integration.create({
        ...newIntegration,
        type: "project_management",
        status: "pending"
      });
      setShowAddForm(false);
      setNewIntegration({
        name: "",
        provider: "",
        config: {
          instance_url: "",
          username: "",
          api_token: "",
          project_key: ""
        }
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding integration:", error);
    }
  };

  const testConnection = async (integration) => {
    console.log("Testing project management integration:", integration.name);
    await Integration.update(integration.id, { status: "active", last_sync: new Date().toISOString() });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      
      {/* Available Project Management Tools */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Project Management Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {pmProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => {
                  setNewIntegration(prev => ({ 
                    ...prev, 
                    provider: provider.id, 
                    name: `${provider.name} Integration`
                  }));
                  setShowAddForm(true);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{provider.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{provider.name}</h3>
                    <p className="text-sm text-slate-600">{provider.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project Management Integration
          </Button>
        </CardContent>
      </Card>

      {/* Add Integration Form */}
      {showAddForm && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Add Project Management Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Integration Name</Label>
                <Input
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tender Project Tracking"
                />
              </div>
              <div>
                <Label>Platform</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newIntegration.provider}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, provider: e.target.value }))}
                >
                  <option value="">Select platform</option>
                  {pmProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Instance URL</Label>
              <Input
                value={newIntegration.config.instance_url}
                onChange={(e) => setNewIntegration(prev => ({
                  ...prev,
                  config: { ...prev.config, instance_url: e.target.value }
                }))}
                placeholder="https://your-company.atlassian.net"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Username/Email</Label>
                <Input
                  value={newIntegration.config.username}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, username: e.target.value }
                  }))}
                  placeholder="user@company.com"
                />
              </div>
              <div>
                <Label>API Token</Label>
                <Input
                  type="password"
                  value={newIntegration.config.api_token}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, api_token: e.target.value }
                  }))}
                  placeholder="API token or app password"
                />
              </div>
            </div>

            <div>
              <Label>Project Key (Optional)</Label>
              <Input
                value={newIntegration.config.project_key}
                onChange={(e) => setNewIntegration(prev => ({
                  ...prev,
                  config: { ...prev.config, project_key: e.target.value }
                }))}
                placeholder="TENDER or TEN"
              />
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Automation Features</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Auto-create tickets for new tender opportunities</li>
                <li>• Track bid preparation progress</li>
                <li>• Set up approval workflows</li>
                <li>• Manage tender deadlines and milestones</li>
                <li>• Generate project reports and analytics</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddIntegration}>
                Add Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Active Project Management Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {pmProviders.find(p => p.id === integration.provider)?.icon || "📋"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{integration.name}</h3>
                      <p className="text-sm text-slate-600">
                        {integration.provider} • {integration.config.project_key || 'All projects'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                      {integration.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {integration.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {integration.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(integration)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}