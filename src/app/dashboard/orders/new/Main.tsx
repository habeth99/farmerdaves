'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getSignInContext } from '../../../../utils/authService';
import { Item } from '../../../../../models/item';
import ItemSelector from '../../../../components/ItemSelector';
import { createOrder } from '../../../../utils/orderService';

interface OrderFormData {
  selectedItem: Item | null;
  quantity: number;
  customerType: 'regular' | 'in-store-guest';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

export default function NewOrderMain() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    selectedItem: null,
    quantity: 1,
    customerType: 'regular',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }

        const context = getSignInContext();
        if (context !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, value)
    }));
  };

  const handleItemSelect = (item: Item | null) => {
    setFormData(prev => ({
      ...prev,
      selectedItem: item,
      quantity: 1 // Reset quantity when item changes
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.selectedItem) {
      return 'Please select an item from inventory';
    }
    if (formData.quantity < 1) {
      return 'Quantity must be at least 1';
    }
    if (formData.selectedItem && formData.quantity > formData.selectedItem.quantity) {
      return `Only ${formData.selectedItem.quantity} items available in stock`;
    }
    if (!formData.firstName.trim()) {
      return 'First name is required';
    }
    if (!formData.lastName.trim()) {
      return 'Last name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      return 'Phone number is required';
    }
    if (!formData.address.trim()) {
      return 'Address is required';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the order using the order service
      const orderId = await createOrder({
        customerFirstName: formData.firstName.trim() || (formData.customerType === 'in-store-guest' ? 'In Store' : 'Customer'),
        customerLastName: formData.lastName.trim() || (formData.customerType === 'in-store-guest' ? 'Guest' : ''),
        customerEmail: formData.email.trim() || (formData.customerType === 'in-store-guest' ? 'guest@store.local' : 'no-email@provided.com'),
        customerPhone: formData.phone.trim() || (formData.customerType === 'in-store-guest' ? 'N/A' : 'N/A'),
        customerAddress: formData.address.trim() || (formData.customerType === 'in-store-guest' ? 'In Store Purchase' : 'No Address Provided'),
        item: {
          id: formData.selectedItem!.id!,
          name: formData.selectedItem!.name,
          price: formData.selectedItem!.price,
          size: formData.selectedItem!.size
        },
        quantity: formData.quantity,
        description: formData.description || undefined
      });

      console.log('Order created successfully with ID:', orderId);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('ordersUpdated'));

      const total = formData.selectedItem!.price * formData.quantity;
      setSuccessMessage(`Order created successfully! Total: $${total.toFixed(2)}`);
      
      // Reset form
      setFormData({
        selectedItem: null,
        quantity: 1,
        customerType: 'regular',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        description: ''
      });

      // Redirect after success
      setTimeout(() => {
        router.push('/dashboard/orders');
      }, 2000);

    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    if (formData.selectedItem && formData.quantity > 0) {
      return formData.selectedItem.price * formData.quantity;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-4 pr-4 pb-4 pl-3 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-4 md:pt-8 md:pr-8 md:pb-8 md:pl-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link 
              href="/dashboard"
              className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] transition-colors"
            >
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link 
              href="/dashboard/orders"
              className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] transition-colors"
            >
              Orders
            </Link>
            <svg className="w-4 h-4 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--color-borneo)] font-medium">Create New Order</span>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6 mb-8">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[var(--color-borneo)] bg-opacity-10 mr-4">
              <svg className="w-6 h-6 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">Create New Order</h1>
              <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Add a new customer order to the system</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-[var(--color-sage)]/10 dark:bg-[var(--color-sage)]/20 border border-[var(--color-sage)]/30 dark:border-[var(--color-sage)]/40 text-[var(--color-sage)] rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Item Selection */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Item Selection
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <ItemSelector
                    selectedItem={formData.selectedItem}
                    onItemSelect={handleItemSelect}
                    placeholder="Search for items in inventory..."
                  />
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={formData.selectedItem?.quantity || 999}
                    className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
                    required
                  />
                  {formData.selectedItem && (
                    <p className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-1">
                      Max: {formData.selectedItem.quantity} available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Type */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Customer Type
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                  Customer Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    customerType: e.target.value as 'regular' | 'in-store-guest'
                  }))}
                  className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent"
                >
                  <option value="regular">Regular Customer</option>
                  <option value="in-store-guest">In Store Guest</option>
                </select>
                <p className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-1">
                  {formData.customerType === 'in-store-guest' 
                    ? 'For walk-in customers - customer details below are optional' 
                    : 'For customers with delivery or contact requirements - all fields required'
                  }
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h3>
              
              {formData.customerType === 'in-store-guest' && (
                <div className="bg-[var(--color-sage)]/10 dark:bg-[var(--color-sage)]/20 border border-[var(--color-sage)]/30 dark:border-[var(--color-sage)]/40 p-4 rounded-lg mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[var(--color-sage)] dark:text-[var(--color-sage)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-[var(--color-pine)] dark:text-[var(--color-sage)]">In Store Guest Order</h4>
                      <p className="text-xs text-[var(--color-pine)] dark:text-[var(--color-sage)] mt-1">
                        Customer details below are optional for in-store purchases.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    First Name {formData.customerType === 'regular' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
                    placeholder={formData.customerType === 'in-store-guest' ? 'Enter first name (optional)' : 'Enter first name'}
                    required={formData.customerType === 'regular'}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    Last Name {formData.customerType === 'regular' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
                    placeholder={formData.customerType === 'in-store-guest' ? 'Enter last name (optional)' : 'Enter last name'}
                    required={formData.customerType === 'regular'}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    Email {formData.customerType === 'regular' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
                    placeholder={formData.customerType === 'in-store-guest' ? 'Enter email address (optional)' : 'Enter email address'}
                    required={formData.customerType === 'regular'}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    Phone Number {formData.customerType === 'regular' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
                    placeholder={formData.customerType === 'in-store-guest' ? 'Enter phone number (optional)' : 'Enter phone number'}
                    required={formData.customerType === 'regular'}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="address" className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                  Address {formData.customerType === 'regular' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors resize-vertical"
                  placeholder={formData.customerType === 'in-store-guest' ? 'Enter full address (optional)' : 'Enter full address including street, city, state, and zip code'}
                  required={formData.customerType === 'regular'}
                />
              </div>
            </div>

            {/* Order Description */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Order Notes
              </h3>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors resize-vertical"
                  placeholder="Add any special notes, delivery instructions, or other details about this order..."
                />
              </div>
            </div>

            {/* Order Summary */}
            {formData.selectedItem && (
              <div className="bg-[var(--color-sage)]/5 dark:bg-[var(--color-sage)]/10 rounded-lg p-6 border border-[var(--color-sage)]/20 dark:border-[var(--color-sage)]/30">
                <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Item:</span>
                    <span className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">{formData.selectedItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Quantity:</span>
                    <span className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Unit Price:</span>
                    <span className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">${formData.selectedItem.price.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[var(--color-sage)]/30 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">Total:</span>
                      <span className="text-lg font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--color-sage)]/20 dark:border-[var(--border-color)]">
              <Link
                href="/dashboard/orders"
                className="flex-1 inline-flex items-center justify-center bg-[var(--color-sage)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !formData.selectedItem}
                className="flex-1 inline-flex items-center justify-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 