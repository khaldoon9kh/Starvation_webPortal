import { create } from 'zustand';
import {
  getGlossaryTerms,
  subscribeToGlossaryTerms,
  addGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm,
  moveGlossaryTermUp,
  moveGlossaryTermDown
} from '../services/contentService';

const useGlossaryStore = create((set, get) => ({
  // State
  terms: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  // Actions
  initializeGlossary: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Set up real-time listener
      const unsubscribeFn = subscribeToGlossaryTerms((terms) => {
        set({ terms, isLoading: false });
      });
      
      set({ unsubscribe: unsubscribeFn });
    } catch (error) {
      console.error('Error initializing glossary:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  addTerm: async (termData) => {
    try {
      set({ isLoading: true, error: null });
      await addGlossaryTerm(termData);
      // Real-time listener will update the store automatically
    } catch (error) {
      console.error('Error adding term:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTerm: async (termId, updates) => {
    try {
      set({ isLoading: true, error: null });
      await updateGlossaryTerm(termId, updates);
      // Real-time listener will update the store automatically
    } catch (error) {
      console.error('Error updating term:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTerm: async (termId) => {
    try {
      set({ isLoading: true, error: null });
      await deleteGlossaryTerm(termId);
      // Real-time listener will update the store automatically
    } catch (error) {
      console.error('Error deleting term:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  moveTermUp: async (termId) => {
    try {
      set({ error: null });
      await moveGlossaryTermUp(termId);
      // Real-time listener will update the store automatically
    } catch (error) {
      console.error('Error moving term up:', error);
      set({ error: error.message });
      throw error;
    }
  },

  moveTermDown: async (termId) => {
    try {
      set({ error: null });
      await moveGlossaryTermDown(termId);
      // Real-time listener will update the store automatically
    } catch (error) {
      console.error('Error moving term down:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Find term by name (for linking)
  findTermByName: (termName) => {
    const { terms } = get();
    return terms.find(term => 
      term.term.toLowerCase() === termName.toLowerCase() ||
      term.termArabic?.toLowerCase() === termName.toLowerCase()
    );
  },

  // Get terms for auto-completion
  getTermSuggestions: (query) => {
    const { terms } = get();
    if (!query || query.length < 2) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return terms.filter(term =>
      term.term.toLowerCase().includes(lowercaseQuery) ||
      term.termArabic?.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 10); // Limit to 10 suggestions
  },

  // Cleanup
  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, terms: [] });
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useGlossaryStore;