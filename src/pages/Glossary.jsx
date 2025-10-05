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
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Sub-Header / Toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: Page Title with Icon */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Glossary</h1>
            </div>
            
            {/* Right: Search, Filter, and Add Button */}
            <div className="flex items-center space-x-3">
              {/* Search Field */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              
              {/* Category Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white min-w-[140px] transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              
              {/* Clear Filters */}
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
              
              {/* Add Term Button */}
              <button
                onClick={handleAddTerm}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Term
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Results Meta Row */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {filteredTerms.length} terms • {categories.length} categories
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {!searchQuery && !selectedCategory && (
              <span className="text-xs text-gray-500">
                Use ↑↓ buttons to reorder
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading terms...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && terms.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No terms yet. Add your first term.</h3>
            <p className="text-gray-600 mb-6">
              Build your glossary by adding terms and definitions that help explain your content.
            </p>
            <button
              onClick={handleAddTerm}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Term
            </button>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && terms.length > 0 && filteredTerms.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 text-green-600 border border-green-600 rounded-full hover:bg-green-50 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Terms List */}
        {!isLoading && filteredTerms.length > 0 && (
          <div className="space-y-3">
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
    </div>
  );
};

export default Glossary;