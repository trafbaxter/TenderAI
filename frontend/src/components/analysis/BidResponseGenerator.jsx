import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  FileText, 
  Clock, 
  Users, 
  Shield, 
  CheckCircle,
  Download,
  Edit
} from "lucide-react";

export default function BidResponseGenerator({ tender, bidResponse, isGenerating }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedResponse, setEditedResponse] = React.useState(bidResponse || {});

  const handleSaveEdit = async () => {
    // Save edited response
    setIsEditing(false);
  };

  const downloadBid = () => {
    // Generate and download bid document
    console.log("Downloading bid response...");
  };

  const submitBid = () => {
    // Submit bid through integration
    console.log("Submitting bid...");
  };

  return (
    <div className="space-y-6">
      
      {/* Bid Response Header */}
      {bidResponse && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl mb-2">{bidResponse.response_title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={
                    bidResponse.status === 'submitted' ? 'bg-green-100 text-green-800' :
                    bidResponse.status === 'review' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }>
                    {bidResponse.status}
                  </Badge>
                  {bidResponse.ai_confidence_score && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      AI Confidence: {bidResponse.ai_confidence_score}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadBid}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={submitBid}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Bid
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Bid Content */}
      {isGenerating ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <Send className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">Generating Bid Response</h3>
              <p className="text-slate-500">AI is crafting a professional bid response...</p>
            </div>
          </CardContent>
        </Card>
      ) : bidResponse ? (
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Executive Summary & Technical Approach */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedResponse.executive_summary || bidResponse.executive_summary}
                    onChange={(e) => setEditedResponse(prev => ({ ...prev, executive_summary: e.target.value }))}
                    className="h-32"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{bidResponse.executive_summary}</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Technical Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedResponse.technical_approach || bidResponse.technical_approach}
                    onChange={(e) => setEditedResponse(prev => ({ ...prev, technical_approach: e.target.value }))}
                    className="h-40"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{bidResponse.technical_approach}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline & Team */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedResponse.timeline || bidResponse.timeline}
                    onChange={(e) => setEditedResponse(prev => ({ ...prev, timeline: e.target.value }))}
                    className="h-32"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{bidResponse.timeline}</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedResponse.team_composition || bidResponse.team_composition}
                    onChange={(e) => setEditedResponse(prev => ({ ...prev, team_composition: e.target.value }))}
                    className="h-32"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{bidResponse.team_composition}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Send className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No Bid Response Generated</h3>
            <p className="text-slate-500">
              Click "Generate Bid" to create a professional bid response using AI analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Deliverables & Risk Mitigation */}
      {bidResponse && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Key Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bidResponse.deliverables && bidResponse.deliverables.length > 0 ? (
                <div className="space-y-2">
                  {bidResponse.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{deliverable}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No deliverables specified</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Mitigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedResponse.risk_mitigation || bidResponse.risk_mitigation}
                  onChange={(e) => setEditedResponse(prev => ({ ...prev, risk_mitigation: e.target.value }))}
                  className="h-32"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">{bidResponse.risk_mitigation}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button for Editing */}
      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}