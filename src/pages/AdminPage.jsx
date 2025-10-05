import { useEffect, useState } from 'react';
import { Plus, FolderOpen, BookOpen, Image, FileText } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useContentStore } from '../store/useContentStore';
import { 
  watchCategories, 
  watchSubcategories, 
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategoryUp,
  moveCategoryDown
} from '../services/contentService';
import Navbar from '../components/Navbar';
import CategoryRow from '../components/CategoryRow';
import CategoryDialog from '../components/CategoryDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import SubcategoryDialog from '../components/SubcategoryDialog';
import EmptyState from '../components/EmptyState';
import Glossary from './Glossary';
import Diagrams from './Diagrams';
import Templates from './Templates';

const AdminPage = () => {
  const {
    categories,
    setCategories,
    setSubcategories,
    loading,
    setLoading,
    error,
    setError,
    openConfirmDialog
  } = useContentStore();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Watch categories
  useEffect(() => {
    setLoading(true);
    const unsubscribe = watchCategories((snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCategories, setLoading]);

  // Watch subcategories for each category
  useEffect(() => {
    const unsubscribes = [];

    categories.forEach(category => {
      const unsubscribe = watchSubcategories(category.id, (subcategoriesData) => {
        // subcategoriesData is already processed and sorted
        setSubcategories(category.id, subcategoriesData);
      });
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [categories, setSubcategories]);

  const handleSaveCategory = async (categoryData) => {
    setIsAddingCategory(true);
    try {
      await createCategory(categoryData);
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category: ' + error.message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleEditCategory = async (categoryId, updates) => {
    try {
      await updateCategory(categoryId, updates);
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = (categoryId, categoryTitle) => {
    openConfirmDialog(
      'Delete Category',
      `Are you sure you want to delete "${categoryTitle}" and all its subcategories? This action cannot be undone.`,
      async () => {
        try {
          await deleteCategory(categoryId);
        } catch (error) {
          console.error('Error deleting category:', error);
          setError('Failed to delete category');
        }
      }
    );
  };

  const handleMoveCategoryUp = async (categoryId, currentOrder) => {
    try {
      await moveCategoryUp(categoryId, currentOrder);
    } catch (error) {
      console.error('Error moving category up:', error);
      setError('Failed to move category');
    }
  };

  const handleMoveCategoryDown = async (categoryId, currentOrder) => {
    const maxOrder = Math.max(...categories.map(cat => cat.order));
    try {
      await moveCategoryDown(categoryId, currentOrder, maxOrder);
    } catch (error) {
      console.error('Error moving category down:', error);
      setError('Failed to move category');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Tab definitions
  const tabs = [
    { id: 'content', name: 'Content', icon: FolderOpen },
    { id: 'glossary', name: 'Glossary', icon: BookOpen },
    { id: 'diagrams', name: 'Diagrams', icon: Image },
    { id: 'templates', name: 'Templates', icon: FileText }
  ];

  return (
    <div className="admin-container">
      <Navbar />
      
      {/* Sticky Navigation Tabs */}
      <div className="admin-nav-tabs">
        <div className="admin-content">
          <div className="nav-pills-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-pill ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
            
            {/* Search Action - Right Aligned */}
            <div className="ml-auto">
              <button className="action-btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="admin-content">

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div>
            {/* Add Category Button */}
            <div className="category-card" style={{'--stripe-color': 'var(--color-primary-green)'}}>
              <div className="category-header">
                <div>
                  <h2 className="category-title">Categories</h2>
                  <div className="category-meta">Manage your content categories</div>
                </div>
                <button
                  onClick={() => setIsCategoryDialogOpen(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </button>
              </div>
            </div>

            {/* Categories List */}
            {loading ? (
              <div className="category-card">
                <div className="category-header">
                  <div className="flex items-center gap-3">
                    <div className="loading-spinner"></div>
                    <span>Loading categories...</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="category-card" style={{'--stripe-color': '#dc2626'}}>
                <div className="category-header">
                  <span style={{color: '#dc2626'}}>{error}</span>
                </div>
              </div>
            ) : sortedCategories.length === 0 ? (
              <div className="category-card">
                <div className="category-header">
                  <div>
                    <div className="category-title">No categories yet</div>
                    <div className="category-meta">Create your first category to get started with organizing your content.</div>
                  </div>
                  <button
                    onClick={() => setIsCategoryDialogOpen(true)}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Category
                  </button>
                </div>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)'}}>
                {sortedCategories.map((category, index) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onMoveUp={handleMoveCategoryUp}
                    onMoveDown={handleMoveCategoryDown}
                    canMoveUp={index > 0}
                    canMoveDown={index < sortedCategories.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'glossary' && (
          <Glossary />
        )}

        {activeTab === 'diagrams' && (
          <Diagrams />
        )}

        {activeTab === 'templates' && (
          <Templates />
        )}

        <CategoryDialog
          isOpen={isCategoryDialogOpen}
          onClose={() => setIsCategoryDialogOpen(false)}
          onSave={handleSaveCategory}
          mode="add"
        />
        <ConfirmDialog />
        <SubcategoryDialog />
      </div>

      
    </div>
  );
};

export default AdminPage;