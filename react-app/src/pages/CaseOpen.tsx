import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, type Case, type CaseDrop } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export default function CaseOpen() {
  const { caseName } = useParams()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [drops, setDrops] = useState<CaseDrop[]>([])
  const [opening, setOpening] = useState(false)
  const [wonItem, setWonItem] = useState<CaseDrop | null>(null)
  const rouletteRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

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

    if (!caseInfo) return

    const { data: caseDrops } = await supabase
      .from('case_drops')
      .select('*')
      .eq('parent_case', caseInfo.website_name)

    setCaseData(caseInfo)
    setDrops(caseDrops || [])
  }

  const openCase = async () => {
    if (!caseData || !user || opening) return

    if (user.balance < caseData.price) {
      alert('Not enough balance!')
      return
    }

    setOpening(true)
    setWonItem(null)

    // Generate random items for roulette
    const rouletteItems: CaseDrop[] = []
    for (let i = 0; i < 50; i++) {
      const randomDrop = drops[Math.floor(Math.random() * drops.length)]
      rouletteItems.push(randomDrop)
    }

    // Select winning item
    const rollNumber = Math.floor(Math.random() * 100000)
    const winningDrop = drops.find(
      (drop: any) => drop.odds_range && drop.odds_range[0] <= rollNumber && drop.odds_range[1] >= rollNumber
    ) || drops[0]

    rouletteItems[35] = winningDrop // Winning position

    // Animate roulette
    if (rouletteRef.current) {
      const itemWidth = 150
      const offset = 35 * itemWidth
      rouletteRef.current.style.transition = 'transform 3.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
      rouletteRef.current.style.transform = `translateX(-${offset}px)`
    }

    setTimeout(() => {
      setWonItem(winningDrop)
      setOpening(false)

      // Update balance (simplified - in production use API)
      // This would be done through Supabase
    }, 3500)
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-secondary rounded-lg p-6 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={caseData.img_name}
              alt={caseData.website_name}
              className="w-32 h-32 object-contain"
            />
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
            onClick={openCase}
            disabled={opening}
            className={`w-full py-4 rounded-lg font-bold text-lg transition ${
              opening
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-accent hover:bg-red-600'
            }`}
          >
            {opening ? 'Opening...' : 'Open Case'}
          </button>
        </div>

        {/* Roulette */}
        <div className="bg-secondary rounded-lg p-6 mb-8 overflow-hidden">
          <div className="relative h-40">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-accent z-10"></div>
            <div
              ref={rouletteRef}
              className="flex gap-4 items-center h-full"
              style={{ transform: 'translateX(0)' }}
            >
              {Array(50).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="min-w-[150px] h-32 bg-primary rounded-lg flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Item {i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Won Item */}
        {wonItem && (
          <div className="bg-secondary rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">You Won!</h3>
            <div className="inline-block p-4 bg-primary rounded-lg">
              <div className="text-lg font-semibold text-white">
                {wonItem.weapon_name} | {wonItem.skin_name}
              </div>
              <div className="text-xl font-bold text-accent mt-2">
                ${wonItem.skin_price.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Available Drops */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Available Drops</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {drops.slice(0, 12).map((drop) => (
              <div key={drop.id} className="bg-secondary rounded-lg p-4">
                <div className="text-sm text-white font-medium mb-2">
                  {drop.weapon_name}
                </div>
                <div className="text-xs text-gray-400 mb-2">{drop.skin_name}</div>
                <div className="text-accent font-bold">${drop.skin_price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
