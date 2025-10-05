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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// Collection references
const categoriesRef = collection(db, 'categories');
const subcategoriesRef = collection(db, 'subcategories');
const glossaryRef = collection(db, 'glossary');
const diagramsRef = collection(db, 'diagrams');
const templatesRef = collection(db, 'templates');

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

// ==================== DIAGRAMS FUNCTIONS ====================

// Upload image to Firebase Storage
export const uploadDiagramImage = async (file, diagramId) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${diagramId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `diagrams/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      fileName: fileName,
      originalName: file.name,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteDiagramImage = async (fileName) => {
  try {
    const storageRef = ref(storage, `diagrams/${fileName}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error if file doesn't exist
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
};

// Get all diagrams
export const getDiagrams = async () => {
  try {
    const snapshot = await getDocs(diagramsRef);
    const diagrams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by order field, fallback to creation date for items without order
    return diagrams.sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // Fallback to creation date
      return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
    });
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    throw error;
  }
};

// Subscribe to diagrams real-time updates
export const subscribeToDiagrams = (callback) => {
  try {
    return onSnapshot(diagramsRef, (snapshot) => {
      const diagrams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by order field, fallback to creation date for items without order
      const sortedDiagrams = diagrams.sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      });
      callback(sortedDiagrams);
    });
  } catch (error) {
    console.error('Error subscribing to diagrams:', error);
    throw error;
  }
};

// Add a new diagram
export const addDiagram = async (diagramData, imageFile) => {
  try {
    // Get the next order number
    const snapshot = await getDocs(diagramsRef);
    const maxOrder = snapshot.docs.reduce((max, doc) => {
      const order = doc.data().order || 0;
      return Math.max(max, order);
    }, 0);

    // Create document with initial data
    const docRef = await addDoc(diagramsRef, {
      title: diagramData.title,
      titleArabic: diagramData.titleArabic || '',
      description: diagramData.description,
      descriptionArabic: diagramData.descriptionArabic || '',
      category: diagramData.category || '',
      order: maxOrder + 1,
      imageUrl: '',
      imageFileName: '',
      imageOriginalName: '',
      imageSize: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Upload image if provided
    if (imageFile) {
      const imageData = await uploadDiagramImage(imageFile, docRef.id);
      
      // Update document with image data
      await updateDoc(docRef, {
        imageUrl: imageData.url,
        imageFileName: imageData.fileName,
        imageOriginalName: imageData.originalName,
        imageSize: imageData.size,
        updatedAt: serverTimestamp()
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding diagram:', error);
    throw error;
  }
};

// Update a diagram
export const updateDiagram = async (diagramId, updates, newImageFile) => {
  try {
    const diagramDoc = doc(db, 'diagrams', diagramId);
    
    // If there's a new image, upload it and delete the old one
    let imageData = null;
    if (newImageFile) {
      // Get current diagram data to delete old image
      const currentSnapshot = await getDocs(query(diagramsRef));
      const currentDoc = currentSnapshot.docs.find(doc => doc.id === diagramId);
      const currentData = currentDoc?.data();
      
      // Upload new image
      imageData = await uploadDiagramImage(newImageFile, diagramId);
      
      // Delete old image if it exists
      if (currentData?.imageFileName) {
        await deleteDiagramImage(currentData.imageFileName);
      }
    }

    // Update document
    await updateDoc(diagramDoc, {
      ...updates,
      ...(imageData && {
        imageUrl: imageData.url,
        imageFileName: imageData.fileName,
        imageOriginalName: imageData.originalName,
        imageSize: imageData.size
      }),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating diagram:', error);
    throw error;
  }
};

// Delete a diagram
export const deleteDiagram = async (diagramId) => {
  try {
    // Get diagram data to delete associated image
    const snapshot = await getDocs(query(diagramsRef));
    const diagramDoc = snapshot.docs.find(doc => doc.id === diagramId);
    const diagramData = diagramDoc?.data();
    
    // Delete image from storage if it exists
    if (diagramData?.imageFileName) {
      await deleteDiagramImage(diagramData.imageFileName);
    }
    
    // Delete document
    const docRef = doc(db, 'diagrams', diagramId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting diagram:', error);
    throw error;
  }
};

// Move diagram up in order
export const moveDiagramUp = async (diagramId) => {
  return await runTransaction(db, async (transaction) => {
    const diagramDoc = doc(db, 'diagrams', diagramId);
    const diagramSnapshot = await transaction.get(diagramDoc);
    
    if (!diagramSnapshot.exists()) {
      throw new Error('Diagram does not exist');
    }
    
    const currentOrder = diagramSnapshot.data().order || 0;
    
    // Find the diagram with the next lower order
    const diagramsQuery = query(diagramsRef);
    const snapshot = await getDocs(diagramsQuery);
    
    let targetDiagram = null;
    let targetOrder = -1;
    
    snapshot.docs.forEach(doc => {
      const order = doc.data().order || 0;
      if (order < currentOrder && order > targetOrder) {
        targetOrder = order;
        targetDiagram = doc;
      }
    });
    
    if (targetDiagram) {
      // Swap orders
      transaction.update(diagramDoc, { 
        order: targetOrder,
        updatedAt: serverTimestamp()
      });
      transaction.update(targetDiagram.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

// Move diagram down in order
export const moveDiagramDown = async (diagramId) => {
  return await runTransaction(db, async (transaction) => {
    const diagramDoc = doc(db, 'diagrams', diagramId);
    const diagramSnapshot = await transaction.get(diagramDoc);
    
    if (!diagramSnapshot.exists()) {
      throw new Error('Diagram does not exist');
    }
    
    const currentOrder = diagramSnapshot.data().order || 0;
    
    // Find the diagram with the next higher order
    const diagramsQuery = query(diagramsRef);
    const snapshot = await getDocs(diagramsQuery);
    
    let targetDiagram = null;
    let targetOrder = Infinity;
    
    snapshot.docs.forEach(doc => {
      const order = doc.data().order || 0;
      if (order > currentOrder && order < targetOrder) {
        targetOrder = order;
        targetDiagram = doc;
      }
    });
    
    if (targetDiagram) {
      // Swap orders
      transaction.update(diagramDoc, { 
        order: targetOrder,
        updatedAt: serverTimestamp()
      });
      transaction.update(targetDiagram.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

// ==================== TEMPLATES OPERATIONS ====================

// Helper function to upload template PDF to Firebase Storage
const uploadTemplatePDF = async (file, templateId) => {
  const timestamp = Date.now();
  const fileName = `template_${templateId}_${timestamp}.pdf`;
  const storageRef = ref(storage, `templates/${fileName}`);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      fileName,
      originalName: file.name,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

// Helper function to delete template PDF from Firebase Storage
const deleteTemplatePDF = async (fileName) => {
  const storageRef = ref(storage, `templates/${fileName}`);
  
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
};

// Watch templates with real-time updates
export const watchTemplates = (callback) => {
  const q = query(templatesRef, orderBy('order', 'asc'));
  return onSnapshot(q, callback);
};

// Create a new template
export const createTemplate = async (templateData, pdfFile) => {
  try {
    // Get the highest order value and increment by 1
    const q = query(templatesRef, orderBy('order', 'desc'));
    const snapshot = await getDocs(q);
    const highestOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;
    
    // Create template document first to get ID
    const docRef = await addDoc(templatesRef, {
      title: templateData.title || '',
      titleArabic: templateData.titleArabic || '',
      description: templateData.description || '',
      descriptionArabic: templateData.descriptionArabic || '',
      category: templateData.category || '',
      order: highestOrder + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Upload PDF file
    const pdfData = await uploadTemplatePDF(pdfFile, docRef.id);
    
    // Update document with PDF information
    await updateDoc(docRef, {
      pdfUrl: pdfData.url,
      pdfFileName: pdfData.fileName,
      pdfOriginalName: pdfData.originalName,
      pdfSize: pdfData.size,
      updatedAt: serverTimestamp()
    });
    
    return docRef;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

// Update an existing template
export const updateTemplate = async (templateId, updates, newPdfFile = null) => {
  try {
    const templateDoc = doc(db, 'templates', templateId);
    
    // Handle PDF file update if provided
    let pdfData = null;
    if (newPdfFile) {
      // Get current template data to delete old PDF
      const currentSnapshot = await getDocs(query(templatesRef));
      const currentDoc = currentSnapshot.docs.find(doc => doc.id === templateId);
      const currentData = currentDoc?.data();
      
      // Upload new PDF
      pdfData = await uploadTemplatePDF(newPdfFile, templateId);
      
      // Delete old PDF if it exists
      if (currentData?.pdfFileName) {
        await deleteTemplatePDF(currentData.pdfFileName);
      }
    }

    // Update document
    await updateDoc(templateDoc, {
      ...updates,
      ...(pdfData && {
        pdfUrl: pdfData.url,
        pdfFileName: pdfData.fileName,
        pdfOriginalName: pdfData.originalName,
        pdfSize: pdfData.size
      }),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

// Delete a template
export const deleteTemplate = async (templateId) => {
  try {
    // Get template data to delete associated PDF
    const snapshot = await getDocs(query(templatesRef));
    const templateDoc = snapshot.docs.find(doc => doc.id === templateId);
    const templateData = templateDoc?.data();
    
    // Delete PDF from storage if it exists
    if (templateData?.pdfFileName) {
      await deleteTemplatePDF(templateData.pdfFileName);
    }
    
    // Delete document
    const docRef = doc(db, 'templates', templateId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Move template up in order
export const moveTemplateUp = async (templateId) => {
  return await runTransaction(db, async (transaction) => {
    const templateDoc = doc(db, 'templates', templateId);
    const templateSnapshot = await transaction.get(templateDoc);
    
    if (!templateSnapshot.exists()) {
      throw new Error('Template does not exist');
    }
    
    const currentOrder = templateSnapshot.data().order || 0;
    
    // Find the template with the next lower order
    const templatesQuery = query(templatesRef);
    const snapshot = await getDocs(templatesQuery);
    
    let targetTemplate = null;
    let targetOrder = -1;
    
    snapshot.docs.forEach(doc => {
      const order = doc.data().order || 0;
      if (order < currentOrder && order > targetOrder) {
        targetOrder = order;
        targetTemplate = doc;
      }
    });
    
    if (targetTemplate) {
      // Swap orders
      transaction.update(templateDoc, { 
        order: targetOrder,
        updatedAt: serverTimestamp()
      });
      transaction.update(targetTemplate.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};

// Move template down in order
export const moveTemplateDown = async (templateId) => {
  return await runTransaction(db, async (transaction) => {
    const templateDoc = doc(db, 'templates', templateId);
    const templateSnapshot = await transaction.get(templateDoc);
    
    if (!templateSnapshot.exists()) {
      throw new Error('Template does not exist');
    }
    
    const currentOrder = templateSnapshot.data().order || 0;
    
    // Find the template with the next higher order
    const templatesQuery = query(templatesRef);
    const snapshot = await getDocs(templatesQuery);
    
    let targetTemplate = null;
    let targetOrder = Infinity;
    
    snapshot.docs.forEach(doc => {
      const order = doc.data().order || 0;
      if (order > currentOrder && order < targetOrder) {
        targetOrder = order;
        targetTemplate = doc;
      }
    });
    
    if (targetTemplate) {
      // Swap orders
      transaction.update(templateDoc, { 
        order: targetOrder,
        updatedAt: serverTimestamp()
      });
      transaction.update(targetTemplate.ref, { 
        order: currentOrder,
        updatedAt: serverTimestamp()
      });
    }
  });
};