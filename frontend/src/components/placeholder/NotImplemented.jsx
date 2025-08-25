import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function NotImplemented({ title = "Feature", description = "This feature is coming soon!" }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-4">
              <Construction className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-slate-800">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 text-lg mb-6">{description}</p>
            <p className="text-sm text-slate-500">
              This page is part of the TenderAI application and will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}