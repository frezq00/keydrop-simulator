import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  username: string
  balance: number
  gold_balance: number
  sandbox_mode: boolean
  pfp_url: string
  language: string
}

export interface Case {
  url_name: string
  website_name: string
  price: number
  expired: boolean
  category: string | null
  golden_case: boolean
  img_name: string
  position_in_grid: number | null
}

export interface CaseDrop {
  id: string
  global_inv_id: string
  weapon_name: string
  skin_name: string
  skin_quality: string
  skin_price: number
  skin_rarity: string
  skin_img_source: string
  stattrack: boolean
  parent_case: string
  display_odds?: string
  odds_range?: [number, number]
  price_range?: string
  display_chance?: string
}

export interface Item {
  drop_id: string
  owner_id: string
  global_inv_id: string
  origin: string
  drop_date: string
  sold: boolean
  upgraded: boolean
}
