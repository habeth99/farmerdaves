export default function Inventory() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-8">Inventory</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-green-800 mb-3">Fresh Vegetables</h3>
            <ul className="text-green-600 space-y-2">
              <li>• Tomatoes - 50 lbs</li>
              <li>• Carrots - 30 lbs</li>
              <li>• Lettuce - 20 heads</li>
              <li>• Potatoes - 100 lbs</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-green-800 mb-3">Farm Equipment</h3>
            <ul className="text-green-600 space-y-2">
              <li>• Tractors - 3 available</li>
              <li>• Plows - 5 units</li>
              <li>• Irrigation systems - 2 sets</li>
              <li>• Harvesting tools - 15 pieces</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-green-800 mb-3">Bigfoot Statues</h3>
            <ul className="text-green-600 space-y-2">
              <li>• Small statues - 25 available</li>
              <li>• Medium statues - 15 available</li>
              <li>• Large statues - 8 available</li>
              <li>• Premium statues - 3 available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 