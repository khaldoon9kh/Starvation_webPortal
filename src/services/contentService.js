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
    where('categoryId', '==', categoryId),
    orderBy('order', 'asc')
  );
  return onSnapshot(q, callback);
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