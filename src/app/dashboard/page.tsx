export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
            <h3 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">Total Sales: $12,450</p>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">Orders Today: 23</p>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">Bigfoot Statues Sold: 8</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
            <h3 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">• New order received</p>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Inventory updated</p>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Customer review posted</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
            <h3 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3">Today's Tasks</h3>
            <div className="space-y-2">
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Harvest tomatoes</p>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Ship bigfoot statues</p>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Update inventory</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">Welcome to Farmer Dave's Dashboard!</h2>
          <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-4">
            You're now signed in and can access all the features of your farm management system.
            Use the side menu to navigate between different sections.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-sage)] dark:bg-[var(--bg-accent)] p-4 rounded-lg dark:border dark:border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">Inventory Management</h4>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] text-sm">Track your farm's produce, equipment, and bigfoot statue collection.</p>
            </div>
            <div className="bg-[var(--color-sage)] dark:bg-[var(--bg-accent)] p-4 rounded-lg dark:border dark:border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">Profile Settings</h4>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] text-sm">Manage your account information and farm details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 