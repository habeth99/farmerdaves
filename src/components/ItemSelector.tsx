'use client';

import { useState, useEffect, useRef } from 'react';
import { Item } from '../../models/item';
import { getAllItems } from '../utils/itemService';

interface ItemSelectorProps {
  selectedItem: Item | null;
  onItemSelect: (item: Item | null) => void;
  placeholder?: string;
}

export default function ItemSelector({ selectedItem, onItemSelect, placeholder = "Search and select an item..." }: ItemSelectorProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    // Filter items based on search term
    if (!searchTerm.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.size.toString().includes(searchTerm) ||
        item.price.toString().includes(searchTerm)
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const inventoryItems = await getAllItems();
      // Only show items that are in stock
      const availableItems = inventoryItems.filter(item => item.quantity > 0);
      setItems(availableItems);
      setFilteredItems(availableItems);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: Item) => {
    onItemSelect(item);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    // Clear selection if input is cleared
    if (!value.trim() && selectedItem) {
      onItemSelect(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
        Select Item <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedItem ? selectedItem.name : searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
          required
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-[var(--color-box)] dark:text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Selected Item Display */}
      {selectedItem && (
        <div className="mt-2 p-3 bg-[var(--color-sage)]/10 dark:bg-[var(--color-sage)]/20 rounded-lg border border-[var(--color-sage)]/30 dark:border-[var(--color-sage)]/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                {selectedItem.name}
              </h3>
              <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                Size: {selectedItem.size} ft • Price: {formatPrice(selectedItem.price)} • Stock: {selectedItem.quantity}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onItemSelect(null)}
              className="text-red-500 hover:text-red-600 p-1"
              title="Remove selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">Loading items...</span>
            </div>
          )}
          
          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {!loading && !error && filteredItems.length === 0 && (
            <div className="p-4 text-center text-[var(--color-box)] dark:text-[var(--text-secondary)] text-sm">
              {searchTerm ? 'No items found matching your search.' : 'No items available in inventory.'}
            </div>
          )}
          
          {!loading && !error && filteredItems.length > 0 && (
            <div className="py-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--color-sage)]/10 dark:hover:bg-[var(--bg-accent)] focus:bg-[var(--color-sage)]/10 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                        {item.name}
                      </h3>
                      <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                        {item.size} ft • {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.quantity <= 5 
                          ? 'bg-red-400 text-stone-50 dark:bg-red-800 dark:text-stone-300' 
                          : item.quantity <= 10
                          ? 'bg-yellow-500 text-stone-50 dark:bg-yellow-800 dark:text-stone-300'
                          : 'bg-green-500 text-stone-50 dark:bg-green-800 dark:text-stone-300'
                      }`}>
                        {item.quantity} left
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 