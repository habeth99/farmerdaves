import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const CARTS_COLLECTION = 'carts';
const ITEMS_COLLECTION = 'items';

// Helper function to remove undefined values for Firestore
const cleanForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  // Preserve Date objects as-is for Firestore to handle
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned;
  }
  
  return obj;
};

// Clean up expired items across all user carts
export async function cleanupExpiredCartItems(): Promise<void> {
  try {
    console.log('Starting cart cleanup process...');
    
    // Get all carts
    const cartsSnapshot = await getDocs(collection(db, CARTS_COLLECTION));
    const now = new Date();
    let totalExpiredItems = 0;
    let cartsProcessed = 0;
    
    // Process each cart
    for (const cartDoc of cartsSnapshot.docs) {
      const cartData = cartDoc.data();
      const cartItems = cartData.items || [];
      
      if (cartItems.length === 0) continue;
      
      // Find expired items in this cart
      const expiredItems = cartItems.filter((item: any) => {
        const expiresAt = item.expiresAt?.toDate ? item.expiresAt.toDate() : item.expiresAt;
        return expiresAt && expiresAt < now;
      });
      
      const validItems = cartItems.filter((item: any) => {
        const expiresAt = item.expiresAt?.toDate ? item.expiresAt.toDate() : item.expiresAt;
        return expiresAt && expiresAt >= now;
      });
      
      if (expiredItems.length > 0) {
        // Use transaction to update cart and restore inventory atomically
        await runTransaction(db, async (transaction) => {
          // Restore inventory for expired items
          for (const expiredItem of expiredItems) {
            const itemDocRef = doc(db, ITEMS_COLLECTION, expiredItem.productId);
            const itemDoc = await transaction.get(itemDocRef);
            
            if (itemDoc.exists()) {
              const currentQuantity = itemDoc.data().quantity || 0;
              transaction.update(itemDocRef, {
                quantity: currentQuantity + expiredItem.quantity,
                updatedAt: serverTimestamp()
              });
            }
          }
          
          // Update cart with only valid items
          const cartDocRef = doc(db, CARTS_COLLECTION, cartDoc.id);
          transaction.update(cartDocRef, {
            items: cleanForFirestore(validItems),
            updatedAt: serverTimestamp()
          });
        });
        
        totalExpiredItems += expiredItems.length;
        cartsProcessed++;
        
        console.log(`Cleaned ${expiredItems.length} expired items from cart ${cartDoc.id}`);
      }
    }
    
    console.log(`Cart cleanup completed: ${totalExpiredItems} expired items cleaned from ${cartsProcessed} carts`);
  } catch (error) {
    console.error('Error during cart cleanup:', error);
    throw error;
  }
}

// Schedule cleanup to run every hour (for demo purposes - in production this should be less frequent)
export function startCartCleanupScheduler(): void {
  console.log('Starting cart cleanup scheduler...');
  
  // Run immediately
  cleanupExpiredCartItems().catch(console.error);
  
  // Then run every hour
  setInterval(() => {
    cleanupExpiredCartItems().catch(console.error);
  }, 60 * 60 * 1000); // 1 hour in milliseconds
} 