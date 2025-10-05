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
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (Supports **bold**, *italic*, [links](url), and line breaks)
                </span>
              </label>
              <textarea
                id="contentEn"
                rows={6}
                value={formData.contentEn}
                onChange={(e) => handleInputChange('contentEn', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  errors.contentEn ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter content with markdown formatting:\n\n**Bold text** for emphasis\n*Italic text* for style\n[Link text](https://example.com) for links\n\nNew lines are preserved!"
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
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (يدعم **النص الغامق**، *النص المائل*، والروابط)
                </span>
              </label>
              <textarea
                id="contentAr"
                rows={6}
                dir="rtl"
                value={formData.contentAr}
                onChange={(e) => handleInputChange('contentAr', e.target.value)}
                onFocus={(e) => e.target.setAttribute('dir', 'rtl')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical text-right ${
                  errors.contentAr ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="أدخل المحتوى بالعربية:\n\n**نص غامق** للتأكيد\n*نص مائل* للأسلوب\n[نص الرابط](https://example.com) للروابط\n\nالأسطر الجديدة محفوظة!"
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

          {/* Formatting Help */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📝 Formatting Guide</h4>
            <div className="text-xs text-gray-600 space-y-4">
              
              {/* Basic Formatting */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">🎨 Basic Formatting:</p>
                  <ul className="space-y-1">
                    <li><code>**Bold text**</code> → <strong>Bold text</strong></li>
                    <li><code>*Italic text*</code> → <em>Italic text</em></li>
                    <li><code>[Link](url)</code> → <a href="#" className="text-blue-600 underline">Link</a></li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2" dir="rtl">🎨 التنسيق الأساسي:</p>
                  <ul className="space-y-1" dir="rtl">
                    <li><code>**نص غامق**</code> → <strong>نص غامق</strong></li>
                    <li><code>*نص مائل*</code> → <em>نص مائل</em></li>
                    <li><code>[رابط](url)</code> → <a href="#" className="text-blue-600 underline">رابط</a></li>
                  </ul>
                </div>
              </div>

              {/* Lists */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-300">
                <div>
                  <p className="font-medium mb-2">📋 Lists:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-700 mb-1">Bullet Lists:</p>
                      <pre className="text-xs bg-white p-2 rounded border">- First item{'\n'}- Second item{'\n'}- Third item</pre>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-1">Numbered Lists:</p>
                      <pre className="text-xs bg-white p-2 rounded border">1. First step{'\n'}2. Second step{'\n'}3. Third step</pre>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-1">Nested Lists:</p>
                      <pre className="text-xs bg-white p-2 rounded border">- Main item{'\n'}  - Sub item{'\n'}  - Another sub</pre>
                    </div>
                  </div>
                </div>
                <div dir="rtl">
                  <p className="font-medium mb-2">📋 القوائم:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-700 mb-1">القوائم النقطية:</p>
                      <pre className="text-xs bg-white p-2 rounded border" dir="rtl">- العنصر الأول{'\n'}- العنصر الثاني{'\n'}- العنصر الثالث</pre>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-1">القوائم المرقمة:</p>
                      <pre className="text-xs bg-white p-2 rounded border" dir="rtl">1. الخطوة الأولى{'\n'}2. الخطوة الثانية{'\n'}3. الخطوة الثالثة</pre>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-1">القوائم المتداخلة:</p>
                      <pre className="text-xs bg-white p-2 rounded border" dir="rtl">- عنصر رئيسي{'\n'}  - عنصر فرعي{'\n'}  - عنصر فرعي آخر</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-500">
                  💡 <strong>Tips:</strong> Use 2 spaces for nested items • Press Ctrl+Enter (Cmd+Enter) to save quickly • Line breaks are preserved automatically
                </p>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SubcategoryDialog;