export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--color-borneo)] mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--color-stone)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[var(--color-borneo)] mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <p className="text-[var(--color-box)]">Total Sales: $12,450</p>
              <p className="text-[var(--color-box)]">Orders Today: 23</p>
              <p className="text-[var(--color-box)]">Bigfoot Statues Sold: 8</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-stone)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[var(--color-borneo)] mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <p className="text-[var(--color-box)]">• New order received</p>
              <p className="text-[var(--color-box)]">• Inventory updated</p>
              <p className="text-[var(--color-box)]">• Customer review posted</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-stone)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[var(--color-borneo)] mb-3">Today's Tasks</h3>
            <div className="space-y-2">
              <p className="text-[var(--color-box)]">• Harvest tomatoes</p>
              <p className="text-[var(--color-box)]">• Ship bigfoot statues</p>
              <p className="text-[var(--color-box)]">• Update inventory</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--color-stone)] p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-[var(--color-borneo)] mb-4">Welcome to Farmer Dave's Dashboard!</h2>
          <p className="text-[var(--color-box)] mb-4">
            You're now signed in and can access all the features of your farm management system.
            Use the side menu to navigate between different sections.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-sage)] p-4 rounded-lg">
              <h4 className="font-semibold text-[var(--color-borneo)] mb-2">Inventory Management</h4>
              <p className="text-[var(--color-box)] text-sm">Track your farm's produce, equipment, and bigfoot statue collection.</p>
            </div>
            <div className="bg-[var(--color-sage)] p-4 rounded-lg">
              <h4 className="font-semibold text-[var(--color-borneo)] mb-2">Profile Settings</h4>
              <p className="text-[var(--color-box)] text-sm">Manage your account information and farm details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 