# Starvation Library Admin Portal

A comprehensive ReactJS admin web application built with modern technologies to manage the "Starvation Library" content structure for mobile applications. This portal allows administrators to manage main categories and subcategories in both English and Arabic languages.

## 🚀 Features

- **Firebase Authentication**: Secure login/logout with email/password
- **Real-time Data**: Live updates using Firebase Firestore real-time listeners
- **Bilingual Support**: Full English and Arabic content management with RTL support
- **Content Management**: Complete CRUD operations for categories and subcategories
- **Drag & Drop**: Intuitive reordering with move up/down functionality
- **Color Management**: Visual color picker for subcategory customization
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern UI**: Clean, professional interface built with Tailwind CSS and Radix UI

## 🛠️ Tech Stack

- **Frontend**: ReactJS 18+ (No TypeScript)
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI (Dialog, Dropdown, Toast)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Backend**: Firebase v10+ (Authentication + Firestore)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── CategoryRow.jsx
│   ├── ConfirmDialog.jsx
│   ├── EmptyState.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── SubcategoryDialog.jsx
│   └── SubcategoryRow.jsx
├── lib/                 # Configuration files
│   └── firebase.js
├── pages/              # Main application pages
│   ├── AdminPage.jsx
│   └── LoginPage.jsx
├── services/           # API and service layer
│   └── contentService.js
├── store/             # Zustand state stores
│   ├── useAuthStore.js
│   └── useContentStore.js
├── App.jsx            # Main application component
├── index.css          # Global styles and Tailwind imports
└── main.jsx          # Application entry point
```

## 🔧 Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Add a web app to your Firebase project
5. Copy the Firebase configuration

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Firebase Security Rules

Configure Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Categories collection
    match /categories/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Subcategories collection  
    match /subcategories/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Create Admin User

In Firebase Console → Authentication → Users, manually add your admin user with email and password.

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 Firestore Data Model

### Categories Collection
```javascript
{
  id: "auto-generated",
  titleEn: "Category Title in English",
  titleAr: "عنوان الفئة بالعربية", 
  order: 1,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Subcategories Collection
```javascript
{
  id: "auto-generated",
  categoryId: "parent_category_id",
  titleEn: "Subcategory Title in English",
  titleAr: "عنوان الفئة الفرعية بالعربية",
  contentEn: "Content description in English",
  contentAr: "وصف المحتوى بالعربية",
  colorHex: "#37B24D",
  order: 1,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎨 UI Features

### Category Management
- ➕ Add new categories
- ✏️ Inline editing of category titles
- 🗑️ Delete categories (with cascade delete of subcategories)
- ⬆️⬇️ Reorder categories with up/down buttons
- 📁 Expand/collapse to view subcategories

### Subcategory Management
- ➕ Add subcategories with full form modal
- ✏️ Edit all subcategory fields (titles, content, color)
- 🗑️ Delete individual subcategories
- ⬆️⬇️ Reorder within category
- 🎨 Visual color picker and hex input
- 🌍 Bilingual input with RTL support for Arabic

### Authentication
- 🔐 Secure email/password login
- 🚪 Protected routes with automatic redirects
- 🔄 Persistent sessions
- 🚫 Logout functionality

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔒 Security Considerations

- All routes are protected except `/login`
- Firestore rules require authentication
- Environment variables protect sensitive Firebase config
- Input validation on all forms
- XSS protection through React's default escaping

## 🎯 Usage Guide

1. **Login**: Use your admin credentials to access the dashboard
2. **Add Categories**: Use the top form to add main categories
3. **Manage Categories**: Use action buttons to edit, delete, or reorder
4. **Add Subcategories**: Click the + button on expanded categories
5. **Edit Content**: Use the modal forms for detailed subcategory editing
6. **Reorder Items**: Use up/down arrows or drag & drop (future feature)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check Firebase documentation for backend-related questions
- Review React and Vite documentation for frontend issues+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
