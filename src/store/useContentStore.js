import { create } from 'zustand';

export const useContentStore = create((set, get) => ({
  // Data
  categories: [],
  subcategories: {},
  expandedCategories: {},
  
  // UI State
  loading: false,
  error: null,
  
  // Modal state
  subcategoryModal: {
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    categoryId: null,
    subcategory: null,
    parentSubcategoryId: null,
  },
  
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },

  // Actions
  setCategories: (categories) => set({ categories }),
  
  setSubcategories: (categoryId, subcategories) => 
    set(state => ({
      subcategories: {
        ...state.subcategories,
        [categoryId]: subcategories
      }
    })),
  
  toggleCategoryExpansion: (categoryId) =>
    set(state => ({
      expandedCategories: {
        ...state.expandedCategories,
        [categoryId]: !state.expandedCategories[categoryId]
      }
    })),
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Modal actions
  openSubcategoryModal: (mode, categoryId, subcategory = null, parentSubcategoryId = null) =>
    set({
      subcategoryModal: {
        isOpen: true,
        mode,
        categoryId,
        subcategory,
        parentSubcategoryId
      }
    }),
  
  closeSubcategoryModal: () =>
    set({
      subcategoryModal: {
        isOpen: false,
        mode: 'add',
        categoryId: null,
        subcategory: null,
        parentSubcategoryId: null
      }
    }),
  
  openConfirmDialog: (title, message, onConfirm, onCancel = null) =>
    set({
      confirmDialog: {
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel
      }
    }),
  
  closeConfirmDialog: () =>
    set({
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null
      }
    }),

  // Optimistic updates
  optimisticallyAddCategory: (category) =>
    set(state => ({
      categories: [...state.categories, { id: 'temp-' + Date.now(), ...category }]
    })),
  
  optimisticallyUpdateCategory: (categoryId, updates) =>
    set(state => ({
      categories: state.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    })),
  
  optimisticallyDeleteCategory: (categoryId) =>
    set(state => ({
      categories: state.categories.filter(cat => cat.id !== categoryId),
      subcategories: {
        ...state.subcategories,
        [categoryId]: []
      }
    })),
  
  optimisticallyAddSubcategory: (categoryId, subcategory) =>
    set(state => ({
      subcategories: {
        ...state.subcategories,
        [categoryId]: [
          ...(state.subcategories[categoryId] || []),
          { id: 'temp-' + Date.now(), ...subcategory }
        ]
      }
    })),
  
  optimisticallyUpdateSubcategory: (categoryId, subcategoryId, updates) =>
    set(state => ({
      subcategories: {
        ...state.subcategories,
        [categoryId]: (state.subcategories[categoryId] || []).map(sub =>
          sub.id === subcategoryId ? { ...sub, ...updates } : sub
        )
      }
    })),
  
  optimisticallyDeleteSubcategory: (categoryId, subcategoryId) =>
    set(state => ({
      subcategories: {
        ...state.subcategories,
        [categoryId]: (state.subcategories[categoryId] || []).filter(sub => 
          sub.id !== subcategoryId
        )
      }
    })),
}));