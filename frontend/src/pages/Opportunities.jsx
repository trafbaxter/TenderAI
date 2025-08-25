import React, { useState, useEffect } from "react";
import { Tender } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RefreshCw, Target } from "lucide-react";
import { motion } from "framer-motion";

import OpportunityCard from "../components/opportunities/OpportunityCard";
import OpportunityFilters from "../components/opportunities/OpportunityFilters";

export default function OpportunitiesPage() {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minMatchScore: 0,
    category: "",
    budgetRange: "",
    status: "active"
  });

  useEffect(() => {
    loadTenders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tenders, searchTerm, filters]);

  const loadTenders = async () => {
    setIsLoading(true);
    try {
      const data = await Tender.list('-match_score');
      setTenders(data);
    } catch (error) {
      console.error("Error loading tenders:", error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...tenders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tender => 
        tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Match score filter
    if (filters.minMatchScore > 0) {
      filtered = filtered.filter(tender => (tender.match_score || 0) >= filters.minMatchScore);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(tender => tender.category === filters.category);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(tender => tender.status === filters.status);
    }

    // Budget range filter
    if (filters.budgetRange) {
      const [min, max] = filters.budgetRange.split('-').map(Number);
      filtered = filtered.filter(tender => {
        const budget = tender.budget_max || 0;
        if (max) {
          return budget >= min && budget <= max;
        } else {
          return budget >= min;
        }
      });
    }

    setFilteredTenders(filtered);
  };

  const refreshTenders = () => {
    loadTenders();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Tender Opportunities</h1>
            <div className="flex items-center gap-4">
              <p className="text-slate-600 text-lg">
                {filteredTenders.length} opportunities found
              </p>
              <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800">
                AI Matched
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={refreshTenders}
              disabled={isLoading}
              className="bg-white/80 hover:bg-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <OpportunityFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search opportunities by title, description, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white/80 border-slate-200 focus:bg-white"
              />
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="space-y-6">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-slate-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : filteredTenders.length > 0 ? (
              <div className="space-y-6">
                {filteredTenders.map((tender, index) => (
                  <motion.div
                    key={tender.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <OpportunityCard tender={tender} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Target className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-700 mb-4">No opportunities found</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Try adjusting your filters or search terms. The AI agent continues to scan for new opportunities that match your portfolio.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}