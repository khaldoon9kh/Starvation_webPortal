import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Image as ImageIcon, Filter, X } from 'lucide-react';
import useDiagramsStore from '../stores/diagramsStore';
import DiagramDialog from '../components/DiagramDialog';
import DiagramRow from '../components/DiagramRow';

const Diagrams = () => {
  const { 
    diagrams, 
    isLoading, 
    error, 
    initializeDiagrams,
    clearError,
    moveDiagramUp,
    moveDiagramDown
  } = useDiagramsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingDiagram, setEditingDiagram] = useState(null);


  // Initialize diagrams on mount
  useEffect(() => {
    initializeDiagrams();
  }, [initializeDiagrams]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(diagrams.filter(diagram => diagram.category).map(diagram => diagram.category))];
    return cats.sort();
  }, [diagrams]);

  // Filter diagrams based on search and category
  const filteredDiagrams = useMemo(() => {
    let filtered = diagrams;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(diagram =>
        diagram.title.toLowerCase().includes(query) ||
        diagram.titleArabic?.toLowerCase().includes(query) ||
        diagram.description.toLowerCase().includes(query) ||
        diagram.descriptionArabic?.toLowerCase().includes(query) ||
        diagram.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(diagram => diagram.category === selectedCategory);
    }

    return filtered;
  }, [diagrams, searchQuery, selectedCategory]);

  const handleAddDiagram = () => {
    setEditingDiagram(null);
    setShowDialog(true);
  };

  const handleEditDiagram = (diagram) => {
    setEditingDiagram(diagram);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingDiagram(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const handleMoveDiagramUp = async (diagramId) => {
    try {
      await moveDiagramUp(diagramId);
    } catch (error) {
      console.error('Error moving diagram up:', error);
    }
  };

  const handleMoveDiagramDown = async (diagramId) => {
    try {
      await moveDiagramDown(diagramId);
    } catch (error) {
      console.error('Error moving diagram down:', error);
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
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Diagrams</h1>
            </div>
            
            {/* Right: Search, Filter, and Add Button */}
            <div className="flex items-center space-x-3">
              {/* Search Field */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search diagrams..."
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
              
              {/* Add Diagram Button */}
              <button
                onClick={handleAddDiagram}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Diagram
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
              {filteredDiagrams.length} diagrams • {categories.length} categories
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
            <span className="ml-3 text-gray-600">Loading diagrams...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && diagrams.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams yet. Add your first diagram.</h3>
            <p className="text-gray-600 mb-6">
              Start building your visual library by uploading diagrams with descriptions.
            </p>
            <button
              onClick={handleAddDiagram}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Diagram
            </button>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && diagrams.length > 0 && filteredDiagrams.length === 0 && (
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

        {/* Diagrams List */}
        {!isLoading && filteredDiagrams.length > 0 && (
          <div className="space-y-3">
            {filteredDiagrams.map((diagram, index) => (
              <DiagramRow
                key={diagram.id}
                diagram={diagram}
                onEdit={handleEditDiagram}
                canMoveUp={index > 0}
                canMoveDown={index < filteredDiagrams.length - 1}
                onMoveUp={handleMoveDiagramUp}
                onMoveDown={handleMoveDiagramDown}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <DiagramDialog
          isOpen={showDialog}
          onClose={handleCloseDialog}
          diagram={editingDiagram}
        />
      </div>
    </div>
  );
};

export default Diagrams;