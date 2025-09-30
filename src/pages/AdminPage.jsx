import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
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
      const unsubscribe = watchSubcategories(category.id, (snapshot) => {
        const subcategoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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

    setIsAddingCategory(true);
    try {
      await createCategory({
        titleEn: newCategoryTitle.trim(),
        titleAr: '' // Can be added later through edit
      });
      setNewCategoryTitle('');
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Content Management
          </h1>
          
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

      <ConfirmDialog />
      <SubcategoryDialog />
    </div>
  );
};

export default AdminPage;