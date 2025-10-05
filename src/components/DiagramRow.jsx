import React, { useState } from 'react';
import { Edit2, Trash2, Tag, ChevronUp, ChevronDown, Eye, Download, X } from 'lucide-react';
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image Section */}
        {diagram.imageUrl && (
          <div className="relative">
            <img 
              src={diagram.imageUrl} 
              alt={diagram.title}
              className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setShowFullImage(true)}
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={() => setShowFullImage(true)}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                title="View full image"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleImageDownload}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {diagram.imageSize && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {formatFileSize(diagram.imageSize)}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {diagram.title}
                </h3>
                {diagram.order && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    #{diagram.order}
                  </span>
                )}
                {diagram.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Tag className="w-3 h-3 mr-1" />
                    {diagram.category}
                  </span>
                )}
              </div>
              {diagram.titleArabic && (
                <h4 className="text-lg font-medium text-gray-700 mb-3" dir="rtl">
                  {diagram.titleArabic}
                </h4>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Move Up Button */}
              <button
                onClick={() => onMoveUp(diagram.id)}
                disabled={!canMoveUp}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              
              {/* Move Down Button */}
              <button
                onClick={() => onMoveDown(diagram.id)}
                disabled={!canMoveDown}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Edit Button */}
              <button
                onClick={() => onEdit(diagram)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit diagram"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete diagram"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            {/* English Description */}
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Description</h5>
              <div className="text-gray-800">
                <FormattedContent content={diagram.description} />
              </div>
            </div>

            {/* Arabic Description */}
            {diagram.descriptionArabic && (
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-2">الوصف</h5>
                <div className="text-gray-800" dir="rtl">
                  <FormattedContent content={diagram.descriptionArabic} />
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          {(diagram.createdAt || diagram.updatedAt) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                {diagram.createdAt && (
                  <span>
                    Created: {new Date(diagram.createdAt.seconds * 1000).toLocaleDateString()}
                  </span>
                )}
                {diagram.updatedAt && diagram.updatedAt.seconds !== diagram.createdAt?.seconds && (
                  <span>
                    Updated: {new Date(diagram.updatedAt.seconds * 1000).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
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
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
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