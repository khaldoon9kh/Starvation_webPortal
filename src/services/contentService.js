import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Collection references
const categoriesRef = collection(db, 'categories');
const subcategoriesRef = collection(db, 'subcategories');
const glossaryRef = collection(db, 'glossary');

// Categories operations
export const watchCategories = (callback) => {
  const q = query(categoriesRef, orderBy('order', 'asc'));
  return onSnapshot(q, callback);
};

export const createCategory = async (categoryData) => {
  // Get the highest order value and increment by 1
  const q = query(categoriesRef, orderBy('order', 'desc'));
  const snapshot = await getDocs(q);
  const highestOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;
  
  const newCategory = {
    ...categoryData,
    order: highestOrder + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  return await addDoc(categoriesRef, newCategory);
};

export const updateCategory = async (categoryId, updates) => {
  const categoryDoc = doc(db, 'categories', categoryId);
  return await updateDoc(categoryDoc, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteCategory = async (categoryId) => {
  const batch = writeBatch(db);
  
  // Delete the category
  const categoryDoc = doc(db, 'categories', categoryId);
  batch.delete(categoryDoc);
  
  // Delete all subcategories belonging to this category
  const subcategoriesQuery = query(subcategoriesRef, where('categoryId', '==', categoryId));
  const subcategoriesSnapshot = await getDocs(subcategoriesQuery);
  
  subcategoriesSnapshot.forEach((subcategoryDoc) => {
    batch.delete(subcategoryDoc.ref);
  });
  
  return await batch.commit();
};

export const reorderCategories = async (updatesArray) => {
  const batch = writeBatch(db);
  
  updatesArray.forEach(({ id, order }) => {
    const categoryDoc = doc(db, 'categories', id);
    batch.update(categoryDoc, { 
      order,
      updatedAt: serverTimestamp()
    });
  });
  
  return await batch.commit();
};

// Subcategories operations
export const watchSubcategories = (categoryId, callback) => {
  const q = query(
    subcategoriesRef, 
    where('categoryId', '==', categoryId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const subcategories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by order in JavaScript to avoid composite index requirement
    subcategories.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    callback(subcategories);
  });
};

export const createSubcategory = async (categoryId, subcategoryData) => {
  // Get the highest order value for this category and increment by 1
  const q = query(
    subcategoriesRef,
    where('categoryId', '==', categoryId),
    orderBy('order', 'desc')
  );
  const snapshot = await getDocs(q);
  const highestOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;
  
  const newSubcategory = {
    ...subcategoryData,
    categoryId,
    order: highestOrder + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  return await addDoc(subcategoriesRef, newSubcategory);
};

export const updateSubcategory = async (subcategoryId, updates) => {
  const subcategoryDoc = doc(db, 'subcategories', subcategoryId);
  return await updateDoc(subcategoryDoc, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteSubcategory = async (subcategoryId) => {
  const subcategoryDoc = doc(db, 'subcategories', subcategoryId);
  return await deleteDoc(subcategoryDoc);
};

export const reorderSubcategories = async (categoryId, updatesArray) => {
  const batch = writeBatch(db);
  
  updatesArray.forEach(({ id, order }) => {
    const subcategoryDoc = doc(db, 'subcategories', id);
    batch.update(subcategoryDoc, { 
      order,
      updatedAt: serverTimestamp()
    });
  });
  
  return await batch.commit();
};

// Move category up or down
export const moveCategoryUp = async (categoryId, currentOrder) => {
  if (currentOrder <= 1) return; // Already at the top
  
  return await runTransaction(db, async (transaction) => {
    // Find the category with the previous order
    const categoriesQuery = query(
      categoriesRef,
      where('order', '==', currentOrder - 1)
    );
    const snapshot = await getDocs(categoriesQuery);
    
    if (!snapshot.empty) {
      const otherCategoryDoc = snapshot.docs[0];
      const categoryDoc = doc(db, 'categories', categoryId);
      
      // Swap orders
      transaction.update(categoryDoc, { 
        order: currentOrder - 1,
        updatedAt: serverTimestamp()
      });
      transaction.update(otherCategoryDoc.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

export const moveCategoryDown = async (categoryId, currentOrder, maxOrder) => {
  if (currentOrder >= maxOrder) return; // Already at the bottom
  
  return await runTransaction(db, async (transaction) => {
    // Find the category with the next order
    const categoriesQuery = query(
      categoriesRef,
      where('order', '==', currentOrder + 1)
    );
    const snapshot = await getDocs(categoriesQuery);
    
    if (!snapshot.empty) {
      const otherCategoryDoc = snapshot.docs[0];
      const categoryDoc = doc(db, 'categories', categoryId);
      
      // Swap orders
      transaction.update(categoryDoc, { 
        order: currentOrder + 1,
        updatedAt: serverTimestamp()
      });
      transaction.update(otherCategoryDoc.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

// Move subcategory up or down
export const moveSubcategoryUp = async (subcategoryId, categoryId, currentOrder) => {
  if (currentOrder <= 1) return; // Already at the top
  
  return await runTransaction(db, async (transaction) => {
    // Find the subcategory with the previous order in the same category
    const subcategoriesQuery = query(
      subcategoriesRef,
      where('categoryId', '==', categoryId),
      where('order', '==', currentOrder - 1)
    );
    const snapshot = await getDocs(subcategoriesQuery);
    
    if (!snapshot.empty) {
      const otherSubcategoryDoc = snapshot.docs[0];
      const subcategoryDoc = doc(db, 'subcategories', subcategoryId);
      
      // Swap orders
      transaction.update(subcategoryDoc, { 
        order: currentOrder - 1,
        updatedAt: serverTimestamp()
      });
      transaction.update(otherSubcategoryDoc.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

export const moveSubcategoryDown = async (subcategoryId, categoryId, currentOrder, maxOrder) => {
  if (currentOrder >= maxOrder) return; // Already at the bottom
  
  return await runTransaction(db, async (transaction) => {
    // Find the subcategory with the next order in the same category
    const subcategoriesQuery = query(
      subcategoriesRef,
      where('categoryId', '==', categoryId),
      where('order', '==', currentOrder + 1)
    );
    const snapshot = await getDocs(subcategoriesQuery);
    
    if (!snapshot.empty) {
      const otherSubcategoryDoc = snapshot.docs[0];
      const subcategoryDoc = doc(db, 'subcategories', subcategoryId);
      
      // Swap orders
      transaction.update(subcategoryDoc, { 
        order: currentOrder + 1,
        updatedAt: serverTimestamp()
      });
      transaction.update(otherSubcategoryDoc.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

// ==================== GLOSSARY FUNCTIONS ====================

// Get all glossary terms
export const getGlossaryTerms = async () => {
  try {
    const snapshot = await getDocs(glossaryRef);
    const terms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by order field, fallback to alphabetical for items without order
    return terms.sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.term.toLowerCase().localeCompare(b.term.toLowerCase());
    });
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    throw error;
  }
};

// Subscribe to glossary terms real-time updates
export const subscribeToGlossaryTerms = (callback) => {
  try {
    return onSnapshot(glossaryRef, (snapshot) => {
      const terms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by order field, fallback to alphabetical for items without order
      const sortedTerms = terms.sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.term.toLowerCase().localeCompare(b.term.toLowerCase());
      });
      callback(sortedTerms);
    });
  } catch (error) {
    console.error('Error subscribing to glossary terms:', error);
    throw error;
  }
};

// Add a new glossary term
export const addGlossaryTerm = async (termData) => {
  try {
    // Get the next order number
    const snapshot = await getDocs(glossaryRef);
    const maxOrder = snapshot.docs.reduce((max, doc) => {
      const order = doc.data().order || 0;
      return Math.max(max, order);
    }, 0);
    
    const docRef = await addDoc(glossaryRef, {
      ...termData,
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding glossary term:', error);
    throw error;
  }
};

// Update a glossary term
export const updateGlossaryTerm = async (termId, updates) => {
  try {
    const termDoc = doc(db, 'glossary', termId);
    await updateDoc(termDoc, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating glossary term:', error);
    throw error;
  }
};

// Delete a glossary term
export const deleteGlossaryTerm = async (termId) => {
  try {
    const termDoc = doc(db, 'glossary', termId);
    await deleteDoc(termDoc);
  } catch (error) {
    console.error('Error deleting glossary term:', error);
    throw error;
  }
};

// Move glossary term up in order
export const moveGlossaryTermUp = async (termId) => {
  return await runTransaction(db, async (transaction) => {
    const termDoc = doc(db, 'glossary', termId);
    const termSnapshot = await transaction.get(termDoc);
    
    if (!termSnapshot.exists()) {
      throw new Error('Term does not exist');
    }
    
    const currentOrder = termSnapshot.data().order || 0;
    
    // Find the term with the next lower order
    const glossaryQuery = query(glossaryRef);
    const snapshot = await getDocs(glossaryQuery);
    
    let targetTerm = null;
    let targetOrder = -1;
    
    snapshot.docs.forEach(doc => {
      const order = doc.data().order || 0;
      if (order < currentOrder && order > targetOrder) {
        targetOrder = order;
        targetTerm = doc;
      }
    });
    
    if (targetTerm) {
      // Swap orders
      transaction.update(termDoc, { 
        order: targetOrder,
        updatedAt: serverTimestamp()
      });
      transaction.update(targetTerm.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

// Move glossary term down in order
export const moveGlossaryTermDown = async (termId) => {
  return await runTransaction(db, async (transaction) => {
    const termDoc = doc(db, 'glossary', termId);
    const termSnapshot = await transaction.get(termDoc);
    
    if (!termSnapshot.exists()) {
      throw new Error('Term does not exist');
    }
    
    const currentOrder = termSnapshot.data().order || 0;
    
    // Find the term with the next higher order
    const glossaryQuery = query(glossaryRef);
    const snapshot = await getDocs(glossaryQuery);
    
    let targetTerm = null;
    let targetOrder = Infinity;
    
    snapshot.docs.forEach(doc => {
      const order = doc.data().order || 0;
      if (order > currentOrder && order < targetOrder) {
        targetOrder = order;
        targetTerm = doc;
      }
    });
    
    if (targetTerm) {
      // Swap orders
      transaction.update(termDoc, { 
        order: targetOrder,
        updatedAt: serverTimestamp()
      });
      transaction.update(targetTerm.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};