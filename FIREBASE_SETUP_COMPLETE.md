# 🔧 Firebase Setup for Complete Admin Portal

## 🚨 **IMPORTANT: Required Firebase Configuration**

To enable all features (Diagrams and Templates), you need to update your Firebase Security Rules in the Firebase Console.

## 📋 **Step-by-Step Setup**

### 1. **Firestore Security Rules**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** > **Rules**
4. Add these rules for all collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Existing collections (categories, subcategories, glossary)...
    
    // Add this rule for diagrams
    match /diagrams/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Add this rule for templates
    match /templates/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. **Firebase Storage Security Rules**
1. In Firebase Console, navigate to **Storage** > **Rules**
2. Add these rules for both diagrams and templates:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Add this rule for diagram images
    match /diagrams/{fileName} {
      allow read, write: if request.auth != null 
        && request.auth.token.email != null;
    }
    
    // Add this rule for template PDFs
    match /templates/{fileName} {
      allow read, write: if request.auth != null 
        && request.auth.token.email != null;
    }
  }
}
```

### 3. **Firebase Storage Setup**
If you haven't enabled Firebase Storage yet:

1. Go to **Storage** in Firebase Console
2. Click **Get Started**
3. Choose **Start in test mode** (we'll secure it with the rules above)
4. Select your preferred storage location
5. Click **Done**

## ✅ **Verification**

After updating the rules, test each feature:

### **Diagrams Testing**
1. **Test Upload**: Try uploading an image in the Diagrams tab
2. **Check Storage**: Verify images appear in Firebase Storage under `/diagrams/`
3. **Test Download**: Confirm you can download images from diagram cards
4. **Test Deletion**: Verify deleted diagrams remove images from storage

### **Templates Testing**
1. **Test Upload**: Try uploading a PDF in the Templates tab
2. **Check Storage**: Verify PDFs appear in Firebase Storage under `/templates/`
3. **Test Download**: Confirm you can download PDFs from template cards
4. **Test Viewing**: Verify PDFs open in new tabs for viewing
5. **Test Deletion**: Verify deleted templates remove PDFs from storage

## 🔒 **Security Notes**

- Rules require user authentication (`request.auth != null`)
- Storage rules also verify email exists (`request.auth.token.email != null`)
- Images are stored in `/diagrams/` folder in Storage
- PDFs are stored in `/templates/` folder in Storage
- Only authenticated admin users can upload/delete files

## 🚨 **If You Get Permission Errors**

### **"Permission denied" on Firestore operations**:
- Check Firestore rules include both diagrams and templates collections
- Verify user is logged in
- Ensure rules are properly formatted with no syntax errors

### **"Storage permission denied"**:
- Update Storage rules as shown above for both folders
- Make sure Firebase Storage is enabled
- Verify the storage bucket URL in your Firebase config

### **Rules not updating**:
- Rules can take a few minutes to propagate
- Try logging out and back in
- Clear browser cache if needed
- Check Firebase Console for rule validation errors

## 📊 **Complete Feature Matrix**

| Feature | File Type | Storage Folder | Max Size | Firestore Collection |
|---------|-----------|----------------|----------|---------------------|
| **Diagrams** | JPG, PNG, GIF, WebP | `/diagrams/` | 10MB | `diagrams` |
| **Templates** | PDF only | `/templates/` | 50MB | `templates` |

## 🎉 **Ready to Use!**

Once these rules are configured, your admin portal is fully functional with:

### ✅ **Diagrams Feature**
- Secure image upload to Firebase Storage
- Real-time diagram management 
- Image download and deletion
- Full admin portal integration

### ✅ **Templates Feature**
- Secure PDF upload to Firebase Storage
- Real-time template management
- PDF download and viewing
- Full admin portal integration

### ✅ **Existing Features**
- Content management (categories/subcategories)
- Glossary management
- User authentication
- Real-time synchronization

## 🛠️ **Advanced Configuration (Optional)**

### **CORS Configuration for Storage**
If you experience CORS issues with file downloads:

```javascript
// Add to your Firebase Storage bucket CORS policy
[
  {
    "origin": ["https://yourapp.com", "http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

### **Storage Security Enhancement**
For additional security, you can restrict file types in Storage rules:

```javascript
// Enhanced storage rules with file type validation
service firebase.storage {
  match /b/{bucket}/o {
    match /diagrams/{fileName} {
      allow read, write: if request.auth != null 
        && request.auth.token.email != null
        && (resource == null || resource.contentType.matches('image/.*'));
    }
    
    match /templates/{fileName} {
      allow read, write: if request.auth != null 
        && request.auth.token.email != null
        && (resource == null || resource.contentType == 'application/pdf');
    }
  }
}
```

---

**Need help?** Check the Firebase Console for any rule validation errors, and make sure your project has both Firestore and Storage enabled with the correct pricing plan for your usage needs.