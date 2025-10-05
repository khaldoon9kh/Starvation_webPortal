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
    <div className="subcategory-item tree-level-2">
      {/* Tree bullet for level 2 */}
      <div className="tree-bullet tree-bullet-2"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div>
            <h5 style={{fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', margin: '0'}}>
              {subSubcategory.titleEn}
            </h5>
            {subSubcategory.titleAr && (
              <p className="rtl" dir="rtl" style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 'var(--spacing-xs) 0 0 0'}}>
                {subSubcategory.titleAr}
              </p>
            )}
          </div>
          
          {/* Content preview */}
          <div style={{marginTop: 'var(--spacing-sm)'}}>
            {subSubcategory.contentEn && (
              <div style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)'}}>
                <FormattedContent 
                  content={subSubcategory.contentEn.length > 100 
                    ? subSubcategory.contentEn.substring(0, 100) + '...'
                    : subSubcategory.contentEn
                  }
                  className="formatted-content"
                />
              </div>
            )}
            {subSubcategory.contentAr && (
              <div className="rtl" dir="rtl" style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)'}}>
                <FormattedContent 
                  content={subSubcategory.contentAr.length > 100 
                    ? subSubcategory.contentAr.substring(0, 100) + '...'
                    : subSubcategory.contentAr
                  }
                  className="formatted-content"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center" style={{gap: 'var(--spacing-xs)', marginLeft: 'var(--spacing-sm)'}}>
          <button
            onClick={handleEdit}
            className="action-btn"
            title="Edit sub-sub category"
            style={{minWidth: '28px', minHeight: '28px', padding: 'var(--spacing-xs)'}}
          >
            <Edit2 className="h-3 w-3" />
          </button>
          
          <button
            onClick={handleDelete}
            className="action-btn danger"
            title="Delete sub-sub category"
            style={{minWidth: '28px', minHeight: '28px', padding: 'var(--spacing-xs)'}}
          >
            <Trash2 className="h-3 w-3" />
          </button>
          
          <button
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            className="action-btn"
            title="Move up"
            style={{minWidth: '28px', minHeight: '28px', padding: 'var(--spacing-xs)'}}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          
          <button
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            className="action-btn"
            title="Move down"
            style={{minWidth: '28px', minHeight: '28px', padding: 'var(--spacing-xs)'}}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubSubcategoryRow;