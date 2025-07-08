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
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, CreateOrderInput, UpdateOrderInput } from '../../models/order';

const COLLECTION_NAME = 'orders';

// Create a new order
export async function createOrder(orderData: CreateOrderInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Order created with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order: ', error);
    throw new Error('Failed to create order');
  }
}

// Get all orders
export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        customerEmail: data.customerEmail,
        items: data.items || [],
        totalAmount: data.totalAmount || 0,
        status: data.status || 'pending',
        orderDate: data.orderDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders: ', error);
    throw new Error('Failed to fetch orders');
  }
}

// Get orders for today
export async function getTodayOrders(): Promise<Order[]> {
  try {
    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, COLLECTION_NAME),
      where('orderDate', '>=', Timestamp.fromDate(today)),
      where('orderDate', '<', Timestamp.fromDate(tomorrow)),
      orderBy('orderDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        customerEmail: data.customerEmail,
        items: data.items || [],
        totalAmount: data.totalAmount || 0,
        status: data.status || 'pending',
        orderDate: data.orderDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting today orders: ', error);
    // Return empty array for now if there's an error (collection might not exist yet)
    return [];
  }
}

// Get a single order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        customerEmail: data.customerEmail,
        items: data.items || [],
        totalAmount: data.totalAmount || 0,
        status: data.status || 'pending',
        orderDate: data.orderDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting order: ', error);
    throw new Error('Failed to fetch order');
  }
}

// Update an order
export async function updateOrder(updateData: UpdateOrderInput): Promise<void> {
  try {
    const { id, ...dataToUpdate } = updateData;
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // Filter out undefined values to prevent Firebase issues
    const cleanData = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Order updated successfully');
  } catch (error) {
    console.error('Error updating order: ', error);
    throw new Error('Failed to update order');
  }
}

// Delete an order
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, orderId));
    console.log('Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order: ', error);
    throw new Error('Failed to delete order');
  }
} 