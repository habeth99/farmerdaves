import { Item } from '../../models/item';

const PROJECT_ID = 'farmerdaves-e97a7';
const COLLECTION_NAME = 'items';
const FIRESTORE_API_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Helper function to transform Firestore REST API response to our Item interface
function transformFirestoreDocument(doc: any): Item {
  const fields = doc.fields || {};
  return {
    id: doc.name?.split('/').pop() || '', // Extract document ID from the full path
    name: fields.name?.stringValue || '',
    price: parseInt(fields.price?.integerValue || fields.price?.doubleValue || '0'),
    size: parseInt(fields.size?.integerValue || fields.size?.doubleValue || '0'),
    image: fields.image?.stringValue || '',
    createdAt: fields.createdAt?.timestampValue ? new Date(fields.createdAt.timestampValue) : undefined,
    updatedAt: fields.updatedAt?.timestampValue ? new Date(fields.updatedAt.timestampValue) : undefined
  };
}

// Server-side function to get all items
export async function getAllItemsServerSide(): Promise<Item[]> {
  try {
    const url = `${FIRESTORE_API_BASE}/${COLLECTION_NAME}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const documents = data.documents || [];
    
         // Transform each document and sort by createdAt desc (client-side since REST API doesn't support orderBy without indexes)
     const items = documents
       .map(transformFirestoreDocument)
       .sort((a: Item, b: Item) => {
         if (!a.createdAt || !b.createdAt) return 0;
         return b.createdAt.getTime() - a.createdAt.getTime();
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
    const url = `${FIRESTORE_API_BASE}/${COLLECTION_NAME}/${itemId}`;
    const response = await fetch(url);
    
    if (response.status === 404) {
      return null; // Document doesn't exist
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const doc = await response.json();
    return transformFirestoreDocument(doc);
  } catch (error) {
    console.error('Error getting item server-side: ', error);
    throw new Error('Failed to fetch item');
  }
} 