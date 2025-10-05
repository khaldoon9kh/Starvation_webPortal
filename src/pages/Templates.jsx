import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, FileText, Filter, X } from 'lucide-react';
import useTemplatesStore from '../stores/templatesStore';
import TemplateDialog from '../components/TemplateDialog';
import TemplateRow from '../components/TemplateRow';
import EmptyState from '../components/EmptyState';

const Templates = () => {
  const { 
    templates, 
    isLoading, 
    error, 
    initializeTemplatesListener,
    clearError,
    moveUp,
    moveDown
  } = useTemplatesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);


  // Initialize templates on mount
  useEffect(() => {
    const unsubscribe = initializeTemplatesListener();
    return () => unsubscribe && unsubscribe();
  }, [initializeTemplatesListener]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(templates
      .map(template => template.category)
      .filter(Boolean)
    )];
    return uniqueCategories.sort();
  }, [templates]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = !searchQuery || 
        template.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.titleArabic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.descriptionArabic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [templates, searchQuery, selectedCategory]);

  // Dialog handlers
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setShowDialog(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingTemplate(null);
  };

  // Movement handlers
  const handleMoveUp = async (templateId) => {
    try {
      await moveUp(templateId);
    } catch (error) {
      console.error('Error moving template up:', error);
    }
  };

  const handleMoveDown = async (templateId) => {
    try {
      await moveDown(templateId);
    } catch (error) {
      console.error('Error moving template down:', error);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Sub-Header / Toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: Page Title with Icon */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Templates</h1>
            </div>
            
            {/* Right: Search, Filter, and Add Button */}
            <div className="flex items-center space-x-3">
              {/* Search Field */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
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
              
              {/* Add Template Button */}
              <button
                onClick={handleAddTemplate}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Meta Row */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {filteredTemplates.length} templates • {categories.length} categories
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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading templates...</span>
          </div>
        ) : error ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          templates.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet. Add your first template.</h3>
              <p className="text-gray-600 mb-6">
                Create your first template to get started with document management.
              </p>
              <button
                onClick={handleAddTemplate}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Template
              </button>
            </div>
          ) : (
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
          )
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template, index) => (
              <TemplateRow
                key={template.id}
                template={template}
                canMoveUp={index > 0}
                canMoveDown={index < filteredTemplates.length - 1}
                onEdit={handleEditTemplate}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <TemplateDialog
          isOpen={showDialog}
          onClose={handleCloseDialog}
          template={editingTemplate}
        />
      </div>
    </div>
  );
};

export default Templates;