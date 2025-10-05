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

  const [newCategoryTitle, setNewCategoryTitle] = useState('');
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

  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) return;

    // Debug: Check auth state
    //console.log('Current user:', auth.currentUser);
    //console.log('User ID:', auth.currentUser?.uid);
    
    setIsAddingCategory(true);
    try {
      await createCategory({
        titleEn: newCategoryTitle.trim(),
        titleAr: '' // Can be added later through edit
      });
      setNewCategoryTitle('');
    } catch (error) {
      console.error('Error creating category:', error);
      console.error('Error details:', error.code, error.message);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCategory();
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Starvation Library Admin
          </h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div>
            {/* Add Category Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Add New Category
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Category title (English)"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={isAddingCategory || !newCategoryTitle.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingCategory ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Categories List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading categories...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : sortedCategories.length === 0 ? (
              <EmptyState
                title="No categories yet"
                description="Create your first category to get started with organizing your content."
                action={
                  <button
                    onClick={() => document.querySelector('input[type="text"]')?.focus()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Category
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
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
      </div>

      <ConfirmDialog />
      <SubcategoryDialog />
    </div>
  );
};

export default AdminPage;