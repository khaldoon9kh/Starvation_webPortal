import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Palette } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { createSubcategory, updateSubcategory } from '../services/contentService';

const SubcategoryDialog = () => {
  const { subcategoryModal, closeSubcategoryModal, setError } = useContentStore();
  const { isOpen, mode, categoryId, subcategory } = subcategoryModal;

  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    contentEn: '',
    contentAr: '',
    colorHex: '#37B24D'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or subcategory changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && subcategory) {
        setFormData({
          titleEn: subcategory.titleEn || '',
          titleAr: subcategory.titleAr || '',
          contentEn: subcategory.contentEn || '',
          contentAr: subcategory.contentAr || '',
          colorHex: subcategory.colorHex || '#37B24D'
        });
      } else {
        setFormData({
          titleEn: '',
          titleAr: '',
          contentEn: '',
          contentAr: '',
          colorHex: '#37B24D'
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, subcategory]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titleEn.trim()) {
      newErrors.titleEn = 'English title is required';
    }

    if (!formData.titleAr.trim()) {
      newErrors.titleAr = 'Arabic title is required';
    }

    if (!formData.contentEn.trim()) {
      newErrors.contentEn = 'English content is required';
    }

    if (!formData.contentAr.trim()) {
      newErrors.contentAr = 'Arabic content is required';
    }

    if (!formData.colorHex.match(/^#[0-9A-Fa-f]{6}$/)) {
      newErrors.colorHex = 'Color must be a valid hex code (e.g., #37B24D)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    handleInputChange('colorHex', color);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (mode === 'add') {
        await createSubcategory(categoryId, formData);
      } else {
        await updateSubcategory(subcategory.id, formData);
      }
      closeSubcategoryModal();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      setError(`Failed to ${mode} subcategory`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeSubcategoryModal();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeSubcategoryModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="subcategoryClass fixed inset-0 bg-black/50 animate-in fade-in-0" />
        <Dialog.Content 
          className="subcategory-dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Add Subcategory' : 'Edit Subcategory'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* English Title */}
            <div>
              <label htmlFor="titleEn" className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category Title EN *
              </label>
              <input
                type="text"
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => handleInputChange('titleEn', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.titleEn ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter English title"
                required
              />
              {errors.titleEn && (
                <p className="mt-1 text-sm text-red-600">{errors.titleEn}</p>
              )}
            </div>

            {/* Arabic Title */}
            <div>
              <label htmlFor="titleAr" className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category Title AR *
              </label>
              <input
                type="text"
                id="titleAr"
                dir="rtl"
                value={formData.titleAr}
                onChange={(e) => handleInputChange('titleAr', e.target.value)}
                onFocus={(e) => e.target.setAttribute('dir', 'rtl')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right ${
                  errors.titleAr ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="أدخل العنوان بالعربية"
                required
              />
              {errors.titleAr && (
                <p className="mt-1 text-sm text-red-600">{errors.titleAr}</p>
              )}
            </div>

            {/* English Content */}
            <div>
              <label htmlFor="contentEn" className="block text-sm font-medium text-gray-700 mb-2">
                Content EN *
              </label>
              <textarea
                id="contentEn"
                rows={4}
                value={formData.contentEn}
                onChange={(e) => handleInputChange('contentEn', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  errors.contentEn ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter English content"
                required
              />
              {errors.contentEn && (
                <p className="mt-1 text-sm text-red-600">{errors.contentEn}</p>
              )}
            </div>

            {/* Arabic Content */}
            <div>
              <label htmlFor="contentAr" className="block text-sm font-medium text-gray-700 mb-2">
                Content AR *
              </label>
              <textarea
                id="contentAr"
                rows={4}
                dir="rtl"
                value={formData.contentAr}
                onChange={(e) => handleInputChange('contentAr', e.target.value)}
                onFocus={(e) => e.target.setAttribute('dir', 'rtl')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical text-right ${
                  errors.contentAr ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="أدخل المحتوى بالعربية"
                required
              />
              {errors.contentAr && (
                <p className="mt-1 text-sm text-red-600">{errors.contentAr}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <label htmlFor="colorHex" className="block text-sm font-medium text-gray-700 mb-2">
                Color *
              </label>
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.colorHex}
                    onChange={handleColorChange}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Palette className="absolute top-2 left-2 h-6 w-6 text-gray-600 pointer-events-none" />
                </div>
                <input
                  type="text"
                  id="colorHex"
                  value={formData.colorHex}
                  onChange={(e) => handleInputChange('colorHex', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                    errors.colorHex ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="#37B24D"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                />
                <div 
                  className="w-10 h-10 border border-gray-300 rounded-md"
                  style={{ backgroundColor: formData.colorHex }}
                  title={formData.colorHex}
                />
              </div>
              {errors.colorHex && (
                <p className="mt-1 text-sm text-red-600">{errors.colorHex}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeSubcategoryModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'add' ? 'Add Subcategory' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-500">
            <p>Tip: Press Ctrl+Enter (or Cmd+Enter) to save quickly</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SubcategoryDialog;