'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewItem() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    price: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    // For now, we'll just log the data and redirect back
    console.log('Form submitted:', formData);
    router.push('/dashboard/inventory');
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
                type="text"
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
              className="px-4 py-2 bg-[var(--color-borneo)] text-[var(--color-stone)] rounded-md hover:bg-[var(--color-pine)] border-2 border-[var(--color-pine)]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 