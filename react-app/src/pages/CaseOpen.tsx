import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Case, type CaseDrop } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export default function CaseOpen() {
  const { caseName } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [drops, setDrops] = useState<CaseDrop[]>([])
  const [rouletteItems, setRouletteItems] = useState<CaseDrop[]>([])
  const [opening, setOpening] = useState(false)
  const [wonItem, setWonItem] = useState<CaseDrop | null>(null)
  const [showResult, setShowResult] = useState(false)
  const rouletteRef = useRef<HTMLDivElement>(null)
  const { user, checkSession } = useAuthStore()

  useEffect(() => {
    if (caseName) {
      loadCase()
    }
  }, [caseName])

  const loadCase = async () => {
    const { data: caseInfo } = await supabase
      .from('cases')
      .select('*')
      .eq('url_name', caseName)
      .maybeSingle()

    if (!caseInfo) {
      navigate('/')
      return
    }

    const { data: caseDrops } = await supabase
      .from('case_drops')
      .select('*')
      .eq('parent_case', caseInfo.website_name)
      .order('skin_price', { ascending: false })

    setCaseData(caseInfo)
    setDrops(caseDrops || [])
  }

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      'covert': 'from-red-600 to-red-400',
      'classified': 'from-pink-600 to-pink-400',
      'restricted': 'from-purple-600 to-purple-400',
      'mil-spec': 'from-blue-600 to-blue-400',
      'industrial': 'from-sky-600 to-sky-400',
      'consumer': 'from-gray-600 to-gray-400'
    }
    return colors[rarity] || 'from-gray-600 to-gray-400'
  }

  const selectWinningItem = () => {
    const random = Math.floor(Math.random() * 100000)

    for (const drop of drops) {
      if (drop.odds_range && drop.odds_range[0] <= random && drop.odds_range[1] >= random) {
        return drop
      }
    }

    return drops[drops.length - 1]
  }

  const openCase = async () => {
    if (!caseData || !user || opening || drops.length === 0) return

    if (user.balance < caseData.price) {
      alert('Not enough balance!')
      return
    }

    setOpening(true)
    setShowResult(false)
    setWonItem(null)

    // Update balance
    await supabase
      .from('users')
      .update({ balance: user.balance - caseData.price })
      .eq('id', user.id)

    // Generate roulette items
    const items: CaseDrop[] = []
    for (let i = 0; i < 60; i++) {
      const randomDrop = drops[Math.floor(Math.random() * drops.length)]
      items.push(randomDrop)
    }

    // Place winning item at position 55
    const winner = selectWinningItem()
    items[55] = winner

    setRouletteItems(items)

    // Start animation after a brief delay
    setTimeout(() => {
      if (rouletteRef.current) {
        const itemWidth = 180
        const winningPosition = 55
        const offset = winningPosition * itemWidth - (window.innerWidth / 2) + (itemWidth / 2)

        rouletteRef.current.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)'
        rouletteRef.current.style.transform = `translateX(-${offset}px)`
      }

      // Show result after animation
      setTimeout(async () => {
        setWonItem(winner)
        setOpening(false)
        setShowResult(true)

        // Add item to inventory
        const itemId = crypto.randomUUID()
        await supabase.from('items').insert({
          drop_id: itemId,
          owner_id: user.id,
          global_inv_id: winner.global_inv_id,
          origin: caseData.website_name,
          drop_date: new Date().toISOString(),
          sold: false,
          upgraded: false
        })

        // Refresh user data
        await checkSession()
      }, 5000)
    }, 100)
  }

  const resetRoulette = () => {
    if (rouletteRef.current) {
      rouletteRef.current.style.transition = 'none'
      rouletteRef.current.style.transform = 'translateX(0)'
    }
    setShowResult(false)
    setWonItem(null)
    setRouletteItems([])
  }

  const sellItem = async () => {
    if (!wonItem || !user) return

    const newBalance = user.balance + wonItem.skin_price
    await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', user.id)

    await checkSession()
    resetRoulette()
  }

  if (!caseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Case Info */}
        <div className="bg-secondary rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg flex items-center justify-center p-4">
                <img
                  src={caseData.img_name}
                  alt={caseData.website_name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {caseData.website_name}
                </h1>
                <div className="text-2xl font-bold text-accent">
                  ${caseData.price.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={opening ? undefined : (showResult ? resetRoulette : openCase)}
              disabled={opening}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition ${
                opening
                  ? 'bg-gray-600 cursor-not-allowed'
                  : showResult
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-accent hover:bg-red-600'
              }`}
            >
              {opening ? 'Opening...' : showResult ? 'Open Another' : 'Open Case'}
            </button>
          </div>
        </div>

        {/* Roulette */}
        <div className="bg-secondary rounded-lg p-6 mb-8 relative overflow-hidden">
          <div className="relative h-52">
            {/* Center indicator */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-accent z-20 shadow-lg shadow-accent/50 transform -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-0 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-accent z-20 transform -translate-x-1/2"></div>

            {/* Roulette items */}
            <div className="relative h-full overflow-hidden">
              <div
                ref={rouletteRef}
                className="flex gap-4 items-center h-full absolute left-0"
                style={{ transform: 'translateX(0)' }}
              >
                {rouletteItems.length > 0 ? (
                  rouletteItems.map((item, i) => (
                    <div
                      key={i}
                      className={`min-w-[180px] h-44 bg-gradient-to-br ${getRarityColor(
                        item.skin_rarity
                      )} rounded-lg flex flex-col items-center justify-between p-3 shadow-xl`}
                    >
                      <div className="text-xs text-white font-semibold text-center line-clamp-1">
                        {item.weapon_name}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <img
                          src={item.skin_img_source}
                          alt={item.skin_name}
                          className="max-h-20 object-contain"
                        />
                      </div>
                      <div className="text-sm text-white font-medium text-center line-clamp-2">
                        {item.skin_name}
                      </div>
                      <div className="text-white font-bold">${item.skin_price.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-400 py-16">
                    Click "Open Case" to start
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Won Item Modal */}
        {showResult && wonItem && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-lg p-8 max-w-md w-full">
              <h3 className="text-3xl font-bold text-center mb-6 text-accent">
                🎉 You Won! 🎉
              </h3>
              <div
                className={`p-6 bg-gradient-to-br ${getRarityColor(
                  wonItem.skin_rarity
                )} rounded-lg mb-6`}
              >
                <div className="text-center">
                  <img
                    src={wonItem.skin_img_source}
                    alt={wonItem.skin_name}
                    className="w-full h-32 object-contain mb-4"
                  />
                  <div className="text-xl font-semibold text-white mb-2">
                    {wonItem.weapon_name}
                  </div>
                  <div className="text-lg text-white mb-3">{wonItem.skin_name}</div>
                  <div className="text-xs text-white/80 mb-2">{wonItem.skin_quality}</div>
                  <div className="text-2xl font-bold text-white">
                    ${wonItem.skin_price.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={sellItem}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  Sell for ${wonItem.skin_price.toFixed(2)}
                </button>
                <button
                  onClick={() => {
                    resetRoulette()
                    navigate('/inventory')
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Keep in Inventory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Available Drops */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Available Drops ({drops.length} items)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className={`bg-gradient-to-br ${getRarityColor(
                  drop.skin_rarity
                )} rounded-lg p-4`}
              >
                <div className="text-center mb-2">
                  <img
                    src={drop.skin_img_source}
                    alt={drop.skin_name}
                    className="w-full h-24 object-contain"
                  />
                </div>
                <div className="text-sm text-white font-semibold mb-1 text-center line-clamp-1">
                  {drop.weapon_name}
                </div>
                <div className="text-xs text-white/90 mb-2 text-center line-clamp-2">
                  {drop.skin_name}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80">{drop.display_chance}</span>
                  <span className="text-white font-bold">${drop.skin_price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
