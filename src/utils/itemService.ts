import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Item, CreateItemInput, UpdateItemInput } from '../../models/item';

const COLLECTION_NAME = 'items';

// Create a new item
export async function createItem(itemData: CreateItemInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Item created with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating item: ', error);
    throw new Error('Failed to create item');
  }
}

// Get all items
export async function getAllItems(): Promise<Item[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const items: Item[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        name: data.name,
        price: data.price,
        size: data.size,
        quantity: data.quantity || 0,
        description: data.description,
        image: data.image,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    return items;
  } catch (error) {
    console.error('Error getting items: ', error);
    throw new Error('Failed to fetch items');
  }
}

// Get a single item by ID
export async function getItemById(itemId: string): Promise<Item | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        price: data.price,
        size: data.size,
        quantity: data.quantity || 0,
        description: data.description,
        image: data.image,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting item: ', error);
    throw new Error('Failed to fetch item');
  }
}

// Update an item
export async function updateItem(updateData: UpdateItemInput): Promise<void> {
  try {
    const { id, ...dataToUpdate } = updateData;
    const docRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(docRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
    });
    
    console.log('Item updated successfully');
  } catch (error) {
    console.error('Error updating item: ', error);
    throw new Error('Failed to update item');
  }
}

// Delete an item
export async function deleteItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, itemId));
    console.log('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item: ', error);
    throw new Error('Failed to delete item');
  }
} 