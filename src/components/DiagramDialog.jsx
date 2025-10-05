import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Upload, HelpCircle, Eye, Trash2 } from 'lucide-react';
import useDiagramsStore from '../stores/diagramsStore';

const DiagramDialog = ({ isOpen, onClose, diagram = null }) => {
  const { addDiagram, updateDiagram } = useDiagramsStore();
  
  const [formData, setFormData] = useState({
    title: '',
    titleArabic: '',
    description: '',
    descriptionArabic: '',
    category: ''
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Reset form when dialog opens/closes or diagram changes
  useEffect(() => {
    if (diagram) {
      setFormData({
        title: diagram.title || '',
        titleArabic: diagram.titleArabic || '',
        description: diagram.description || '',
        descriptionArabic: diagram.descriptionArabic || '',
        category: diagram.category || ''
      });
      setImagePreview(diagram.imageUrl || null);
      setSelectedImage(null);
    } else {
      setFormData({
        title: '',
        titleArabic: '',
        description: '',
        descriptionArabic: '',
        category: ''
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [diagram, isOpen]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (!diagram && !selectedImage) {
      alert('Please select an image for the diagram');
      return;
    }

    setIsSubmitting(true);

    try {
      if (diagram) {
        await updateDiagram(diagram.id, formData, selectedImage);
      } else {
        await addDiagram(formData, selectedImage);
      }
      onClose();
    } catch (error) {
      console.error('Error saving diagram:', error);
      alert('Error saving diagram. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="diagram-dialog-backdrop bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="diagram-dialog-content bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {diagram ? 'Edit Diagram' : 'Add New Diagram'}
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

        {/* Help Section */}
        {showHelp && (
          <div className="p-6 bg-blue-50 border-b">
            <h3 className="font-medium text-blue-900 mb-3">Diagram Guidelines</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>Image Requirements:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                  <li>• Maximum size: 10MB</li>
                  <li>• Recommended resolution: 1200x800px or higher</li>
                  <li>• High contrast for better readability</li>
                </ul>
              </div>
              <div>
                <strong>Content Tips:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Use descriptive titles that explain the diagram's purpose</li>
                  <li>• Include detailed descriptions to aid understanding</li>
                  <li>• Categorize diagrams for easy organization</li>
                  <li>• Support both English and Arabic for bilingual content</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagram Image {!diagram && '*'}
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-contain border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {selectedImage ? selectedImage.name : 'Current image'}
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </div>
              </label>
            </div>
          </div>

          {/* Title (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (English) *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter diagram title in English"
              required
            />
          </div>

          {/* Title (Arabic) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Arabic)
            </label>
            <input
              type="text"
              value={formData.titleArabic}
              onChange={(e) => handleInputChange('titleArabic', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
              placeholder="أدخل عنوان المخطط بالعربية"
              dir="rtl"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Biology, Anatomy, Process Flow, System Architecture"
            />
          </div>

          {/* Description (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (English) *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Describe what this diagram shows, its components, and how to interpret it..."
              required
            />
          </div>

          {/* Description (Arabic) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Arabic)
            </label>
            <textarea
              value={formData.descriptionArabic}
              onChange={(e) => handleInputChange('descriptionArabic', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-right"
              placeholder="اوصف ما يُظهره هذا المخطط، ومكوناته، وكيفية تفسيره..."
              dir="rtl"
            />
          </div>

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
                  <span>{diagram ? 'Update' : 'Add'} Diagram</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagramDialog;