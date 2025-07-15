import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Cart, CartItem, AddToCartInput, UpdateCartItemInput } from '../../models/cart';
import { getItemById, updateItem } from './itemService';

const CARTS_COLLECTION = 'carts';
const ITEMS_COLLECTION = 'items';

// Generate unique ID for cart items
const generateCartItemId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Calculate expiration date (24 hours from now)
const getExpirationDate = () => {
  const now = new Date();
  const expiration = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
  return expiration;
};

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

// Get user's cart
export async function getUserCart(userId: string): Promise<Cart | null> {
  try {
    const cartDocRef = doc(db, CARTS_COLLECTION, userId);
    const cartDoc = await getDoc(cartDocRef);
    
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      const cart: Cart = {
        id: cartDoc.id,
        userId: data.userId,
        items: data.items.map((item: any) => ({
          ...item,
          addedAt: item.addedAt?.toDate ? item.addedAt.toDate() : item.addedAt,
          expiresAt: item.expiresAt?.toDate ? item.expiresAt.toDate() : item.expiresAt
        })),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
      
      // Clean expired items before returning
      return await cleanExpiredItems(cart);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user cart:', error);
    throw new Error('Failed to get cart');
  }
}

// Clean expired items from cart and restore inventory
export async function cleanExpiredItems(cart: Cart): Promise<Cart> {
  try {
    const now = new Date();
    const expiredItems = cart.items.filter(item => {
      const expiresAt = item.expiresAt instanceof Date ? item.expiresAt : new Date(item.expiresAt);
      return expiresAt < now;
    });
    const validItems = cart.items.filter(item => {
      const expiresAt = item.expiresAt instanceof Date ? item.expiresAt : new Date(item.expiresAt);
      return expiresAt >= now;
    });
    
    if (expiredItems.length > 0) {
      // Use transaction to update both cart and inventory atomically
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
        const cartDocRef = doc(db, CARTS_COLLECTION, cart.userId);
        transaction.update(cartDocRef, {
          items: cleanForFirestore(validItems.map(item => ({
            ...item,
            addedAt: item.addedAt,
            expiresAt: item.expiresAt
          }))),
          updatedAt: serverTimestamp()
        });
      });
      
      console.log(`Cleaned ${expiredItems.length} expired items from cart`);
    }
    
    return {
      ...cart,
      items: validItems
    };
  } catch (error) {
    console.error('Error cleaning expired items:', error);
    return cart; // Return original cart if cleaning fails
  }
}

// Add item to cart
export async function addToCart(userId: string, cartInput: AddToCartInput): Promise<void> {
  try {
    // First, check if the item has enough inventory
    const item = await getItemById(cartInput.productId);
    if (!item) {
      throw new Error('Product not found');
    }
    
    if (item.quantity < cartInput.quantity) {
      throw new Error(`Only ${item.quantity} items available in stock`);
    }
    
    // Use transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const cartDocRef = doc(db, CARTS_COLLECTION, userId);
      const itemDocRef = doc(db, ITEMS_COLLECTION, cartInput.productId);
      
      // Get current cart and item data
      const cartDoc = await transaction.get(cartDocRef);
      const itemDoc = await transaction.get(itemDocRef);
      
      if (!itemDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const currentItemQuantity = itemDoc.data().quantity || 0;
      
      // Check stock again in transaction
      if (currentItemQuantity < cartInput.quantity) {
        throw new Error(`Only ${currentItemQuantity} items available in stock`);
      }
      
      const now = new Date();
      const expiresAt = getExpirationDate();
      
      const newCartItem: CartItem = {
        id: generateCartItemId(),
        productId: cartInput.productId,
        productName: cartInput.productName,
        productPrice: cartInput.productPrice,
        productSize: cartInput.productSize,
        productImage: cartInput.productImage,
        quantity: cartInput.quantity,
        addedAt: now,
        expiresAt: expiresAt
      };
      
      if (cartDoc.exists()) {
        // Update existing cart
        const cartData = cartDoc.data();
        const existingItems = cartData.items || [];
        
        // Check if item already exists in cart
        const existingItemIndex = existingItems.findIndex(
          (item: any) => item.productId === cartInput.productId
        );
        
        let updatedItems;
        if (existingItemIndex >= 0) {
          // Update existing item quantity and expiration
          updatedItems = [...existingItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + cartInput.quantity,
            expiresAt: expiresAt // Reset expiration time
          };
        } else {
          // Add new item
          updatedItems = [...existingItems, newCartItem];
        }
        
        transaction.update(cartDocRef, {
          items: cleanForFirestore(updatedItems),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new cart
        transaction.set(cartDocRef, {
          userId,
          items: cleanForFirestore([newCartItem]),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Reduce inventory
      transaction.update(itemDocRef, {
        quantity: currentItemQuantity - cartInput.quantity,
        updatedAt: serverTimestamp()
      });
    });
    
    console.log('Item added to cart successfully');
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
}

// Remove item from cart
export async function removeFromCart(userId: string, cartItemId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const cartDocRef = doc(db, CARTS_COLLECTION, userId);
      const cartDoc = await transaction.get(cartDocRef);
      
      if (!cartDoc.exists()) {
        throw new Error('Cart not found');
      }
      
      const cartData = cartDoc.data();
      const items = cartData.items || [];
      
      // Find the item to remove
      const itemToRemove = items.find((item: any) => item.id === cartItemId);
      if (!itemToRemove) {
        throw new Error('Item not found in cart');
      }
      
      // Remove item from cart
      const updatedItems = items.filter((item: any) => item.id !== cartItemId);
      
      // Restore inventory
      const itemDocRef = doc(db, ITEMS_COLLECTION, itemToRemove.productId);
      const itemDoc = await transaction.get(itemDocRef);
      
      if (itemDoc.exists()) {
        const currentQuantity = itemDoc.data().quantity || 0;
        transaction.update(itemDocRef, {
          quantity: currentQuantity + itemToRemove.quantity,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update cart
      transaction.update(cartDocRef, {
        items: cleanForFirestore(updatedItems),
        updatedAt: serverTimestamp()
      });
    });
    
    console.log('Item removed from cart successfully');
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(userId: string, cartItemId: string, newQuantity: number): Promise<void> {
  try {
    if (newQuantity <= 0) {
      await removeFromCart(userId, cartItemId);
      return;
    }
    
    await runTransaction(db, async (transaction) => {
      const cartDocRef = doc(db, CARTS_COLLECTION, userId);
      const cartDoc = await transaction.get(cartDocRef);
      
      if (!cartDoc.exists()) {
        throw new Error('Cart not found');
      }
      
      const cartData = cartDoc.data();
      const items = cartData.items || [];
      
      // Find the item to update
      const itemIndex = items.findIndex((item: any) => item.id === cartItemId);
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      const cartItem = items[itemIndex];
      const quantityDifference = newQuantity - cartItem.quantity;
      
      // Check inventory if increasing quantity
      if (quantityDifference > 0) {
        const itemDocRef = doc(db, ITEMS_COLLECTION, cartItem.productId);
        const itemDoc = await transaction.get(itemDocRef);
        
        if (!itemDoc.exists()) {
          throw new Error('Product not found');
        }
        
        const availableQuantity = itemDoc.data().quantity || 0;
        if (availableQuantity < quantityDifference) {
          throw new Error(`Only ${availableQuantity} additional items available`);
        }
        
        // Update inventory
        transaction.update(itemDocRef, {
          quantity: availableQuantity - quantityDifference,
          updatedAt: serverTimestamp()
        });
      } else if (quantityDifference < 0) {
        // Restore inventory if decreasing quantity
        const itemDocRef = doc(db, ITEMS_COLLECTION, cartItem.productId);
        const itemDoc = await transaction.get(itemDocRef);
        
        if (itemDoc.exists()) {
          const currentQuantity = itemDoc.data().quantity || 0;
          transaction.update(itemDocRef, {
            quantity: currentQuantity + Math.abs(quantityDifference),
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // Update cart item
      const updatedItems = [...items];
      updatedItems[itemIndex] = {
        ...cartItem,
        quantity: newQuantity,
        expiresAt: getExpirationDate() // Reset expiration time
      };
      
      transaction.update(cartDocRef, {
        items: cleanForFirestore(updatedItems),
        updatedAt: serverTimestamp()
      });
    });
    
    console.log('Cart item quantity updated successfully');
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
}

// Clear entire cart (restore all inventory)
export async function clearCart(userId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const cartDocRef = doc(db, CARTS_COLLECTION, userId);
      const cartDoc = await transaction.get(cartDocRef);
      
      if (!cartDoc.exists()) {
        return; // Cart doesn't exist, nothing to clear
      }
      
      const cartData = cartDoc.data();
      const items = cartData.items || [];
      
      // Restore inventory for all items
      for (const cartItem of items) {
        const itemDocRef = doc(db, ITEMS_COLLECTION, cartItem.productId);
        const itemDoc = await transaction.get(itemDocRef);
        
        if (itemDoc.exists()) {
          const currentQuantity = itemDoc.data().quantity || 0;
          transaction.update(itemDocRef, {
            quantity: currentQuantity + cartItem.quantity,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // Clear cart
      transaction.update(cartDocRef, {
        items: [],
        updatedAt: serverTimestamp()
      });
    });
    
    console.log('Cart cleared successfully');
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// Get cart summary (total items, total price)
export function getCartSummary(cart: Cart | null) {
  if (!cart || cart.items.length === 0) {
    return {
      totalItems: 0,
      totalPrice: 0,
      itemCount: 0
    };
  }
  
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
  
  return {
    totalItems,
    totalPrice,
    itemCount: cart.items.length
  };
} 