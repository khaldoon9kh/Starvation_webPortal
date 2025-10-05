import { create } from 'zustand';
import { 
  watchTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  moveTemplateUp,
  moveTemplateDown 
} from '../services/contentService';

const useTemplatesStore = create((set, get) => ({
  // State
  templates: [],
  isLoading: false,
  error: null,

  // Actions
  setTemplates: (templates) => set({ templates }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Initialize real-time listener
  initializeTemplatesListener: () => {
    set({ isLoading: true, error: null });
    
    const unsubscribe = watchTemplates((snapshot) => {
      try {
        const templatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        set({ templates: templatesData, isLoading: false, error: null });
      } catch (error) {
        console.error('Error processing templates:', error);
        set({ error: error.message, isLoading: false });
      }
    });

    return unsubscribe;
  },

  // Create new template
  addTemplate: async (templateData, pdfFile) => {
    try {
      await createTemplate(templateData, pdfFile);
    } catch (error) {
      console.error('Error adding template:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Update existing template
  editTemplate: async (templateId, updates, newPdfFile = null) => {
    try {
      await updateTemplate(templateId, updates, newPdfFile);
    } catch (error) {
      console.error('Error updating template:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Delete template
  removeTemplate: async (templateId) => {
    try {
      await deleteTemplate(templateId);
    } catch (error) {
      console.error('Error deleting template:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Move template up in order
  moveUp: async (templateId) => {
    try {
      await moveTemplateUp(templateId);
    } catch (error) {
      console.error('Error moving template up:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Move template down in order
  moveDown: async (templateId) => {
    try {
      await moveTemplateDown(templateId);
    } catch (error) {
      console.error('Error moving template down:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Computed values (kept for compatibility but not used)
  getFilteredTemplates: () => {
    const { templates, searchTerm, categoryFilter } = get();
    
    return templates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.titleArabic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.descriptionArabic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || template.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  // Get unique categories for filter dropdown
  getCategories: () => {
    const { templates } = get();
    const categories = [...new Set(templates
      .map(template => template.category)
      .filter(Boolean)
    )].sort();
    return categories;
  },

  // Clear filters
  clearFilters: () => set({ 
    searchTerm: '', 
    categoryFilter: '' 
  }),

  // Format file size for display
  formatFileSize: (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Format date for display
  formatDate: (timestamp) => {
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
  }
}));

export default useTemplatesStore;