import { useState } from 'react';
import { FileText, Download, Edit, Trash2, ChevronUp, ChevronDown, Calendar, HardDrive, Eye, ExternalLink } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import useTemplatesStore from '../stores/templatesStore';
import FormattedContent from './FormattedContent';

const TemplateRow = ({ template, canMoveUp, canMoveDown, onEdit, onMoveUp, onMoveDown }) => {
  const {
    removeTemplate
  } = useTemplatesStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle template deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await removeTemplate(template.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle PDF download
  const handleDownload = () => {
    if (template.pdfUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = template.pdfUrl;
      link.download = template.pdfOriginalName || 'template.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle PDF view in new tab
  const handleView = () => {
    if (template.pdfUrl) {
      window.open(template.pdfUrl, '_blank');
    }
  };

  // Move template up
  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(template.id);
    }
  };

  // Move template down
  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(template.id);
    }
  };

  return (
    <>
      <div className="template-card bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:bg-orange-50 overflow-hidden">
        <div className="flex">
          {/* PDF Icon Section */}
          <div className="template-thumbnail flex-shrink-0">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <div className="w-full h-full bg-red-50 border border-red-200 rounded-md flex items-center justify-center">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 p-4 template-details">
            {/* Header Row with Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                {/* Titles Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                  {/* English Title */}
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {template.title || 'Untitled Template'}
                    </h3>
                    {template.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 flex-shrink-0">
                        {template.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Arabic Title */}
                  {template.titleArabic && (
                    <div className="lg:text-right" dir="rtl">
                      <h4 className="text-lg font-medium text-gray-700 truncate">
                        {template.titleArabic}
                      </h4>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Compact Action Icons */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Move Up Button */}
                <button
                  onClick={handleMoveUp}
                  disabled={!canMoveUp}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Move up"
                  aria-label="Move template up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                
                {/* Move Down Button */}
                <button
                  onClick={handleMoveDown}
                  disabled={!canMoveDown}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Move down"
                  aria-label="Move template down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* View Button */}
                <button
                  onClick={handleView}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="View PDF"
                  aria-label="View PDF"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Download PDF"
                  aria-label="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                {/* Edit Button */}
                <button
                  onClick={() => onEdit && onEdit(template)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Edit template"
                  aria-label="Edit template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  title="Delete template"
                  aria-label="Delete template"
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
                  <FormattedContent content={template.description} />
                </div>
              </div>

              {/* Arabic Description Panel */}
              {template.descriptionArabic && (
                <div className="space-y-1" dir="rtl">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">الوصف</h5>
                  <div className="text-gray-800 leading-relaxed text-sm">
                    <FormattedContent content={template.descriptionArabic} />
                  </div>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <HardDrive className="h-3 w-3 mr-1" />
                {formatFileSize(template.pdfSize)}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(template.createdAt)}
              </div>
              {template.pdfOriginalName && (
                <div className="truncate">Original: {template.pdfOriginalName}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold mb-4">Delete Template</Dialog.Title>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{template.title}"? This will also remove the PDF file from storage. This action cannot be undone.
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
                {isDeleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <span>Delete</span>
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default TemplateRow;