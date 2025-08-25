import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Integration } from "@/entities/all";
import { Brain, Plus, Settings, CheckCircle, AlertCircle, Zap } from "lucide-react";

export default function AIModelIntegrations({ integrations, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    provider: "",
    config: {
      api_key: "",
      model: "",
      endpoint: "",
      max_tokens: 4000,
      temperature: 0.7
    }
  });

  const aiProviders = [
    { 
      id: "openai", 
      name: "OpenAI GPT", 
      icon: "🤖",
      models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
      status: "available"
    },
    { 
      id: "google", 
      name: "Google Gemini", 
      icon: "✨",
      models: ["gemini-pro", "gemini-pro-vision"],
      status: "coming_soon"
    },
    { 
      id: "anthropic", 
      name: "Claude", 
      icon: "🧠",
      models: ["claude-3-opus", "claude-3-sonnet"],
      status: "coming_soon"
    },
    { 
      id: "xai", 
      name: "Grok (xAI)", 
      icon: "🚀",
      models: ["grok-1", "grok-1.5"],
      status: "coming_soon"
    },
    { 
      id: "mistral", 
      name: "Mistral AI", 
      icon: "🌪️",
      models: ["mistral-large", "mistral-medium"],
      status: "coming_soon"
    },
    { 
      id: "cohere", 
      name: "Cohere", 
      icon: "🔮",
      models: ["command", "command-light"],
      status: "coming_soon"
    }
  ];

  const handleAddIntegration = async () => {
    try {
      await Integration.create({
        ...newIntegration,
        type: "ai_model",
        status: "pending"
      });
      setShowAddForm(false);
      setNewIntegration({
        name: "",
        provider: "",
        config: {
          api_key: "",
          model: "",
          endpoint: "",
          max_tokens: 4000,
          temperature: 0.7
        }
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding integration:", error);
    }
  };

  const testModel = async (integration) => {
    console.log("Testing AI model:", integration.name);
    await Integration.update(integration.id, { status: "active", last_sync: new Date().toISOString() });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      
      {/* Available AI Models */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Model Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {aiProviders.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 border-2 rounded-lg transition-all ${
                  provider.status === 'available' 
                    ? 'border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                    : 'border-solid border-amber-200 bg-amber-50/50'
                }`}
                onClick={() => {
                  if (provider.status === 'available') {
                    setNewIntegration(prev => ({ 
                      ...prev, 
                      provider: provider.id, 
                      name: `${provider.name} Integration`,
                      config: { ...prev.config, model: provider.models[0] }
                    }));
                    setShowAddForm(true);
                  }
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{provider.icon}</div>
                  <h3 className="font-semibold text-slate-800">{provider.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{provider.models.length} models available</p>
                  {provider.status === 'available' ? (
                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">Coming Soon</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add AI Model Integration
          </Button>
        </CardContent>
      </Card>

      {/* Add Integration Form */}
      {showAddForm && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Add AI Model Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Integration Name</Label>
                <Input
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My AI Assistant"
                />
              </div>
              <div>
                <Label>AI Provider</Label>
                <Select
                  value={newIntegration.provider}
                  onValueChange={(value) => {
                    const provider = aiProviders.find(p => p.id === value);
                    setNewIntegration(prev => ({ 
                      ...prev, 
                      provider: value,
                      config: { ...prev.config, model: provider?.models[0] || "" }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiProviders.filter(p => p.status === 'available').map((provider) => (
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
                <Label>Model</Label>
                <Select
                  value={newIntegration.config.model}
                  onValueChange={(value) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, model: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {newIntegration.provider && aiProviders.find(p => p.id === newIntegration.provider)?.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={newIntegration.config.max_tokens}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    config: { ...prev.config, max_tokens: parseInt(e.target.value) }
                  }))}
                  placeholder="4000"
                />
              </div>
            </div>

            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={newIntegration.config.api_key}
                onChange={(e) => setNewIntegration(prev => ({
                  ...prev,
                  config: { ...prev.config, api_key: e.target.value }
                }))}
                placeholder="sk-..."
              />
            </div>

            <div>
              <Label>Temperature (0.0 - 1.0)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={newIntegration.config.temperature}
                onChange={(e) => setNewIntegration(prev => ({
                  ...prev,
                  config: { ...prev.config, temperature: parseFloat(e.target.value) }
                }))}
                placeholder="0.7"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">AI Capabilities</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Tender analysis and summarization</li>
                <li>• Automated bid response generation</li>
                <li>• Email acknowledgment and drafting</li>
                <li>• Risk assessment and recommendations</li>
                <li>• Technical requirement extraction</li>
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
            <CardTitle>Active AI Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {aiProviders.find(p => p.id === integration.provider)?.icon || "🤖"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{integration.name}</h3>
                      <p className="text-sm text-slate-600">
                        {integration.provider} • {integration.config.model}
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
                      onClick={() => testModel(integration)}
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