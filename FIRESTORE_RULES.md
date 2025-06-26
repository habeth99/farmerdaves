# Firestore Security Rules

To make this project work with the REST API approach, you need to update your Firestore security rules in the Firebase Console.

## Required Rules

Navigate to Firebase Console → Firestore Database → Rules and replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public reads for inventory items, but only authenticated users can write
    match /items/{document} {
      allow read; // Anyone can view inventory
      allow write: if request.auth != null; // Only authenticated users can add/edit items
    }
    
    // Keep other collections private (if you add users, orders, etc.)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## What this enables:
- ✅ Public can view inventory items (good for e-commerce)
- ✅ Only authenticated users can add/edit/delete items (admin protection)
- ✅ Server-side rendering works without firebase-admin SDK
- ✅ Other collections remain protected by authentication

## Next Steps:
1. Apply these rules in Firebase Console
2. Run `npm install` to remove firebase-admin from node_modules
3. Test the inventory page to confirm it loads correctly 