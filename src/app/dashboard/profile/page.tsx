export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-8">Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-8">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6">
              FD
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">Farmer Dave</h2>
              <p className="text-green-600">Professional Farmer & Bigfoot Enthusiast</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-700">Name</label>
                  <p className="text-green-800">Farmer Dave</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Email</label>
                  <p className="text-green-800">farmerdave@example.com</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Location</label>
                  <p className="text-green-800">Rural Farmland, USA</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Years Farming</label>
                  <p className="text-green-800">25+ years</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Farm Statistics</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-700">Farm Size</label>
                  <p className="text-green-800">500 acres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Crops Grown</label>
                  <p className="text-green-800">Corn, Soybeans, Vegetables</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Bigfoot Statues Collected</label>
                  <p className="text-green-800">47 (and counting!)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Customer Rating</label>
                  <p className="text-green-800">⭐⭐⭐⭐⭐ (5.0/5.0)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 