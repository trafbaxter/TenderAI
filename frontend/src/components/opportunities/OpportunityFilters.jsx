import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter } from "lucide-react";

export default function OpportunityFilters({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Match Score */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">
            Minimum Match Score: {filters.minMatchScore}%
          </Label>
          <Slider
            value={[filters.minMatchScore]}
            onValueChange={([value]) => updateFilter('minMatchScore', value)}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Status</Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget Range */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Budget Range</Label>
          <Select value={filters.budgetRange} onValueChange={(value) => updateFilter('budgetRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Any Budget</SelectItem>
              <SelectItem value="0-50000">$0 - $50K</SelectItem>
              <SelectItem value="50000-250000">$50K - $250K</SelectItem>
              <SelectItem value="250000-1000000">$250K - $1M</SelectItem>
              <SelectItem value="1000000-5000000">$1M - $5M</SelectItem>
              <SelectItem value="5000000">$5M+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Category</Label>
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Any Category</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}