import Link from 'next/link';
import { getAllItemsServerSide } from '../../../utils/itemService-server';
import { Item } from '../../../../models/item';

// This is a server component that fetches data from Firestore
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
          /* Horizontal Item Cards from Database */
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-[var(--color-sage)] p-6 rounded-lg shadow-2xl flex items-center gap-6">
                {/* Image on the far left */}
                <img
                  src={item.image || '/bigfootimage.jpg'}
                  alt={item.name}
                  className="w-24 h-24 object-contain rounded-md bg-white flex-shrink-0"
                />
                
                {/* Name */}
                <div className="text-xl font-semibold text-[var(--color-borneo)] min-w-0 flex-1">
                  {item.name}
                </div>
                
                {/* Height */}
                <div className="text-lg text-[var(--color-pine)] font-medium">
                  {item.size}ft
                </div>
                
                {/* Price */}
                <div className="text-lg text-[var(--color-pine)] font-bold">
                  ${item.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 