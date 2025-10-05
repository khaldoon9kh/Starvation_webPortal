import { useState } from 'react';
import { 
  Edit2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight,
  ChevronDown as ChevronDownExpand,
  Plus 
} from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { deleteSubcategory, moveSubcategoryUp, moveSubcategoryDown } from '../services/contentService';
import FormattedContent from './FormattedContent';
import SubSubcategoryRow from './SubSubcategoryRow';
import EmptyState from './EmptyState';

const SubcategoryRow = ({ subcategory, categoryId, canMoveUp, canMoveDown, subcategories }) => {
  const { openSubcategoryModal, openConfirmDialog, setError } = useContentStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasSubSubCategories = subcategory.subSubCategories && subcategory.subSubCategories.length > 0;
  const hasContent = subcategory.hasContent !== false && (subcategory.contentEn || subcategory.contentAr);

  const handleEdit = () => {
    openSubcategoryModal('edit', categoryId, subcategory);
  };

  const handleDelete = () => {
    openConfirmDialog(
      'Delete Subcategory',
      `Are you sure you want to delete "${subcategory.titleEn}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteSubcategory(subcategory.id);
        } catch (error) {
          console.error('Error deleting subcategory:', error);
          setError('Failed to delete subcategory');
        }
      }
    );
  };

  const handleMoveUp = async () => {
    try {
      await moveSubcategoryUp(subcategory.id, categoryId, subcategory.order);
    } catch (error) {
      console.error('Error moving subcategory up:', error);
      setError('Failed to move subcategory');
    }
  };

  const handleMoveDown = async () => {
    const maxOrder = Math.max(...subcategories.map(sub => sub.order));
    try {
      await moveSubcategoryDown(subcategory.id, categoryId, subcategory.order, maxOrder);
    } catch (error) {
      console.error('Error moving subcategory down:', error);
      setError('Failed to move subcategory');
    }
  };

  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddSubSubcategory = () => {
    // Open modal for creating sub-sub category under this subcategory
    openSubcategoryModal('add', categoryId, null, subcategory.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {/* Expansion toggle for sub-sub categories */}
              {hasSubSubCategories ? (
                <button
                  onClick={handleToggleExpansion}
                  className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={isExpanded ? 'Collapse sub-sub categories' : 'Expand sub-sub categories'}
                >
                  {isExpanded ? (
                    <ChevronDownExpand className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-6" /> // Spacer for alignment
              )}
              
              {/* Color indicator */}
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: subcategory.colorHex }}
                title={subcategory.colorHex}
              />
              
              <div className="flex-1">
                <h4 className="text-base font-medium text-gray-900">
                  {subcategory.titleEn}
                  {hasSubSubCategories && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({subcategory.subSubCategories.length} sub-items)
                    </span>
                  )}
                </h4>
                {subcategory.titleAr && (
                  <p className="text-sm text-gray-600 mt-1 rtl" dir="rtl">
                    {subcategory.titleAr}
                  </p>
                )}
              </div>
            </div>
            
            {/* Content preview - only show if has content */}
            {hasContent && (
              <div className="mt-2 space-y-1">
                {subcategory.contentEn && (
                  <div className="text-sm text-gray-700">
                    <FormattedContent 
                      content={subcategory.contentEn.length > 150 
                        ? subcategory.contentEn.substring(0, 150) + '...'
                        : subcategory.contentEn
                      }
                      className="line-clamp-3"
                    />
                  </div>
                )}
                {subcategory.contentAr && (
                  <div className="text-sm text-gray-700 rtl" dir="rtl">
                    <FormattedContent 
                      content={subcategory.contentAr.length > 150 
                        ? subcategory.contentAr.substring(0, 150) + '...'
                        : subcategory.contentAr
                      }
                      className="line-clamp-3"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        
          {/* Action buttons */}
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Edit subcategory"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Delete subcategory"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleMoveUp}
              disabled={!canMoveUp}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleMoveDown}
              disabled={!canMoveDown}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleAddSubSubcategory}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Add sub-sub category"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Sub Categories Section */}
      {hasSubSubCategories && isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-medium text-gray-700">Sub-Sub Categories</h5>
              <button
                onClick={handleAddSubSubcategory}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Sub-Sub Category
              </button>
            </div>
            
            {subcategory.subSubCategories.length === 0 ? (
              <EmptyState
                title="No sub-sub categories"
                description="Add your first sub-sub category to get started."
                action={
                  <button
                    onClick={handleAddSubSubcategory}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub-Sub Category
                  </button>
                }
              />
            ) : (
              <div className="space-y-2">
                {subcategory.subSubCategories.map((subSubcategory, index) => (
                  <SubSubcategoryRow
                    key={subSubcategory.id}
                    subSubcategory={subSubcategory}
                    categoryId={categoryId}
                    parentSubcategoryId={subcategory.id}
                    canMoveUp={index > 0}
                    canMoveDown={index < subcategory.subSubCategories.length - 1}
                    subSubcategories={subcategory.subSubCategories}
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

export default SubcategoryRow;