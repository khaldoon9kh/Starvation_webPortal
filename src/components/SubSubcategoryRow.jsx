import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { deleteSubcategory, moveSubcategoryUp, moveSubcategoryDown } from '../services/contentService';
import FormattedContent from './FormattedContent';

const SubSubcategoryRow = ({ 
  subSubcategory, 
  categoryId, 
  parentSubcategoryId,
  canMoveUp, 
  canMoveDown, 
  subSubcategories 
}) => {
  const { openSubcategoryModal, openConfirmDialog, setError } = useContentStore();

  const handleEdit = () => {
    openSubcategoryModal('edit', categoryId, subSubcategory, parentSubcategoryId);
  };

  const handleDelete = () => {
    openConfirmDialog(
      'Delete Sub-Sub Category',
      `Are you sure you want to delete "${subSubcategory.titleEn}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteSubcategory(subSubcategory.id);
        } catch (error) {
          console.error('Error deleting sub-sub category:', error);
          setError('Failed to delete sub-sub category');
        }
      }
    );
  };

  const handleMoveUp = async () => {
    try {
      await moveSubcategoryUp(subSubcategory.id, categoryId, subSubcategory.order);
    } catch (error) {
      console.error('Error moving sub-sub category up:', error);
      setError('Failed to move sub-sub category');
    }
  };

  const handleMoveDown = async () => {
    const maxOrder = Math.max(...subSubcategories.map(sub => sub.order));
    try {
      await moveSubcategoryDown(subSubcategory.id, categoryId, subSubcategory.order, maxOrder);
    } catch (error) {
      console.error('Error moving sub-sub category down:', error);
      setError('Failed to move sub-sub category');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 ml-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {/* Color indicator */}
            <div 
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: subSubcategory.colorHex }}
              title={subSubcategory.colorHex}
            />
            
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900">
                {subSubcategory.titleEn}
              </h5>
              {subSubcategory.titleAr && (
                <p className="text-xs text-gray-600 mt-1 rtl" dir="rtl">
                  {subSubcategory.titleAr}
                </p>
              )}
            </div>
          </div>
          
          {/* Content preview */}
          <div className="mt-2 space-y-1">
            {subSubcategory.contentEn && (
              <div className="text-xs text-gray-700">
                <FormattedContent 
                  content={subSubcategory.contentEn.length > 120 
                    ? subSubcategory.contentEn.substring(0, 120) + '...'
                    : subSubcategory.contentEn
                  }
                  className="line-clamp-2"
                />
              </div>
            )}
            {subSubcategory.contentAr && (
              <div className="text-xs text-gray-700 rtl" dir="rtl">
                <FormattedContent 
                  content={subSubcategory.contentAr.length > 120 
                    ? subSubcategory.contentAr.substring(0, 120) + '...'
                    : subSubcategory.contentAr
                  }
                  className="line-clamp-2"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={handleEdit}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Edit sub-sub category"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Delete sub-sub category"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          
          <button
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          
          <button
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubSubcategoryRow;