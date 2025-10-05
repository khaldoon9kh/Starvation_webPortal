import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, HelpCircle, Plus } from 'lucide-react';
import useTemplatesStore from '../stores/templatesStore';

const TemplateDialog = ({ isOpen, onClose, template = null }) => {
  const { addTemplate, editTemplate } = useTemplatesStore();
  
  const [formData, setFormData] = useState({
    title: '',
    titleArabic: '',
    description: '',
    descriptionArabic: '',
    category: ''
  });
  
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Reset form when dialog opens/closes or template changes
  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title || '',
        titleArabic: template.titleArabic || '',
        description: template.description || '',
        descriptionArabic: template.descriptionArabic || '',
        category: template.category || ''
      });
      setPdfPreview(template.pdfUrl || null);
      setSelectedPdf(null);
    } else {
      setFormData({
        title: '',
        titleArabic: '',
        description: '',
        descriptionArabic: '',
        category: ''
      });
      setPdfPreview(null);
      setSelectedPdf(null);
    }
  }, [template, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle PDF file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 50MB');
      return;
    }

    setSelectedPdf(file);
    setPdfPreview({
      name: file.name,
      size: file.size
    });
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Create a fake event to reuse file selection logic
      handleFileSelect({ target: { files: [file] } });
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title.');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description.');
      return;
    }
    
    if (!template && !selectedPdf) {
      alert('Please select a PDF file.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (template) {
        await editTemplate(template.id, formData, selectedPdf);
      } else {
        await addTemplate(formData, selectedPdf);
      }
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="template-dialog-backdrop bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="template-dialog-content bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {template ? 'Edit Template' : 'Add New Template'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PDF Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              PDF File {!template && <span className="text-red-500">*</span>}
            </label>
            
            {/* Current PDF (edit mode) */}
            {template?.pdfUrl && !selectedPdf && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{template.pdfOriginalName}</p>
                    <p className="text-sm text-gray-500">
                      Current PDF • {formatFileSize(template.pdfSize)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(template.pdfUrl, '_blank')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Upload a new PDF to replace the current one
                </p>
              </div>
            )}

            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {pdfPreview ? (
                <div className="space-y-2">
                  <FileText className="mx-auto h-12 w-12 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{pdfPreview.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(pdfPreview.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPdf(null);
                      setPdfPreview(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">PDF files up to 50MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title in English..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Arabic)
              </label>
              <input
                type="text"
                value={formData.titleArabic}
                onChange={(e) => handleInputChange('titleArabic', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="أدخل العنوان بالعربية..."
                dir="rtl"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Forms, Reports, Guidelines..."
            />
          </div>

          {/* Description Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the template's purpose and contents..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Arabic)
              </label>
              <textarea
                value={formData.descriptionArabic}
                onChange={(e) => handleInputChange('descriptionArabic', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="اوصف الغرض من النموذج ومحتوياته..."
                dir="rtl"
              />
            </div>
          </div>

          {/* Help Section */}
          {showHelp && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>PDF Requirements:</strong>
                  <ul className="ml-4 mt-1 space-y-1 list-disc">
                    <li>File format: PDF only</li>
                    <li>Maximum size: 50MB</li>
                    <li>Ensure text is searchable (not scanned image)</li>
                    <li>Use descriptive filenames</li>
                  </ul>
                </div>
                <div>
                  <strong>Content Tips:</strong>
                  <ul className="ml-4 mt-1 space-y-1 list-disc">
                    <li>Use clear, descriptive titles</li>
                    <li>Provide detailed descriptions for better searchability</li>
                    <li>Categorize consistently for easier organization</li>
                    <li>Include Arabic translations when possible</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{template ? 'Update' : 'Add'} Template</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateDialog;