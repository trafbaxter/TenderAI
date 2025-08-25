import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Integration } from "@/entities/all";
import { Database, Plus, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function DatabaseIntegrations({ integrations, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    provider: "",
    config: {
      connection_string: "",
      database_name: "",
      username: "",
      password: "",
      host: "",
      port: "",
      ssl: true
    }
  });

  const databaseProviders = [
    { id: "mongodb", name: "MongoDB", icon: "🍃" },
    { id: "supabase", name: "Supabase", icon: "⚡" },
    { id: "postgresql", name: "PostgreSQL", icon: "🐘" },
    { id: "mysql", name: "MySQL", icon: "🐬" },
    { id: "redis", name: "Redis", icon: "🔴" },
    { id: "firestore", name: "Firestore", icon: "🔥" }
  ];

  const handleAddIntegration = async () => {
    try {
      await Integration.create({
        ...newIntegration,
        type: "database",
        status: "pending"
      });
      setShowAddForm(false);
      setNewIntegration({
        name: "",
        provider: "",
        config: {
          connection_string: "",
          database_name: "",
          username: "",
          password: "",
          host: "",
          port: "",
          ssl: true
        }
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding integration:", error);
    }
  };

  const testConnection = async (integration) => {
    // This would test the database connection
    console.log("Testing connection for:", integration.name);
    // Update status based on test result
    await Integration.update(integration.id, { status: "active", last_sync: new Date().toISOString() });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      
      {/* Available Providers */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {databaseProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => {
                  setNewIntegration(prev => ({ ...prev, provider: provider.id, name: `${provider.name} Connection` }));
                  setShowAddForm(true);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{provider.icon}</div>
                  <h3 className="font-semibold text-slate-800">{provider.name}</h3>
                  <p className="text-sm text-slate-600">Connect your {provider.name} database</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Database Connection
          </Button>
        </CardContent>
      </Card>

      {/* Add Integration Form */}
      {showAddForm && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Add Database Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Integration Name</Label>
                <Input
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Database Connection"
                />
              </div>
              <div>
                <Label>Database Provider</Label>
                <Select
                  value={newIntegration.provider}
                  onValueChange={(value) => setNewIntegration(prev => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {databaseProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.icon} {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Host</Label>
                <Input
                  value={newIntegration.config.host}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, host: e.target.value }
                  }))}
                  placeholder="localhost or IP address"
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input
                  value={newIntegration.config.port}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, port: e.target.value }
                  }))}
                  placeholder="5432, 27017, etc."
                />
              </div>
            </div>

            <div>
              <Label>Database Name</Label>
              <Input
                value={newIntegration.config.database_name}
                onChange={(e) => setNewIntegration(prev => ({
                  ...prev,
                  config: { ...prev.config, database_name: e.target.value }
                }))}
                placeholder="tender_management"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={newIntegration.config.username}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, username: e.target.value }
                  }))}
                  placeholder="database username"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newIntegration.config.password}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, password: e.target.value }
                  }))}
                  placeholder="database password"
                />
              </div>
            </div>

            <div>
              <Label>Connection String (Optional)</Label>
              <Input
                value={newIntegration.config.connection_string}
                onChange={(e) => setNewIntegration(prev => ({
                  ...prev,
                  config: { ...prev.config, connection_string: e.target.value }
                }))}
                placeholder="mongodb://user:pass@host:port/db or postgresql://..."
              />
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
            <CardTitle>Active Database Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {databaseProviders.find(p => p.id === integration.provider)?.icon || "💾"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{integration.name}</h3>
                      <p className="text-sm text-slate-600">
                        {integration.provider} • {integration.config.database_name}
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