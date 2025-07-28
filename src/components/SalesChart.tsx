'use client';

import { useState, useEffect } from 'react';
import { getTodayFulfilledOrdersCount } from '../utils/orderService';

interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

// Mock sales data - in a real app this would come from your database
const generateMockSalesData = (): SalesData[] => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return months.map((month, index) => {
    const isCurrentOrPast = index <= currentMonth;
    const baseAmount = isCurrentOrPast ? Math.random() * 15000 + 5000 : 0;
    
    return {
      month,
      sales: Math.round(baseAmount),
      orders: Math.round(baseAmount / 45) // Average order value around $45
    };
  });
};

export default function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [selectedView, setSelectedView] = useState<'sales' | 'orders'>('sales');
  const [todayFulfilledCount, setTodayFulfilledCount] = useState<number>(0);

  useEffect(() => {
    setSalesData(generateMockSalesData());
    
    // Load today's fulfilled orders count
    const loadTodayFulfilled = async () => {
      try {
        const count = await getTodayFulfilledOrdersCount();
        setTodayFulfilledCount(count);
      } catch (error) {
        console.error('Error loading today fulfilled orders:', error);
      }
    };
    
    loadTodayFulfilled();

    // Listen for order updates to refresh the count
    const handleOrdersUpdated = () => {
      loadTodayFulfilled();
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdated);
    return () => window.removeEventListener('ordersUpdated', handleOrdersUpdated);
  }, []);

  const maxValue = Math.max(...salesData.map(d => selectedView === 'sales' ? d.sales : d.orders));
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  
  // Format today's date
  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-1">
            Monthly Sales Overview
          </h2>
          <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
            {new Date().getFullYear()} performance metrics
          </p>
        </div>
        
        <div className="flex bg-[var(--color-sage)]/10 rounded-lg p-1">
          <button
            onClick={() => setSelectedView('sales')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedView === 'sales'
                ? 'bg-[var(--color-borneo)] text-white'
                : 'text-[var(--color-box)] dark:text-[var(--text-secondary)] hover:text-[var(--color-borneo)]'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSelectedView('orders')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedView === 'orders'
                ? 'bg-[var(--color-borneo)] text-white'
                : 'text-[var(--color-box)] dark:text-[var(--text-secondary)] hover:text-[var(--color-borneo)]'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-[var(--color-sage)]/5 rounded-lg">
          <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
            {todayFulfilledCount}
          </p>
          <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
            Fulfilled Orders
          </p>
          <p className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-1">
            {todayDate}
          </p>
        </div>
        <div className="text-center p-4 bg-[var(--color-sage)]/5 rounded-lg">
          <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
            {totalOrders.toLocaleString()}
          </p>
          <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">Total Orders</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="flex items-end justify-between h-64 px-2">
          {salesData.map((data, index) => {
            const value = selectedView === 'sales' ? data.sales : data.orders;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const isCurrentMonth = index === new Date().getMonth();
            
            return (
              <div key={data.month} className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full max-w-8 mx-1 relative"
                  style={{ height: '200px' }}
                >
                  <div 
                    className={`w-full rounded-t transition-all duration-500 ease-out relative ${
                      isCurrentMonth
                        ? 'bg-[var(--color-borneo)] dark:bg-[var(--color-borneo)]'
                        : 'bg-[var(--color-sage)] dark:bg-[var(--color-sage)] group-hover:bg-[var(--color-pine)]'
                    }`}
                    style={{ 
                      height: `${height}%`,
                      position: 'absolute',
                      bottom: 0
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[var(--color-borneo)] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {selectedView === 'sales' 
                        ? `$${value.toLocaleString()}`
                        : `${value} orders`
                      }
                    </div>
                  </div>
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  isCurrentMonth 
                    ? 'text-[var(--color-borneo)] dark:text-[var(--text-primary)]' 
                    : 'text-[var(--color-box)] dark:text-[var(--text-secondary)]'
                }`}>
                  {data.month}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)]">
          <span>{selectedView === 'sales' ? `$${Math.round(maxValue).toLocaleString()}` : Math.round(maxValue)}</span>
          <span>{selectedView === 'sales' ? `$${Math.round(maxValue * 0.5).toLocaleString()}` : Math.round(maxValue * 0.5)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)]">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-[var(--color-sage)] rounded mr-2"></div>
          <span>Previous months</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[var(--color-borneo)] rounded mr-2"></div>
          <span>Current month</span>
        </div>
      </div>
    </div>
  );
} 