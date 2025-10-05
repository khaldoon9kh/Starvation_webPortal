import React, { useState } from 'react';
import { Edit2, Trash2, Tag, ChevronUp, ChevronDown } from 'lucide-react';
import useGlossaryStore from '../stores/glossaryStore';
import FormattedContent from './FormattedContent';

const GlossaryRow = ({ term, onEdit, canMoveUp, canMoveDown, onMoveUp, onMoveDown }) => {
  const { deleteTerm } = useGlossaryStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTerm(term.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting term:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="glossary-card">
        <div className="p-6 pl-8 glossary-card-content">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                {/* Primary EN Term */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {term.term}
                </h3>
                
                {/* AR Badge/Chip */}
                {term.termArabic && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 max-w-[200px] truncate" dir="rtl" title={term.termArabic}>
                    {term.termArabic.length > 15 ? `${term.termArabic.substring(0, 15)}...` : term.termArabic}
                  </span>
                )}
                
                {/* Category Chip */}
                {term.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <Tag className="w-3 h-3 mr-1" />
                    {term.category}
                  </span>
                )}
              </div>
            </div>
            
            {/* Compact Action Icons */}
            <div className="flex items-center space-x-1">
              {/* Move Up Button */}
              <button
                onClick={() => onMoveUp(term.id)}
                disabled={!canMoveUp}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                title="Move up"
                aria-label="Move term up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              
              {/* Move Down Button */}
              <button
                onClick={() => onMoveDown(term.id)}
                disabled={!canMoveDown}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                title="Move down"
                aria-label="Move term down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Edit Button */}
              <button
                onClick={() => onEdit(term)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                title="Edit term"
                aria-label="Edit term"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                title="Delete term"
                aria-label="Delete term"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
        </div>

          {/* Definitions - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 glossary-definitions">
            {/* English Definition Panel */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Definition</h5>
              <div className="text-gray-800 leading-relaxed">
                <FormattedContent content={term.definition} />
              </div>
            </div>

            {/* Arabic Definition Panel */}
            {term.definitionArabic && (
              <div className="space-y-2" dir="rtl">
                <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">التعريف</h5>
                <div className="text-gray-800 leading-relaxed">
                  <FormattedContent content={term.definitionArabic} />
                </div>
              </div>
            )}
          </div>

          {/* Metadata Footer */}
          {(term.createdAt || term.updatedAt) && (
            <div className="mt-6 pt-3 border-t border-gray-100">
              <div className="flex justify-end text-xs text-gray-500">
                {term.updatedAt && term.updatedAt.seconds !== term.createdAt?.seconds ? (
                  <span>Updated: {new Date(term.updatedAt.seconds * 1000).toLocaleDateString()}</span>
                ) : term.createdAt ? (
                  <span>Created: {new Date(term.createdAt.seconds * 1000).toLocaleDateString()}</span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Term</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{term.term}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlossaryRow;