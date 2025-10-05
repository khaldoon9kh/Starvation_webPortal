import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Image as ImageIcon, Filter, X, Tag, Grid, List } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <ImageIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Diagrams</h1>
            <p className="text-gray-600 mt-1">
              Manage visual diagrams and illustrations for your content library
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAddDiagram}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Diagram
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

      {/* Filters and View Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search diagrams by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-0 lg:min-w-[200px]">
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

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
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
            {filteredDiagrams.length} of {diagrams.length} diagrams
          </span>
          {categories.length > 0 && (
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              {categories.length} categories
            </span>
          )}
          {!searchQuery && !selectedCategory && (
            <span className="text-xs text-gray-500">
              • Use ↑↓ buttons to reorder diagrams
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading diagrams...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && diagrams.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first diagram with an image and description.
          </p>
          <button
            onClick={handleAddDiagram}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Diagram
          </button>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && diagrams.length > 0 && filteredDiagrams.length === 0 && (
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

      {/* Diagrams Grid/List */}
      {!isLoading && filteredDiagrams.length > 0 && (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-6"
        }>
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
  );
};

export default Diagrams;