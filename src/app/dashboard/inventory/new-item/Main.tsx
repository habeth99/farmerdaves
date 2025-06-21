'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createItem } from '../../../../utils/itemService';

export default function NewItemMain() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert form data to proper types for the database
      const itemData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        size: parseInt(formData.size)
      };

      // Validate the data
      if (!itemData.name || isNaN(itemData.price) || isNaN(itemData.size)) {
        throw new Error('Please fill in all fields with valid values');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-8">Add New Item</h1>
        
        <form onSubmit={handleSubmit} className="bg-[var(--color-brown)] p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-olive)] mb-1">
                Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--color-tan)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brown)] focus:border-transparent bg-[var(--background-alt)] text-[var(--color-olive)]"
                required
              />
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-[var(--color-olive)] mb-1">
                Size
              </label>
              <input
                type="number"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--color-tan)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brown)] focus:border-transparent bg-[var(--background-alt)] text-[var(--color-olive)]"
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-[var(--color-olive)] mb-1">
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--color-tan)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brown)] focus:border-transparent bg-[var(--background-alt)] text-[var(--color-olive)]"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/inventory')}
              className="px-4 py-2 text-[var(--color-olive)] border border-[var(--color-olive)] rounded-md hover:bg-[var(--background-alt)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--color-borneo)] text-[var(--color-stone)] rounded-md hover:bg-[var(--color-pine)] border-2 border-[var(--color-pine)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}