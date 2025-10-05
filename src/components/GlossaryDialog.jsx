import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, HelpCircle } from 'lucide-react';
import useGlossaryStore from '../stores/glossaryStore';

const GlossaryDialog = ({ isOpen, onClose, term = null }) => {
  const { addTerm, updateTerm } = useGlossaryStore();
  
  const [formData, setFormData] = useState({
    term: '',
    termArabic: '',
    definition: '',
    definitionArabic: '',
    category: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Reset form when dialog opens/closes or term changes
  useEffect(() => {
    if (term) {
      setFormData({
        term: term.term || '',
        termArabic: term.termArabic || '',
        definition: term.definition || '',
        definitionArabic: term.definitionArabic || '',
        category: term.category || ''
      });
    } else {
      setFormData({
        term: '',
        termArabic: '',
        definition: '',
        definitionArabic: '',
        category: ''
      });
    }
  }, [term, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (term) {
        await updateTerm(term.id, formData);
      } else {
        await addTerm(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving term:', error);
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
    <div className="glossary-dialog-backdrop bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glossary-dialog-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {term ? 'Edit Term' : 'Add New Term'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Formatting Help"
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
            <h3 className="font-medium text-blue-900 mb-3">Formatting Guide</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>Basic Formatting:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• **Bold Text** → <strong>Bold Text</strong></li>
                  <li>• *Italic Text* → <em>Italic Text</em></li>
                  <li>• [Link Text](URL) → Links</li>
                </ul>
              </div>
              <div>
                <strong>Linking Terms:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Use {"{term}"} to link to other glossary terms</li>
                  <li>• Example: "This concept relates to {"{photosynthesis}"} process"</li>
                  <li>• Works in both English and Arabic definitions</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* English Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term (English) *
            </label>
            <input
              type="text"
              value={formData.term}
              onChange={(e) => handleInputChange('term', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter term in English"
              required
            />
          </div>

          {/* Arabic Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term (Arabic)
            </label>
            <input
              type="text"
              value={formData.termArabic}
              onChange={(e) => handleInputChange('termArabic', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
              placeholder="أدخل المصطلح بالعربية"
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
              placeholder="e.g., Biology, Chemistry, Medical"
            />
          </div>

          {/* English Definition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Definition (English) *
            </label>
            <textarea
              value={formData.definition}
              onChange={(e) => handleInputChange('definition', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Enter definition in English. Use {term} to link to other glossary terms."
              required
            />
          </div>

          {/* Arabic Definition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Definition (Arabic)
            </label>
            <textarea
              value={formData.definitionArabic}
              onChange={(e) => handleInputChange('definitionArabic', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-right"
              placeholder="أدخل التعريف بالعربية. استخدم {مصطلح} للربط مع مصطلحات أخرى."
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
                  <span>{term ? 'Update' : 'Add'} Term</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlossaryDialog;