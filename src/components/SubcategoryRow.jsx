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
    <>
      <div
        className="subcategory-item tree-level-1"
        style={{ borderLeftColor: subcategory.colorHex || '#000', borderLeftWidth: '4px', borderLeftStyle: 'solid' }}
      >
        {/* Tree bullet for level 1 */}
        <div className="tree-bullet tree-bullet-1"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center" style={{gap: 'var(--spacing-sm)'}}>
              {/* Expansion toggle for sub-sub categories */}
              {hasSubSubCategories && (
                <button
                  onClick={handleToggleExpansion}
                  className="action-btn"
                  style={{minWidth: '24px', minHeight: '24px', padding: 'var(--spacing-xs)'}}
                  aria-label={isExpanded ? 'Collapse sub-sub categories' : 'Expand sub-sub categories'}
                >
                  {isExpanded ? (
                    <ChevronDownExpand className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
              
              <div className="flex-1">
                <h4 style={{fontSize: 'var(--font-size-base)', fontWeight: '500', color: 'var(--color-text-primary)', margin: '0'}}>
                  {subcategory.titleEn}
                  {hasSubSubCategories && (
                    <span style={{marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)'}}>
                      ({subcategory.subSubCategories.length} sub-items)
                    </span>
                  )}
                </h4>
                {subcategory.titleAr && (
                  <p className="rtl" dir="rtl" style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 'var(--spacing-xs) 0 0 0'}}>
                    {subcategory.titleAr}
                  </p>
                )}
              </div>
            </div>
            
            {/* Content preview - only show if has content */}
            {hasContent && (
              <div style={{marginTop: 'var(--spacing-sm)'}}>
                {subcategory.contentEn && (
                  <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)'}}>
                    <FormattedContent 
                      content={subcategory.contentEn.length > 120 
                        ? subcategory.contentEn.substring(0, 120) + '...'
                        : subcategory.contentEn
                      }
                      className="formatted-content"
                    />
                  </div>
                )}
                {subcategory.contentAr && (
                  <div className="rtl" dir="rtl" style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)'}}>
                    <FormattedContent 
                      content={subcategory.contentAr.length > 120 
                        ? subcategory.contentAr.substring(0, 120) + '...'
                        : subcategory.contentAr
                      }
                      className="formatted-content"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        
          {/* Action buttons */}
          <div className="flex items-center" style={{gap: 'var(--spacing-xs)', marginLeft: 'var(--spacing-md)'}}>
            <button
              onClick={handleEdit}
              className="action-btn"
              title="Edit subcategory"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleDelete}
              className="action-btn danger"
              title="Delete subcategory"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleMoveUp}
              disabled={!canMoveUp}
              className="action-btn"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleMoveDown}
              disabled={!canMoveDown}
              className="action-btn"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleAddSubSubcategory}
              className="action-btn"
              style={{color: 'var(--color-accent-green)'}}
              title="Add sub-sub category"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      
      {/* Sub-Sub Categories Section */}
      {hasSubSubCategories && isExpanded && (
        <div style={{marginTop: 'var(--spacing-xs)'}}>
          {subcategory.subSubCategories.length === 0 ? (
            <div className="subcategory-item tree-level-2">
              <div className="tree-bullet tree-bullet-2"></div>
              <div style={{textAlign: 'center', padding: 'var(--spacing-md)'}}>
                <p style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)'}}>
                  No sub-sub categories yet
                </p>
                <button
                  onClick={handleAddSubSubcategory}
                  className="btn-primary"
                >
                  <Plus className="h-3 w-3" />
                  Add Sub-Sub Category
                </button>
              </div>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)'}}>
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
      )}
    </>
  );
};

export default SubcategoryRow;