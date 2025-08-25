import React, { useState, useEffect } from "react";
import { AgentConfig, Tender } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, 
  Settings, 
  Zap, 
  Plus, 
  X, 
  Save,
  RefreshCw,
  Globe
} from "lucide-react";
import { toast } from "sonner";

export default function AgentSettingsPage() {
  const [config, setConfig] = useState({
    search_keywords: [],
    preferred_categories: [],
    min_budget: 0,
    max_budget: 0,
    preferred_locations: [],
    scraping_frequency: "daily",
    minimum_match_score: 70
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = "";

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await AgentConfig.list();
      if (configs.length > 0) {
        setConfig(configs[0]);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
    setIsLoading(false);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const configs = await AgentConfig.list();
      if (configs.length > 0) {
        await AgentConfig.update(configs[0].id, config);
      } else {
        await AgentConfig.create(config);
      }
      toast.success("Agent settings saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings");
    }
    setIsSaving(false);
  };

  const runAgent = async () => {
    setIsRunningAgent(true);
    try {
      // Simulate AI agent finding tenders
      const result = await InvokeLLM({
        prompt: `You are an AI tender discovery agent. Based on these preferences:
        - Keywords: ${config.search_keywords.join(', ')}
        - Categories: ${config.preferred_categories.join(', ')}
        - Budget range: $${config.min_budget} - $${config.max_budget}
        - Locations: ${config.preferred_locations.join(', ')}
        
        Generate 3 realistic tender opportunities that match these criteria. Make them detailed and relevant.`,
        response_json_schema: {
          type: "object",
          properties: {
            tenders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  organization: { type: "string" },
                  category: { type: "string" },
                  budget_max: { type: "number" },
                  deadline: { type: "string" },
                  location: { type: "string" },
                  requirements: { type: "array", items: { type: "string" } },
                  match_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Save the generated tenders
      if (result.tenders) {
        for (const tender of result.tenders) {
          await Tender.create({
            ...tender,
            source_url: "https://example-tender-site.gov",
            status: "active"
          });
        }
        toast.success(`Found ${result.tenders.length} new matching opportunities!`);
      }
    } catch (error) {
      console.error("Error running agent:", error);
      toast.error("Failed to run agent scan");
    }
    setIsRunningAgent(false);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !config.search_keywords.includes(newKeyword.trim())) {
      setConfig(prev => ({
        ...prev,
        search_keywords: [...prev.search_keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword) => {
    setConfig(prev => ({
      ...prev,
      search_keywords: prev.search_keywords.filter(k => k !== keyword)
    }));
  };

  const addLocation = () => {
    if (newLocation.trim() && !config.preferred_locations.includes(newLocation.trim())) {
      setConfig(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, newLocation.trim()]
      }));
      setNewLocation("");
    }
  };

  const removeLocation = (location) => {
    setConfig(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter(l => l !== location)
    }));
  };

  const toggleCategory = (category) => {
    setConfig(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(category)
        ? prev.preferred_categories.filter(c => c !== category)
        : [...prev.preferred_categories, category]
    }));
  };

  const categories = [
    "construction", "consulting", "technology", "healthcare", "education",
    "manufacturing", "services", "research", "logistics", "other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Agent Settings</h1>
            <p className="text-slate-600 text-lg">
              Configure your AI agent to find the most relevant tender opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={runAgent}
              disabled={isRunningAgent}
              className="bg-white/80 hover:bg-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRunningAgent ? 'animate-spin' : ''}`} />
              {isRunningAgent ? 'Scanning...' : 'Run Agent Scan'}
            </Button>
            <Button
              onClick={saveConfig}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Search Configuration */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Zap className="w-5 h-5" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Keywords */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Search Keywords
                </Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="e.g., construction, infrastructure"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button type="button" onClick={addKeyword} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.search_keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                  Preferred Categories
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={config.preferred_categories.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                      className={config.preferred_categories.includes(category) 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'hover:bg-blue-50'
                      }
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Preferred Locations
                </Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g., New York, California"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLocation();
                      }
                    }}
                  />
                  <Button type="button" onClick={addLocation} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.preferred_locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      <Globe className="w-3 h-3 mr-1" />
                      {location}
                      <button
                        onClick={() => removeLocation(location)}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Configuration */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Settings className="w-5 h-5" />
                Agent Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Budget Range */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                  Budget Range
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Minimum ($)</Label>
                    <Input
                      type="number"
                      value={config.min_budget}
                      onChange={(e) => setConfig(prev => ({ ...prev, min_budget: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Maximum ($)</Label>
                    <Input
                      type="number"
                      value={config.max_budget}
                      onChange={(e) => setConfig(prev => ({ ...prev, max_budget: Number(e.target.value) }))}
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </div>

              {/* Scraping Frequency */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Scanning Frequency
                </Label>
                <Select
                  value={config.scraping_frequency}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, scraping_frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Match Score */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                  Minimum Match Score: {config.minimum_match_score}%
                </Label>
                <Slider
                  value={[config.minimum_match_score]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, minimum_match_score: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Only show opportunities with match scores above this threshold
                </p>
              </div>

              {/* Agent Status */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-green-600" />
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <p className="text-sm text-green-800 font-medium">
                  Agent is monitoring tender sites
                </p>
                <p className="text-xs text-green-700">
                  Next scan: In 4 hours • Monitoring 12 sites
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
