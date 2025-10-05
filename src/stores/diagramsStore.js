import { create } from 'zustand';
import {
  getDiagrams,
  subscribeToDiagrams,
  addDiagram,
  updateDiagram,
  deleteDiagram,
  moveDiagramUp,
  moveDiagramDown
} from '../services/contentService';

const useDiagramsStore = create((set, get) => ({
  // State
  diagrams: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  // Actions
  initializeDiagrams: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Set up real-time listener
      const unsubscribeFn = subscribeToDiagrams((diagrams) => {
        set({ diagrams, isLoading: false });
      });
      
      set({ unsubscribe: unsubscribeFn });
    } catch (error) {
      console.error('Error initializing diagrams:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  addDiagram: async (diagramData, imageFile) => {
    try {
      set({ isLoading: true, error: null });
      await addDiagram(diagramData, imageFile);
      // Real-time listener will update the store automatically
      set({ isLoading: false });
    } catch (error) {
      console.error('Error adding diagram:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateDiagram: async (diagramId, updates, newImageFile) => {
    try {
      set({ isLoading: true, error: null });
      await updateDiagram(diagramId, updates, newImageFile);
      // Real-time listener will update the store automatically
      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating diagram:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteDiagram: async (diagramId) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDiagram(diagramId);
      // Real-time listener will update the store automatically
      set({ isLoading: false });
    } catch (error) {
      console.error('Error deleting diagram:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  moveDiagramUp: async (diagramId) => {
    try {
      set({ error: null });
      await moveDiagramUp(diagramId);
      // Real-time listener will update the store automatically
    } catch (error) {
      console.error('Error moving diagram up:', error);
      set({ error: error.message });
      throw error;
    }
  },

  moveDiagramDown: async (diagramId) => {
    try {
      set({ error: null });
      await moveDiagramDown(diagramId);
      // Real-time listener will update the store automatically
    } catch (error) {
      console.error('Error moving diagram down:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Get diagrams by category
  getDiagramsByCategory: (category) => {
    const { diagrams } = get();
    if (!category) return diagrams;
    return diagrams.filter(diagram => 
      diagram.category?.toLowerCase() === category.toLowerCase()
    );
  },

  // Get diagrams for search
  searchDiagrams: (query) => {
    const { diagrams } = get();
    if (!query || query.length < 2) return diagrams;
    
    const lowercaseQuery = query.toLowerCase();
    return diagrams.filter(diagram =>
      diagram.title.toLowerCase().includes(lowercaseQuery) ||
      diagram.titleArabic?.toLowerCase().includes(lowercaseQuery) ||
      diagram.description.toLowerCase().includes(lowercaseQuery) ||
      diagram.descriptionArabic?.toLowerCase().includes(lowercaseQuery) ||
      diagram.category?.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Cleanup
  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, diagrams: [] });
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useDiagramsStore;