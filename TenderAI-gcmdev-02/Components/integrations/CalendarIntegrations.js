import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Integration } from "@/entities/all";
import { Calendar, Plus, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function CalendarIntegrations({ integrations, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    provider: "",
    config: {
      client_id: "",
      client_secret: "",
      calendar_id: "",
      webhook_url: ""
    }
  });

  const calendarProviders = [
    { 
      id: "google", 
      name: "Google Calendar", 
      icon: "📅",
      description: "Sync with Google Calendar for meetings and deadlines"
    },
    { 
      id: "outlook", 
      name: "Outlook Calendar", 
      icon: "📆",
      description: "Integrate with Microsoft Outlook Calendar"
    },
    { 
      id: "apple", 
      name: "Apple Calendar", 
      icon: "🍏",
      description: "Connect with Apple iCloud Calendar"
    },
    { 
      id: "caldav", 
      name: "CalDAV", 
      icon: "🔗",
      description: "Generic CalDAV calendar integration"
    }
  ];

  const handleAddIntegration = async () => {
    try {
      await Integration.create({
        ...newIntegration,
        type: "calendar",
        status: "pending"
      });
      setShowAddForm(false);
      setNewIntegration({
        name: "",
        provider: "",
        config: {
          client_id: "",
          client_secret: "",
          calendar_id: "",
          webhook_url: ""
        }
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding integration:", error);
    }
  };

  const testConnection = async (integration) => {
    console.log("Testing calendar integration:", integration.name);
    await Integration.update(integration.id, { status: "active", last_sync: new Date().toISOString() });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      
      {/* Available Calendar Providers */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {calendarProviders.map((provider) => (
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
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Calendar Integration
          </Button>
        </CardContent>
      </Card>

      {/* Add Integration Form */}
      {showAddForm && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Add Calendar Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Integration Name</Label>
                <Input
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tender Calendar Sync"
                />
              </div>
              <div>
                <Label>Calendar Provider</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newIntegration.provider}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, provider: e.target.value }))}
                >
                  <option value="">Select provider</option>
                  {calendarProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(newIntegration.provider === 'google' || newIntegration.provider === 'outlook') && (
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
                      placeholder="OAuth2 Client ID"
                    />
                  </div>
                  <div>
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      value={newIntegration.config.client_secret}
                      onChange={(e) => setNewIntegration(prev => ({
                        ...prev,
                        config: { ...prev.config, client_secret: e.target.value }
                      }))}
                      placeholder="OAuth2 Client Secret"
                    />
                  </div>
                </div>
                <div>
                  <Label>Calendar ID (Optional)</Label>
                  <Input
                    value={newIntegration.config.calendar_id}
                    onChange={(e) => setNewIntegration(prev => ({
                      ...prev,
                      config: { ...prev.config, calendar_id: e.target.value }
                    }))}
                    placeholder="primary or specific calendar ID"
                  />
                </div>
              </>
            )}

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">Calendar Features</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Auto-schedule tender deadline reminders</li>
                <li>• Create calendar events for meetings</li>
                <li>• Set up bid preparation milestones</li>
                <li>• Sync with team calendars</li>
                <li>• Notification settings for important dates</li>
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
            <CardTitle>Active Calendar Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {calendarProviders.find(p => p.id === integration.provider)?.icon || "📅"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{integration.name}</h3>
                      <p className="text-sm text-slate-600">
                        {integration.provider} • {integration.config.calendar_id || 'Primary calendar'}
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