import { useState } from 'react';
import { FileText, Download, Edit, Trash2, ChevronUp, ChevronDown, Calendar, HardDrive, Eye, ExternalLink } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import useTemplatesStore from '../stores/templatesStore';
import FormattedContent from './FormattedContent';

const TemplateRow = ({ template, canMoveUp, canMoveDown, onEdit, onMoveUp, onMoveDown, viewMode = 'grid' }) => {
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

  if (viewMode === 'grid') {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          {/* PDF Preview */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-32 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
              <FileText className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Template Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {template.title || 'Untitled Template'}
              </h3>
              {template.titleArabic && (
                <h4 className="text-sm text-gray-600 mt-1 line-clamp-2 text-right" dir="rtl">
                  {template.titleArabic}
                </h4>
              )}
            </div>

            {template.category && (
              <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {template.category}
              </div>
            )}

            <div className="text-sm text-gray-500">
              <FormattedContent content={template.description} className="line-clamp-3" />
            </div>

            {/* File Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center">
                <HardDrive className="h-3 w-3 mr-1" />
                {formatFileSize(template.pdfSize)}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(template.createdAt)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleView}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
              title="View PDF"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
              title="Download PDF"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </button>
            <button
              onClick={() => onEdit && onEdit(template)}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center justify-center"
              title="Edit Template"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
              title="Delete Template"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </button>
          </div>

          {/* Order Controls */}
          <div className="flex justify-center space-x-2 mt-3">
            <button
              onClick={handleMoveUp}
              disabled={!canMoveUp}
              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Move Up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={!canMoveDown}
              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Move Down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
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
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isDeleting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  Delete
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    );
  }

  // List view
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-4">
          {/* PDF Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-16 bg-red-50 border border-red-200 rounded flex items-center justify-center">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {template.title || 'Untitled Template'}
                  </h3>
                  {template.titleArabic && (
                    <h4 className="text-sm text-gray-600 text-right" dir="rtl">
                      {template.titleArabic}
                    </h4>
                  )}
                </div>

                {template.category && (
                  <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {template.category}
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <FormattedContent content={template.description} />
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <HardDrive className="h-3 w-3 mr-1" />
                    {formatFileSize(template.pdfSize)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(template.createdAt)}
                  </div>
                  {template.pdfOriginalName && (
                    <div>Original: {template.pdfOriginalName}</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Order Controls */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={handleMoveUp}
                    disabled={!canMoveUp}
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleMoveDown}
                    disabled={!canMoveDown}
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-1">
                  <button
                    onClick={handleView}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View PDF"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit && onEdit(template)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    title="Edit Template"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default TemplateRow;