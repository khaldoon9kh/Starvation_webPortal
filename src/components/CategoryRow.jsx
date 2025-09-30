import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  ChevronUp, 
  ChevronDown as ArrowDown, 
  Plus 
} from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import SubcategoryRow from './SubcategoryRow';
import EmptyState from './EmptyState';

const CategoryRow = ({ category, onEdit, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) => {
  const { 
    subcategories, 
    expandedCategories, 
    toggleCategoryExpansion,
    openSubcategoryModal 
  } = useContentStore();
  
  const [editingTitle, setEditingTitle] = useState('');
  const [isEditingInline, setIsEditingInline] = useState(false);
  
  const isExpanded = expandedCategories[category.id];
  const categorySubcategories = subcategories[category.id] || [];

  const handleToggleExpansion = () => {
    toggleCategoryExpansion(category.id);
  };

  const handleAddSubcategory = () => {
    openSubcategoryModal('add', category.id);
  };

  const handleInlineEdit = () => {
    setEditingTitle(category.titleEn);
    setIsEditingInline(true);
  };

  const handleSaveInlineEdit = () => {
    if (editingTitle.trim() && editingTitle !== category.titleEn) {
      onEdit(category.id, { titleEn: editingTitle.trim() });
    }
    setIsEditingInline(false);
    setEditingTitle('');
  };

  const handleCancelInlineEdit = () => {
    setIsEditingInline(false);
    setEditingTitle('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveInlineEdit();
    } else if (e.key === 'Escape') {
      handleCancelInlineEdit();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Category Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <button
              onClick={handleToggleExpansion}
              className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            {isEditingInline ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleSaveInlineEdit}
                onKeyDown={handleKeyPress}
                className="ml-3 flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {category.titleEn}
                </h3>
                {category.titleAr && (
                  <p className="text-sm text-gray-600 mt-1 rtl" dir="rtl">
                    {category.titleAr}
                  </p>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {categorySubcategories.length} subcategories
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleInlineEdit}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Edit category"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onDelete(category.id, category.titleEn)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onMoveUp(category.id, category.order)}
              disabled={!canMoveUp}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onMoveDown(category.id, category.order)}
              disabled={!canMoveDown}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleAddSubcategory}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Add subcategory"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subcategories Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Subcategories</h4>
              <button
                onClick={handleAddSubcategory}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subcategory
              </button>
            </div>
            
            {categorySubcategories.length === 0 ? (
              <EmptyState
                title="No subcategories"
                description="Add your first subcategory to get started."
                action={
                  <button
                    onClick={handleAddSubcategory}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subcategory
                  </button>
                }
              />
            ) : (
              <div className="space-y-2">
                {categorySubcategories.map((subcategory, index) => (
                  <SubcategoryRow
                    key={subcategory.id}
                    subcategory={subcategory}
                    categoryId={category.id}
                    subcategories={categorySubcategories}
                    canMoveUp={index > 0}
                    canMoveDown={index < categorySubcategories.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryRow;