import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, BookOpen, Filter, X, Tag } from 'lucide-react';
import useGlossaryStore from '../stores/glossaryStore';
import GlossaryDialog from '../components/GlossaryDialog';
import GlossaryRow from '../components/GlossaryRow';

const Glossary = () => {
  const { 
    terms, 
    isLoading, 
    error, 
    initializeGlossary,
    clearError,
    moveTermUp,
    moveTermDown
  } = useGlossaryStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);

  // Initialize glossary on mount
  useEffect(() => {
    initializeGlossary();
  }, [initializeGlossary]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(terms.filter(term => term.category).map(term => term.category))];
    return cats.sort();
  }, [terms]);

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    let filtered = terms;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(term =>
        term.term.toLowerCase().includes(query) ||
        term.termArabic?.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        term.definitionArabic?.toLowerCase().includes(query) ||
        term.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(term => term.category === selectedCategory);
    }

    return filtered;
  }, [terms, searchQuery, selectedCategory]);

  const handleAddTerm = () => {
    setEditingTerm(null);
    setShowDialog(true);
  };

  const handleEditTerm = (term) => {
    setEditingTerm(term);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingTerm(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const handleMoveTermUp = async (termId) => {
    try {
      await moveTermUp(termId);
    } catch (error) {
      console.error('Error moving term up:', error);
    }
  };

  const handleMoveTermDown = async (termId) => {
    try {
      await moveTermDown(termId);
    } catch (error) {
      console.error('Error moving term down:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Glossary</h1>
            <p className="text-gray-600 mt-1">
              Manage terms and definitions for your content library
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAddTerm}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Term
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search terms, definitions, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-0 sm:min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>
            {filteredTerms.length} of {terms.length} terms
          </span>
          {categories.length > 0 && (
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              {categories.length} categories
            </span>
          )}
          {!searchQuery && !selectedCategory && (
            <span className="text-xs text-gray-500">
              • Use ↑↓ buttons to reorder terms
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading terms...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && terms.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No terms yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first glossary term.
          </p>
          <button
            onClick={handleAddTerm}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Term
          </button>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && terms.length > 0 && filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Terms List */}
      {!isLoading && filteredTerms.length > 0 && (
        <div className="space-y-4">
          {filteredTerms.map((term, index) => (
            <GlossaryRow
              key={term.id}
              term={term}
              onEdit={handleEditTerm}
              canMoveUp={index > 0}
              canMoveDown={index < filteredTerms.length - 1}
              onMoveUp={handleMoveTermUp}
              onMoveDown={handleMoveTermDown}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <GlossaryDialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        term={editingTerm}
      />
    </div>
  );
};

export default Glossary;