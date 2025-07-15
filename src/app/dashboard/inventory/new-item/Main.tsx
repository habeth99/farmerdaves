'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createItem } from '../../../../utils/itemService';
import { CreateItemInput } from '../../../../../models/item';

export default function NewItemMain() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    price: '',
    quantity: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert form data to proper types for the database
      const name = formData.name.trim();
      const price = parseFloat(formData.price);
      const size = parseInt(formData.size);
      const quantity = parseInt(formData.quantity);
      const description = formData.description.trim();

      // Validate the data first
      if (!name || isNaN(price) || isNaN(size) || isNaN(quantity)) {
        throw new Error('Please fill in all required fields with valid values');
      }

      if (quantity < 0 || price < 0 || size < 0) {
        throw new Error('Values cannot be negative');
      }

      // Build item data object with only defined values
      const itemData: CreateItemInput = {
        name,
        price,
        size,
        quantity
      };

      // Only include optional fields if they have values
      if (description) {
        itemData.description = description;
      }

      // Create the item in the database
      const itemId = await createItem(itemData);
      console.log('Item created successfully with ID:', itemId);
      
      // Redirect back to inventory page
      router.push('/dashboard/inventory');
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
              href="/dashboard/inventory"
              className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] transition-colors"
            >
              Inventory
            </Link>
            <svg className="w-4 h-4 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--color-borneo)] font-medium">Add New Item</span>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[var(--color-borneo)] bg-opacity-10 mr-4">
              <svg className="w-6 h-6 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-borneo)] mb-2">Add New Item</h1>
              <p className="text-[var(--color-pine)]">Create a new inventory item with all the necessary details</p>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}
            
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--color-borneo)] mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)] rounded-lg focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors"
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-[var(--color-borneo)] mb-2">
                    Size (ft) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)] rounded-lg focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors"
                    placeholder="Enter size in feet"
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-[var(--color-borneo)] mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)] rounded-lg focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors"
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-[var(--color-borneo)] mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--color-sage)] rounded-lg focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors"
                    placeholder="Enter quantity"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </h3>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--color-borneo)] mb-2">
                  Item Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--color-sage)] rounded-lg focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors resize-vertical"
                  placeholder="Enter a detailed description of the item (optional)"
                />
                <p className="mt-2 text-sm text-[var(--color-pine)]">
                  Provide additional details about the item, its condition, features, or any other relevant information.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--color-sage)] border-opacity-30">
              <Link
                href="/dashboard/inventory"
                className="flex-1 inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[var(--color-borneo)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-2 border-[var(--color-borneo)]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Item...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Item
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