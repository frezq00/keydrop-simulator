export default function Upgrader() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        Item Upgrader
      </h1>

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Your Items */}
          <div className="bg-secondary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Items</h2>
            <div className="space-y-4">
              <div className="text-center text-gray-400 py-8">
                No items in inventory
              </div>
            </div>
          </div>

          {/* Target Item */}
          <div className="bg-secondary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Target Item</h2>
            <div className="text-center text-gray-400 py-8">
              Select an item to upgrade to
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <div className="mt-8 text-center">
          <button
            disabled
            className="px-12 py-4 bg-gray-600 text-white rounded-lg font-bold text-lg cursor-not-allowed"
          >
            Select Items to Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}
