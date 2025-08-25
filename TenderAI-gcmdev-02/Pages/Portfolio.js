import React, { useState, useEffect } from "react";
import { Portfolio } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import PortfolioForm from "../components/portfolio/PortfolioForm";
import PortfolioGrid from "../components/portfolio/PortfolioGrid";

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const data = await Portfolio.list('-created_date');
      setPortfolio(data);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (itemData) => {
    try {
      if (editingItem) {
        await Portfolio.update(editingItem.id, itemData);
      } else {
        await Portfolio.create(itemData);
      }
      setShowForm(false);
      setEditingItem(null);
      loadPortfolio();
    } catch (error) {
      console.error("Error saving portfolio item:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      try {
        await Portfolio.delete(item.id);
        loadPortfolio();
      } catch (error) {
        console.error("Error deleting portfolio item:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Portfolio Management</h1>
            <p className="text-slate-600 text-lg">
              Manage your capabilities and past projects to improve tender matching
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Portfolio Item
          </Button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowForm(false);
                  setEditingItem(null);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <PortfolioForm
                  item={editingItem}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portfolio Grid */}
        <PortfolioGrid 
          portfolio={portfolio}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}