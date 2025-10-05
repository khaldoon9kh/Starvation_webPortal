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

  // Map category types to stripe colors based on mobile app
  const getCategoryStripeColor = (titleEn) => {
    const title = titleEn.toLowerCase();
    if (title.includes('law') || title.includes('liability') || title.includes('command')) {
      return 'var(--color-law-stripe)'; // Olive green
    }
    if (title.includes('icl') || title.includes('ihl') || title.includes('ihrl') || title.includes('framework')) {
      return 'var(--color-framework-stripe)'; // Blue
    }
    if (title.includes('war crimes') || title.includes('mental') || title.includes('elements')) {
      return 'var(--color-crimes-stripe)'; // Forest green
    }
    return 'var(--color-law-stripe)'; // Default to olive green
  };

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
    <div className="category-card" style={{'--stripe-color': getCategoryStripeColor(category.titleEn)}}>
      {/* Category Header */}
      <div 
        className="category-header"
        onClick={handleToggleExpansion}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleExpansion();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={`category-${category.id}-content`}
      >
        <div className="flex-1">
          {isEditingInline ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveInlineEdit}
              onKeyDown={handleKeyPress}
              onClick={(e) => e.stopPropagation()}
              className="form-input"
              autoFocus
            />
          ) : (
            <div>
              <h3 className="category-title">
                {category.titleEn}
              </h3>
              {category.titleAr && (
                <p className="category-meta rtl" dir="rtl">
                  {category.titleAr}
                </p>
              )}
              <div className="category-meta">
                {categorySubcategories.length} subcategories
              </div>
            </div>
          )}
        </div>
        
        <div className="category-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleInlineEdit();
            }}
            className="action-btn"
            title="Edit category"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category.id, category.titleEn);
            }}
            className="action-btn danger"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(category.id, category.order);
            }}
            disabled={!canMoveUp}
            className="action-btn"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(category.id, category.order);
            }}
            disabled={!canMoveDown}
            className="action-btn"
            title="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddSubcategory();
            }}
            className="action-btn"
            style={{color: 'var(--color-accent-green)'}}
            title="Add subcategory"
          >
            <Plus className="h-4 w-4" />
          </button>
          
          <ChevronDown 
            className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
          />
        </div>
      </div>

      {/* Subcategories Section */}
      {isExpanded && (
        <div 
          className="subcategory-tree" 
          id={`category-${category.id}-content`}
          style={{padding: 'var(--spacing-lg)'}}
        >
          <div className="flex items-center justify-between" style={{marginBottom: 'var(--spacing-md)'}}>
            <h4 style={{fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-secondary)'}}>
              Subcategories
            </h4>
            <button
              onClick={handleAddSubcategory}
              className="btn-primary"
              style={{fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-xs) var(--spacing-sm)'}}
            >
              <Plus className="h-3 w-3" />
              Add Subcategory
            </button>
          </div>
          
          {categorySubcategories.length === 0 ? (
            <div className="subcategory-item">
              <div style={{textAlign: 'center', padding: 'var(--spacing-lg)'}}>
                <p style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)'}}>
                  No subcategories yet
                </p>
                <button
                  onClick={handleAddSubcategory}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Subcategory
                </button>
              </div>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)'}}>
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
      )}
    </div>
  );
};

export default CategoryRow;