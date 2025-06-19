'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Inventory() {
  const router = useRouter();

  const cards = [
    {
      image: '/bigfootimage.jpg',
      name: 'Bigfoot Statue',
      height: '4ft',
      price: '$350'
    },
    {
      image: 'URL_TO_IMAGE_2',
      name: 'Gnome Statue',
      height: '1ft',
      price: '$70'
    },
    {
      image: 'URL_TO_IMAGE_3',
      name: 'Dragon Statue',
      height: '3ft',
      price: '$150'
    },
  
    // ...more cards
  ];

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-[var(--color-sage)] p-6 rounded-lg shadow-2xl flex flex-col items-center">
              <img
                src={card.image}
                alt={card.name}
                className="w-full aspect-square object-contain rounded-md mb-4 bg-white"
              />
              <div className="text-lg font-semibold text-[var(--color-borneo)] mb-1">{card.name}</div>
              <div className="text-[var(--color-pine)] mb-1">{card.height}</div>
              <div className="text-[var(--color-pine)] font-bold">{card.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 