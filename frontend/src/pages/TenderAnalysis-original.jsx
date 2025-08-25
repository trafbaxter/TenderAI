import React, { useState, useEffect } from "react";
import { Tender, TenderSummary, BidResponse } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Download,
  Send
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import TenderSummaryView from "../components/analysis/TenderSummaryView";
import BidResponseGenerator from "../components/analysis/BidResponseGenerator";
import RiskAssessment from "../components/analysis/RiskAssessment";
import TechRequirements from "../components/analysis/TechRequirements";

export default function TenderAnalysisPage() {
  const [searchParams] = useSearchParams();
  const tenderId = searchParams.get('id');
  
  const [tender, setTender] = useState(null);
  const [summary, setSummary] = useState(null);
  const [bidResponse, setBidResponse] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBid, setIsGeneratingBid] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    if (tenderId) {
      loadTenderData();
    }
  }, [tenderId]);

  const loadTenderData = async () => {
    try {
      const tenderData = await Tender.get(tenderId);
      setTender(tenderData);
      
      // Check if analysis exists
      const summaries = await TenderSummary.filter({ tender_id: tenderId });
      if (summaries.length > 0) {
        setSummary(summaries[0]);
      }
      
      // Check if bid response exists
      const bidResponses = await BidResponse.filter({ tender_id: tenderId });
      if (bidResponses.length > 0) {
        setBidResponse(bidResponses[0]);
      }
    } catch (error) {
      console.error("Error loading tender data:", error);
    }
  };

  const analyzeTender = async () => {
    if (!tender) return;
    
    setIsAnalyzing(true);
    try {
      const result = await InvokeLLM({
        prompt: `Analyze this tender opportunity in detail:
        
        Title: ${tender.title}
        Description: ${tender.description}
        Organization: ${tender.organization}
        Budget: $${tender.budget_min || 0} - $${tender.budget_max || 0}
        Deadline: ${tender.deadline}
        Location: ${tender.location}
        Requirements: ${tender.requirements ? tender.requirements.join(', ') : 'Not specified'}
        
        Please provide a comprehensive analysis including:
        1. Executive summary (2-3 sentences)
        2. Key requirements (extract the most important ones)
        3. Technology stack requirements
        4. Effort estimation (in person-months)
        5. Risk assessment (identify potential risks)
        6. Recommended approach (strategic recommendations)
        7. Compliance and regulatory requirements
        
        Make the analysis professional and actionable for a business preparing to bid.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_requirements: { type: "array", items: { type: "string" } },
            technology_stack: { type: "array", items: { type: "string" } },
            estimated_effort: { type: "string" },
            risk_assessment: { type: "string" },
            recommended_approach: { type: "string" },
            compliance_requirements: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Save the analysis
      const summaryData = {
        tender_id: tenderId,
        ...result
      };
      
      if (summary) {
        await TenderSummary.update(summary.id, summaryData);
      } else {
        await TenderSummary.create(summaryData);
      }
      
      setSummary(summaryData);
    } catch (error) {
      console.error("Error analyzing tender:", error);
    }
    setIsAnalyzing(false);
  };

  const generateBidResponse = async () => {
    if (!tender || !summary) return;
    
    setIsGeneratingBid(true);
    try {
      const result = await InvokeLLM({
        prompt: `Generate a professional bid response for this tender:
        
        Tender: ${tender.title}
        Organization: ${tender.organization}
        Description: ${tender.description}
        Budget: $${tender.budget_min || 0} - $${tender.budget_max || 0}
        
        Analysis Summary: ${summary.executive_summary}
        Key Requirements: ${summary.key_requirements?.join(', ')}
        Technology Stack: ${summary.technology_stack?.join(', ')}
        Recommended Approach: ${summary.recommended_approach}
        
        Create a compelling bid response including:
        1. Executive summary highlighting our value proposition
        2. Technical approach and methodology
        3. Project timeline with milestones
        4. Budget breakdown
        5. Team composition and expertise
        6. Risk mitigation strategies
        7. Key deliverables list
        
        Make it professional, detailed, and persuasive.`,
        response_json_schema: {
          type: "object",
          properties: {
            response_title: { type: "string" },
            executive_summary: { type: "string" },
            technical_approach: { type: "string" },
            timeline: { type: "string" },
            budget_breakdown: { type: "object" },
            team_composition: { type: "string" },
            risk_mitigation: { type: "string" },
            deliverables: { type: "array", items: { type: "string" } },
            ai_confidence_score: { type: "number" }
          }
        }
      });

      // Save the bid response
      const bidData = {
        tender_id: tenderId,
        ...result,
        status: "draft"
      };
      
      if (bidResponse) {
        await BidResponse.update(bidResponse.id, bidData);
      } else {
        await BidResponse.create(bidData);
      }
      
      setBidResponse(bidData);
      setActiveTab("bid");
    } catch (error) {
      console.error("Error generating bid response:", error);
    }
    setIsGeneratingBid(false);
  };

  if (!tender) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Tender not found</h2>
            <p className="text-slate-600">Please select a tender to analyze.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Tender Analysis</h1>
            <p className="text-slate-600 text-lg line-clamp-2">{tender.title}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-blue-100 text-blue-800">{tender.organization}</Badge>
              {tender.match_score && (
                <Badge className="bg-green-100 text-green-800">
                  {tender.match_score}% match
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={analyzeTender}
              disabled={isAnalyzing}
              className="bg-white/80 hover:bg-white"
            >
              <Brain className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : summary ? 'Re-analyze' : 'AI Analysis'}
            </Button>
            <Button
              onClick={generateBidResponse}
              disabled={isGeneratingBid || !summary}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Zap className={`w-4 h-4 mr-2 ${isGeneratingBid ? 'animate-pulse' : ''}`} />
              {isGeneratingBid ? 'Generating...' : bidResponse ? 'Regenerate Bid' : 'Generate Bid'}
            </Button>
          </div>
        </div>

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="tech" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Tech Requirements
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="bid" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Bid Response
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            <TenderSummaryView 
              tender={tender}
              summary={summary}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>

          <TabsContent value="tech" className="mt-6">
            <TechRequirements 
              tender={tender}
              summary={summary}
            />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <RiskAssessment 
              tender={tender}
              summary={summary}
            />
          </TabsContent>

          <TabsContent value="bid" className="mt-6">
            <BidResponseGenerator 
              tender={tender}
              bidResponse={bidResponse}
              isGenerating={isGeneratingBid}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}