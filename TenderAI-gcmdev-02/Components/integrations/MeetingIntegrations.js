import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Integration } from "@/entities/all";
import { Video, Plus, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function MeetingIntegrations({ integrations, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    provider: "",
    config: {
      api_key: "",
      api_secret: "",
      client_id: "",
      tenant_id: "",
      webhook_url: ""
    }
  });

  const meetingProviders = [
    { 
      id: "zoom", 
      name: "Zoom", 
      icon: "🎥",
      description: "Create and manage Zoom meetings"
    },
    { 
      id: "teams", 
      name: "Microsoft Teams", 
      icon: "👥",
      description: "Schedule Teams meetings and calls"
    },
    { 
      id: "google_meet", 
      name: "Google Meet", 
      icon: "📹",
      description: "Generate Google Meet links"
    },
    { 
      id: "webex", 
      name: "Cisco Webex", 
      icon: "🌐",
      description: "Create Webex meetings and webinars"
    },
    { 
      id: "gotomeeting", 
      name: "GoToMeeting", 
      icon: "🚀",
      description: "Schedule GoToMeeting sessions"
    }
  ];

  const handleAddIntegration = async () => {
    try {
      await Integration.create({
        ...newIntegration,
        type: "meeting",
        status: "pending"
      });
      setShowAddForm(false);
      setNewIntegration({
        name: "",
        provider: "",
        config: {
          api_key: "",
          api_secret: "",
          client_id: "",
          tenant_id: "",
          webhook_url: ""
        }
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding integration:", error);
    }
  };

  const testConnection = async (integration) => {
    console.log("Testing meeting integration:", integration.name);
    await Integration.update(integration.id, { status: "active", last_sync: new Date().toISOString() });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      
      {/* Available Meeting Platforms */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Meeting Platform Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {meetingProviders.map((provider) => (
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
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Meeting Integration
          </Button>
        </CardContent>
      </Card>

      {/* Add Integration Form */}
      {showAddForm && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Add Meeting Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Integration Name</Label>
                <Input
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tender Meetings"
                />
              </div>
              <div>
                <Label>Meeting Platform</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newIntegration.provider}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, provider: e.target.value }))}
                >
                  <option value="">Select platform</option>
                  {meetingProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {newIntegration.provider === 'zoom' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>API Key</Label>
                    <Input
                      value={newIntegration.config.api_key}
                      onChange={(e) => setNewIntegration(prev => ({
                        ...prev,
                        config: { ...prev.config, api_key: e.target.value }
                      }))}
                      placeholder="Zoom API Key"
                    />
                  </div>
                  <div>
                    <Label>API Secret</Label>
                    <Input
                      type="password"
                      value={newIntegration.config.api_secret}
                      onChange={(e) => setNewIntegration(prev => ({
                        ...prev,
                        config: { ...prev.config, api_secret: e.target.value }
                      }))}
                      placeholder="Zoom API Secret"
                    />
                  </div>
                </div>
              </>
            )}

            {newIntegration.provider === 'teams' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client ID</Label>
                    <Input
                      value={newIntegration.config.client_id}
                      onChange={(e) => setNewIntegration(prev => ({
                        ...prev,
                        config: { ...prev.config, client_id: e.target.value }
                      }))}
                      placeholder="Azure App Client ID"
                    />
                  </div>
                  <div>
                    <Label>Tenant ID</Label>
                    <Input
                      value={newIntegration.config.tenant_id}
                      onChange={(e) => setNewIntegration(prev => ({
                        ...prev,
                        config: { ...prev.config, tenant_id: e.target.value }
                      }))}
                      placeholder="Azure Tenant ID"
                    />
                  </div>
                </div>
              </>
            )}

            {newIntegration.provider === 'google_meet' && (
              <div>
                <Label>Client ID</Label>
                <Input
                  value={newIntegration.config.client_id}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, client_id: e.target.value }
                  }))}
                  placeholder="Google OAuth2 Client ID"
                />
              </div>
            )}

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Meeting Automation</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Auto-create meetings for bid discussions</li>
                <li>• Schedule client presentations</li>
                <li>• Send meeting invites with tender context</li>
                <li>• Record important tender meetings</li>
                <li>• Integration with calendar systems</li>
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
            <CardTitle>Active Meeting Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {meetingProviders.find(p => p.id === integration.provider)?.icon || "🎥"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{integration.name}</h3>
                      <p className="text-sm text-slate-600">
                        {integration.provider} • Meeting automation enabled
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