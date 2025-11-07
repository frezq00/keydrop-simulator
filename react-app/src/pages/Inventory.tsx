import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export default function Inventory() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      loadInventory()
    }
  }, [user])

  const loadInventory = async () => {
    if (!user) return

    const { data } = await supabase
      .from('items')
      .select(`
        *,
        global_inv_item:global_inventory_items(*)
      `)
      .eq('owner_id', user.id)
      .eq('sold', false)
      .eq('upgraded', false)

    if (data) {
      setItems(data)
    }
    setLoading(false)
  }

  const sellItem = async (itemId: string) => {
    // Simplified sell - in production use API
    const item = items.find(i => i.drop_id === itemId)
    if (!item) return

    await supabase
      .from('items')
      .update({ sold: true })
      .eq('drop_id', itemId)

    await supabase
      .from('users')
      .update({
        balance: user!.balance + item.global_inv_item.skin_price
      })
      .eq('id', user!.id)

    loadInventory()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        Your Inventory
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.drop_id} className="bg-secondary rounded-lg p-4">
            <div className="mb-3">
              <div className="text-sm font-semibold text-white">
                {item.global_inv_item.weapon_name}
              </div>
              <div className="text-xs text-gray-400">
                {item.global_inv_item.skin_name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {item.global_inv_item.skin_quality}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-accent">
                ${item.global_inv_item.skin_price.toFixed(2)}
              </div>
              <button
                onClick={() => sellItem(item.drop_id)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
              >
                Sell
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              From: {item.origin}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          Your inventory is empty. Open some cases!
        </div>
      )}
    </div>
  )
}
