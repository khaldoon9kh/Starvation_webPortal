import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { deleteSubcategory, moveSubcategoryUp, moveSubcategoryDown } from '../services/contentService';
import FormattedContent from './FormattedContent';

const SubcategoryRow = ({ subcategory, categoryId, canMoveUp, canMoveDown, subcategories }) => {
  const { openSubcategoryModal, openConfirmDialog, setError } = useContentStore();

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {/* Color indicator */}
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: subcategory.colorHex }}
              title={subcategory.colorHex}
            />
            
            <div className="flex-1">
              <h4 className="text-base font-medium text-gray-900">
                {subcategory.titleEn}
              </h4>
              {subcategory.titleAr && (
                <p className="text-sm text-gray-600 mt-1 rtl" dir="rtl">
                  {subcategory.titleAr}
                </p>
              )}
            </div>
          </div>
          
          {/* Content preview */}
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
        </div>
      </div>
    </div>
  );
};

export default SubcategoryRow;