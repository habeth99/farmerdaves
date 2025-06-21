import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllItemsServerSide } from '../../../utils/itemService-server';
import { Item } from '../../../../models/item';

// This is now a server component that fetches data at build/request time
export default async function Inventory() {
  let items: Item[] = [];
  
  try {
    items = await getAllItemsServerSide();
  } catch (error) {
    console.error('Failed to fetch items:', error);
    // In production, you might want to show an error page or fallback UI
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)]">Inventory</h1>
          <Link 
            href="/dashboard/inventory/new-item"
            className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border-2 border-[var(--color-pine)]"
          >
            + New Item
          </Link>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-[var(--color-pine)] mb-4">No items in inventory yet</p>
            <Link 
              href="/dashboard/inventory/new-item"
              className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-2 px-6 rounded-lg transition-colors duration-200 border-2 border-[var(--color-pine)]"
            >
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {items.map((item) => (
              <div key={item.id} className="bg-[var(--color-sage)] p-6 rounded-lg shadow-2xl flex flex-col items-center">
                <img
                  src={item.image || '/bigfootimage.jpg'} // Fallback to bigfoot image if no image provided
                  alt={item.name}
                  className="w-full aspect-square object-contain rounded-md mb-4 bg-white"
                />
                <div className="text-lg font-semibold text-[var(--color-borneo)] mb-1">{item.name}</div>
                <div className="text-[var(--color-pine)] mb-1">{item.size}ft</div>
                <div className="text-[var(--color-pine)] font-bold">${item.price}</div>
                {item.createdAt && (
                  <div className="text-sm text-[var(--color-pine)] mt-2 opacity-75">
                    Added: {item.createdAt.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 