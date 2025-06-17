'use client';
import { useRouter } from 'next/navigation';

export default function Inventory() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)]">Inventory</h1>
          <button
            onClick={() => router.push('/dashboard/inventory/new-item')}
            className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border-2 border-[var(--color-pine)]"
          >
            + New Item
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hardcoded inventory cards - to be made dynamic later */}
          <div className="bg-[var(--color-brown)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[var(--color-olive)] mb-3">Fresh Vegetables</h3>
            <ul className="text-[var(--color-olive)] space-y-2">
              <li>• Tomatoes - 50 lbs</li>
              <li>• Carrots - 30 lbs</li>
              <li>• Lettuce - 20 heads</li>
              <li>• Potatoes - 100 lbs</li>
            </ul>
          </div>
          
          <div className="bg-[var(--color-brown)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[var(--color-olive)] mb-3">Farm Equipment</h3>
            <ul className="text-[var(--color-olive)] space-y-2">
              <li>• Tractors - 3 available</li>
              <li>• Plows - 5 units</li>
              <li>• Irrigation systems - 2 sets</li>
              <li>• Harvesting tools - 15 pieces</li>
            </ul>
          </div>
          
          <div className="bg-[var(--color-brown)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[var(--color-olive)] mb-3">Bigfoot Statues</h3>
            <ul className="text-[var(--color-olive)] space-y-2">
              <li>• Small statues - 25 available</li>
              <li>• Medium statues - 15 available</li>
              <li>• Large statues - 8 available</li>
              <li>• Premium statues - 3 available</li>
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="bg-[var(--color-brown)] p-6 rounded-lg shadow-md flex flex-col items-center">
              <img
                src="https://via.placeholder.com/150"
                alt="Example Item"
                className="w-full h-32 object-cover rounded-md mb-4"
              />
              <div className="text-xl font-semibold text-[var(--color-olive)] mb-1">Example Item</div>
              <div className="text-[var(--color-olive)] mb-1">5ft</div>
              <div className="text-[var(--color-olive)] font-bold">$200</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 