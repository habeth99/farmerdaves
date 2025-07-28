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

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  size: number;
  subtotal: number;
}

export interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled';
  description?: string;
  orderDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrderInput {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  item: {
    id: string;
    name: string;
    price: number;
    size: number;
  };
  quantity: number;
  description?: string;
}

export interface UpdateOrderInput {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  status?: Order['status'];
  description?: string;
}

export interface OrderStats {
  ordersToday: number;
  ordersThisMonth: number;
  unfulfilledOrders: number;
  totalRevenue: number;
}

const COLLECTION_NAME = 'orders';

// Create a new order
export async function createOrder(orderData: CreateOrderInput): Promise<string> {
  try {
    const newOrder = {
      customerName: `${orderData.customerFirstName} ${orderData.customerLastName}`,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      items: [{
        itemId: orderData.item.id,
        itemName: orderData.item.name,
        quantity: orderData.quantity,
        price: orderData.item.price,
        size: orderData.item.size,
        subtotal: orderData.item.price * orderData.quantity
      }],
      totalAmount: orderData.item.price * orderData.quantity,
      status: 'pending' as const,
      description: orderData.description || '',
      orderDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newOrder);
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
        customerName: data.customerName || '',
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || '',
        customerAddress: data.customerAddress || '',
        items: data.items || [],
        totalAmount: data.totalAmount || 0,
        status: data.status || 'pending',
        description: data.description,
        orderDate: data.orderDate?.toDate() || new Date(),
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
        customerName: data.customerName || '',
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || '',
        customerAddress: data.customerAddress || '',
        items: data.items || [],
        totalAmount: data.totalAmount || 0,
        status: data.status || 'pending',
        description: data.description,
        orderDate: data.orderDate?.toDate() || new Date(),
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

// Get recent orders (excludes fulfilled orders older than 24 hours)
export async function getRecentOrders(limit: number = 12): Promise<Order[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    let count = 0;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    querySnapshot.forEach((doc) => {
      if (count < limit) {
        const data = doc.data();
        const order: Order = {
          id: doc.id,
          customerName: data.customerName || '',
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone || '',
          customerAddress: data.customerAddress || '',
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          status: data.status || 'pending',
          description: data.description,
          orderDate: data.orderDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };

        // Include all non-fulfilled orders, and fulfilled orders only if they were fulfilled within the last 24 hours
        if (order.status !== 'fulfilled' || (order.updatedAt && order.updatedAt >= twentyFourHoursAgo)) {
          orders.push(order);
          count++;
        }
      }
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting recent orders: ', error);
    return [];
  }
}

// Get all fulfilled orders
export async function getFulfilledOrders(): Promise<Order[]> {
  try {
    // Get all orders and filter fulfilled ones client-side to avoid index requirement
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only include fulfilled orders
      if (data.status === 'fulfilled') {
        orders.push({
          id: doc.id,
          customerName: data.customerName || '',
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone || '',
          customerAddress: data.customerAddress || '',
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          status: data.status || 'pending',
          description: data.description,
          orderDate: data.orderDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      }
    });
    
    // Sort by updatedAt (most recent fulfillment first)
    return orders.sort((a, b) => {
      const aTime = a.updatedAt?.getTime() || 0;
      const bTime = b.updatedAt?.getTime() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting fulfilled orders: ', error);
    return [];
  }
}

// Get today's fulfilled orders count
export async function getTodayFulfilledOrdersCount(): Promise<number> {
  try {
    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all orders and filter client-side to avoid index requirement
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    let count = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only count fulfilled orders updated (fulfilled) today
      if (data.status === 'fulfilled' && data.updatedAt) {
        const updatedDate = data.updatedAt.toDate();
        if (updatedDate >= today && updatedDate < tomorrow) {
          count++;
        }
      }
    });
    
    return count;
  } catch (error) {
    console.error('Error getting today fulfilled orders count: ', error);
    return 0;
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
        customerName: data.customerName || '',
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || '',
        customerAddress: data.customerAddress || '',
        items: data.items || [],
        totalAmount: data.totalAmount || 0,
        status: data.status || 'pending',
        description: data.description,
        orderDate: data.orderDate?.toDate() || new Date(),
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

// Get order statistics
export async function getOrderStats(): Promise<OrderStats> {
  try {
    const orders = await getAllOrders();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Orders today
    const ordersToday = orders.filter(order => 
      order.orderDate >= startOfToday
    ).length;

    // Orders this month
    const ordersThisMonth = orders.filter(order => 
      order.orderDate >= startOfMonth
    ).length;

    // Unfulfilled orders
    const unfulfilledOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length;

    // Total revenue this month
    const totalRevenue = orders
      .filter(order => order.orderDate >= startOfMonth)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      ordersToday,
      ordersThisMonth,
      unfulfilledOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100
    };
  } catch (error) {
    console.error('Error getting order stats: ', error);
    return {
      ordersToday: 0,
      ordersThisMonth: 0,
      unfulfilledOrders: 0,
      totalRevenue: 0
    };
  }
} 