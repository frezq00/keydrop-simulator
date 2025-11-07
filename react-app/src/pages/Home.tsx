import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Case } from '@/lib/supabase'

export default function Home() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('expired', false)
      .order('position_in_grid', { ascending: true })

    console.log('Cases data:', data)
    console.log('Cases error:', error)

    if (data) {
      const casesWithNumericPrice = data.map(c => ({
        ...c,
        price: typeof c.price === 'string' ? parseFloat(c.price) : c.price
      }))
      setCases(casesWithNumericPrice)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">Loading cases...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        Available Cases
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cases.map((caseItem) => (
          <Link
            key={caseItem.url_name}
            to={`/case/${caseItem.url_name}`}
            className="case-item bg-secondary rounded-lg overflow-hidden shadow-lg"
          >
            <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center p-4">
              <img
                src={caseItem.img_name}
                alt={caseItem.website_name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {caseItem.website_name}
              </h3>
              <div className="flex items-center justify-between">
                <span className={`text-xl font-bold ${caseItem.golden_case ? 'text-gold' : 'text-accent'}`}>
                  ${caseItem.price.toFixed(2)}
                </span>
                {caseItem.golden_case && (
                  <span className="text-xs bg-gold text-black px-2 py-1 rounded font-semibold">
                    GOLD
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No cases available at the moment
        </div>
      )}
    </div>
  )
}
