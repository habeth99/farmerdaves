'use client';

import { useState, useEffect } from 'react';
import { getRecentOrders, getOrderById, updateOrder, Order } from '../utils/orderService';
import { getItemById, updateItem } from '../utils/itemService';

interface EditingOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  status: Order['status'];
  description?: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditingOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const startEditing = (order: Order) => {
    setEditingOrderId(order.id || '');
    setEditFormData({
      id: order.id || '',
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      status: order.status,
      description: order.description || ''
    });
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setEditFormData(null);
  };

  const handleInputChange = (field: keyof EditingOrder, value: string) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value
      });
    }
  };

  const saveOrder = async () => {
    if (!editFormData) return;

    setSaving(true);
    try {
      const originalOrder = orders.find(o => o.id === editFormData.id);
      const wasMarkedAsFulfilled = originalOrder?.status !== 'fulfilled' && editFormData.status === 'fulfilled';
      const wasMarkedAsCancelled = originalOrder?.status !== 'cancelled' && editFormData.status === 'cancelled';

      // Update order in the service
      await updateOrder({
        id: editFormData.id,
        customerName: editFormData.customerName,
        customerEmail: editFormData.customerEmail,
        customerPhone: editFormData.customerPhone,
        customerAddress: editFormData.customerAddress,
        status: editFormData.status,
        description: editFormData.description
      });
      
      // If order was marked as fulfilled, reduce inventory
      if (wasMarkedAsFulfilled && originalOrder) {
        try {
          for (const item of originalOrder.items) {
            const existingItem = await getItemById(item.itemId);
            if (existingItem) {
              const newStock = Math.max(0, existingItem.quantity - item.quantity);
              await updateItem({
                id: item.itemId,
                quantity: newStock
              });
            }
          }
          console.log('Inventory reduced for fulfilled order');
        } catch (error) {
          console.error('Error updating inventory for fulfilled order:', error);
        }
      }

      // If order was marked as cancelled, return items to inventory
      if (wasMarkedAsCancelled && originalOrder) {
        try {
          for (const item of originalOrder.items) {
            const existingItem = await getItemById(item.itemId);
            if (existingItem) {
              const newStock = existingItem.quantity + item.quantity;
              await updateItem({
                id: item.itemId,
                quantity: newStock
              });
            }
          }
          console.log('Inventory restored for cancelled order');
        } catch (error) {
          console.error('Error updating inventory for cancelled order:', error);
        }
      }

      // Refresh orders and notify other components
      await loadOrders();
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      
      setEditingOrderId(null);
      setEditFormData(null);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const recentOrders = await getRecentOrders(12);
      setOrders(recentOrders);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders when component mounts or when orders might have changed
  useEffect(() => {
    const handleOrdersUpdate = () => {
      loadOrders();
    };

    // Listen for storage changes (when orders are modified)
    window.addEventListener('storage', handleOrdersUpdate);
    
    // Also listen for a custom event we'll dispatch when orders change
    window.addEventListener('ordersUpdated', handleOrdersUpdate);

    return () => {
      window.removeEventListener('storage', handleOrdersUpdate);
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
    };
  }, []);

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Pending' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', text: 'Processing' };
      case 'fulfilled':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Fulfilled' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', text: 'Unknown' };
    }
  };

  const formatDateForSearch = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/'); // Keep slashes for date search
  };

  const searchInOrder = (order: Order, searchTerm: string): boolean => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Search in customer name
    if (order.customerName.toLowerCase().includes(term)) return true;
    
    // Search in customer email
    if (order.customerEmail.toLowerCase().includes(term)) return true;
    
    // Search in customer phone (remove formatting for search)
    const phoneNumbers = order.customerPhone.replace(/[\s\-\(\)\.]/g, '');
    const searchPhone = term.replace(/[\s\-\(\)\.]/g, '');
    if (phoneNumbers.includes(searchPhone)) return true;
    
    // Search in items (item names)
    const hasMatchingItem = order.items.some(item => 
      item.itemName.toLowerCase().includes(term)
    );
    if (hasMatchingItem) return true;
    
    // Search in order date (multiple formats)
    const orderDateStr = formatDateForSearch(order.orderDate);
    const createdDateStr = order.createdAt ? formatDateForSearch(order.createdAt) : '';
    const updatedDateStr = order.updatedAt ? formatDateForSearch(order.updatedAt) : '';
    
    if (orderDateStr.includes(term) || 
        createdDateStr.includes(term) || 
        updatedDateStr.includes(term)) return true;
    
    // Search in formatted dates (readable format)
    const readableOrderDate = order.orderDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toLowerCase();
    if (readableOrderDate.includes(term)) return true;
    
    // Search in order ID
    if (order.id?.toLowerCase().includes(term)) return true;
    
    // Search in description
    if (order.description?.toLowerCase().includes(term)) return true;
    
    return false;
  };

  const filteredOrders = orders.filter(order => searchInOrder(order, searchTerm));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
        <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-6">
          Recent Orders
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-[var(--color-sage)]/20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-sage)]/30 dark:border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              Recent Orders
            </h2>
            <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-1">
              Latest customer orders and their status
            </p>
          </div>
          
          <div className="flex-shrink-0 w-full sm:w-80">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-box)] dark:text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by customer, item, phone, email, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-box)] dark:text-[var(--text-secondary)] hover:text-[var(--color-borneo)] dark:hover:text-[var(--text-primary)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-3 text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
            {filteredOrders.length === 0 ? (
              <span className="text-red-600 dark:text-red-400">No orders found matching "{searchTerm}"</span>
            ) : (
              <span>Showing {filteredOrders.length} of {orders.length} orders</span>
            )}
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {searchTerm && filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-box)]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-box)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
              No Matching Orders
            </h3>
            <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-4">
              No orders found matching "{searchTerm}". Try searching for:
            </p>
            <div className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] space-y-1">
              <p>• Customer name (e.g., "John Smith")</p>
              <p>• Email address (e.g., "john@email.com")</p>
              <p>• Phone number (e.g., "555-1234")</p>
              <p>• Item name (e.g., "Bigfoot Statue")</p>
              <p>• Date (e.g., "12/25/2023" or "Dec 25")</p>
              <p>• Order ID</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-sage)]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
              No Orders Yet
            </h3>
            <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">
              Orders will appear here once customers start placing them.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-sage)]/30 dark:divide-[var(--border-color)]">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const isEditing = editingOrderId === order.id;
              
              return (
                <div key={order.id} className="p-6 hover:bg-[var(--color-sage)]/5 dark:hover:bg-[var(--bg-accent)] transition-colors">
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                          Edit Order #{order.id?.slice(-8) || 'New'}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={saveOrder}
                            disabled={saving}
                            className="bg-[var(--color-sage)] hover:bg-[var(--color-pine)] text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-1">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            value={editFormData?.customerName || ''}
                            onChange={(e) => handleInputChange('customerName', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editFormData?.customerEmail || ''}
                            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={editFormData?.customerPhone || ''}
                            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-1">
                            Status
                          </label>
                          <select
                            value={editFormData?.status || 'pending'}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={editFormData?.customerAddress || ''}
                          onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-1">
                          Description
                        </label>
                        <textarea
                          value={editFormData?.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] text-sm"
                        />
                      </div>

                      <div className="bg-[var(--color-sage)]/10 dark:bg-[var(--color-sage)]/20 p-3 rounded-lg">
                        <h4 className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">Order Items</h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">
                              {item.quantity}x {item.itemName} ({item.size} ft) - ${item.subtotal.toFixed(2)}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-[var(--color-sage)]/30">
                          <div className="text-lg font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                            Total: ${order.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                            {order.customerName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.text}
                          </span>
                          <button
                            onClick={() => startEditing(order)}
                            className="ml-2 p-1 hover:bg-[var(--color-sage)]/20 rounded transition-colors"
                            title="Edit order"
                          >
                            <svg className="w-4 h-4 text-[var(--color-pine)] dark:text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        
                        <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-1">
                          {order.customerEmail} • {order.customerPhone}
                        </p>
                        
                        <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-3">
                          {order.customerAddress} • {formatDate(order.orderDate)}
                        </p>
                        
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">
                              {item.quantity}x {item.itemName} ({item.size} ft) - ${item.subtotal.toFixed(2)}
                            </div>
                          ))}
                        </div>

                        {order.description && (
                          <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-2 italic">
                            "{order.description}"
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-1">
                          Order #{order.id?.slice(-8) || 'New'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {filteredOrders.length > 0 && (
        <div className="px-6 py-4 border-t border-[var(--color-sage)]/30 dark:border-[var(--border-color)] bg-[var(--color-sage)]/5 dark:bg-[var(--bg-accent)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">
              {searchTerm ? (
                <>Showing {filteredOrders.length} of {orders.length} matching orders</>
              ) : (
                <>Showing {orders.length} recent orders</>
              )}
            </span>
            <button className="text-[var(--color-borneo)] hover:text-[var(--color-pine)] font-medium transition-colors">
              View All Orders →
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 