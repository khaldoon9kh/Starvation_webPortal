import React, { useState } from 'react';
import { Edit2, Trash2, Tag, ChevronUp, ChevronDown, Eye, Download, X, Image as ImageIcon } from 'lucide-react';
import useDiagramsStore from '../stores/diagramsStore';
import FormattedContent from './FormattedContent';

const DiagramRow = ({ diagram, onEdit, canMoveUp, canMoveDown, onMoveUp, onMoveDown }) => {
  const { deleteDiagram } = useDiagramsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDiagram(diagram.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting diagram:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageDownload = () => {
    if (diagram.imageUrl) {
      const link = document.createElement('a');
      link.href = diagram.imageUrl;
      link.download = diagram.imageOriginalName || `${diagram.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="diagram-card bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:bg-green-50 overflow-hidden">
        <div className="flex">
          {/* Thumbnail Section */}
          <div className="diagram-thumbnail flex-shrink-0">
            {diagram.imageUrl ? (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                <img 
                  src={diagram.imageUrl} 
                  alt={diagram.title}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform rounded-md"
                  onClick={() => setShowFullImage(true)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-colors rounded-md"></div>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-md flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 p-4 diagram-details">
            {/* Header Row with Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                {/* Titles Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                  {/* English Title */}
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {diagram.title}
                    </h3>
                    {diagram.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                        <Tag className="w-3 h-3 mr-1" />
                        {diagram.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Arabic Title */}
                  {diagram.titleArabic && (
                    <div className="lg:text-right" dir="rtl">
                      <h4 className="text-lg font-medium text-gray-700 truncate">
                        {diagram.titleArabic}
                      </h4>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Compact Action Icons */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Move Up Button */}
                <button
                  onClick={() => onMoveUp(diagram.id)}
                  disabled={!canMoveUp}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Move up"
                  aria-label="Move diagram up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                
                {/* Move Down Button */}
                <button
                  onClick={() => onMoveDown(diagram.id)}
                  disabled={!canMoveDown}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Move down"
                  aria-label="Move diagram down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Edit Button */}
                <button
                  onClick={() => onEdit(diagram)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Edit diagram"
                  aria-label="Edit diagram"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Delete diagram"
                  aria-label="Delete diagram"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Descriptions - Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* English Description Panel */}
              <div className="space-y-1">
                <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</h5>
                <div className="text-gray-800 leading-relaxed text-sm">
                  <FormattedContent content={diagram.description} />
                </div>
              </div>

              {/* Arabic Description Panel */}
              {diagram.descriptionArabic && (
                <div className="space-y-1" dir="rtl">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">الوصف</h5>
                  <div className="text-gray-800 leading-relaxed text-sm">
                    <FormattedContent content={diagram.descriptionArabic} />
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Footer */}
            {(diagram.createdAt || diagram.updatedAt) && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-end text-xs text-gray-500">
                  {diagram.updatedAt && diagram.updatedAt.seconds !== diagram.createdAt?.seconds ? (
                    <span>Updated: {new Date(diagram.updatedAt.seconds * 1000).toLocaleDateString()}</span>
                  ) : diagram.createdAt ? (
                    <span>Created: {new Date(diagram.createdAt.seconds * 1000).toLocaleDateString()}</span>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && diagram.imageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={diagram.imageUrl} 
              alt={diagram.title}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded">
              <h4 className="font-medium">{diagram.title}</h4>
              {diagram.titleArabic && (
                <p className="text-sm mt-1" dir="rtl">{diagram.titleArabic}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Diagram</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{diagram.title}"? This action cannot be undone and will also delete the associated image.
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

export default DiagramRow;