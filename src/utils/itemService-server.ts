import { adminDb } from './firebase-admin';
import { Item } from '../../models/item';

const COLLECTION_NAME = 'items';

// Server-side function to get all items
export async function getAllItemsServerSide(): Promise<Item[]> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();

    const items: Item[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        name: data.name,
        price: data.price,
        size: data.size,
        image: data.image,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });

    return items;
  } catch (error) {
    console.error('Error getting items server-side: ', error);
    throw new Error('Failed to fetch items');
  }
}

// Server-side function to get a single item by ID
export async function getItemByIdServerSide(itemId: string): Promise<Item | null> {
  try {
    const doc = await adminDb.collection(COLLECTION_NAME).doc(itemId).get();
    
    if (doc.exists) {
      const data = doc.data();
      return {
        id: doc.id,
        name: data?.name,
        price: data?.price,
        size: data?.size,
        image: data?.image,
        createdAt: data?.createdAt?.toDate(),
        updatedAt: data?.updatedAt?.toDate()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting item server-side: ', error);
    throw new Error('Failed to fetch item');
  }
} 