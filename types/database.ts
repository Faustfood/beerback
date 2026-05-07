// Datenbank-Types für Beerback
// Manuell gepflegt – passt zum Schema in beerback-database-schema.sql

export type Profile = {
  id: string
  pseudonym: string
  avatar_color: string
  birthdate: string
  age_verified: boolean
  agb_accepted_at: string | null
  privacy_accepted_at: string | null
  current_hopfen: number
  total_hopfen_earned: number
  total_hopfen_spent: number
  level: string
  streak_days: number
  last_app_open: string | null
  paused_until: string | null
  created_at: string
  updated_at: string
}

export type BeerStyle = {
  id: number
  name: string
  category: string | null
  description: string | null
}

export type PartnerVenue = {
  id: string
  name: string
  address: string | null
  city: string | null
  country: string
  latitude: number | null
  longitude: number | null
  geofence_radius_m: number
  active: boolean
  subscription_tier: string
}

export type Beer = {
  id: string
  user_id: string
  name: string
  style_id: number | null
  rating: number | null
  note: string | null
  photo_url: string | null
  partner_venue_id: string | null
  location_freetext: string | null
  city: string | null
  country: string | null
  gps_lat: number | null
  gps_lng: number | null
  geo_verified: boolean
  hopfen_earned: number
  created_at: string
}

export type Transaction = {
  id: string
  user_id: string
  amount: number
  source: TransactionSource
  description: string | null
  beer_id: string | null
  created_at: string
}

export type TransactionSource =
  | 'beer_log'
  | 'photo_bonus'
  | 'rating_bonus'
  | 'note_bonus'
  | 'geo_bonus'
  | 'first_country'
  | 'first_city'
  | 'first_bar'
  | 'first_style'
  | 'wheel'
  | 'quiz'
  | 'game'
  | 'redemption'
  | 'streak'
  | 'pause_bonus'
  | 'achievement'
  | 'water_bonus'

export type Reward = {
  id: string
  partner_venue_id: string | null
  title: string
  description: string | null
  hopfen_cost: number
  category: string | null
  emoji: string | null
  active: boolean
  stock: number | null
}

export type Redemption = {
  id: string
  user_id: string
  reward_id: string
  partner_venue_id: string | null
  code: string
  hopfen_cost: number
  created_at: string
  expires_at: string
  redeemed_at: string | null
  redeemed_by_user_id: string | null
  status: 'pending' | 'redeemed' | 'expired' | 'cancelled'
}

export type DailyLimit = {
  id: string
  user_id: string
  date: string
  beers_logged: number
  beers_rewarded: number
  water_logged: number
  wheel_spun: boolean
  quiz_completed: boolean
  game_plays: number
}

export type Achievement = {
  id: number
  code: string
  title: string
  description: string | null
  emoji: string | null
  category: string | null
  hopfen_reward: number
  requirement_type: string | null
  requirement_value: number | null
}

export type UserAchievement = {
  id: string
  user_id: string
  achievement_id: number
  unlocked_at: string
}

// Helper-Types
export type BeerWithStyle = Beer & {
  beer_styles: BeerStyle | null
  partner_venues: PartnerVenue | null
}

export type Level = {
  name: string
  minHopfen: number
  maxHopfen: number
  requirements?: {
    minStyles?: number
    minBeers?: number
  }
}

export const LEVELS: Level[] = [
  { name: 'Bier-Lehrling', minHopfen: 0, maxHopfen: 500 },
  { name: 'Hopfen-Sucher', minHopfen: 500, maxHopfen: 2000 },
  { name: 'Sortenkundiger', minHopfen: 2000, maxHopfen: 5000, requirements: { minBeers: 30 } },
  { name: 'Bier-Sommelier', minHopfen: 5000, maxHopfen: 15000, requirements: { minBeers: 50, minStyles: 10 } },
  { name: 'Braumeister', minHopfen: 15000, maxHopfen: Infinity, requirements: { minBeers: 100, minStyles: 20 } },
]
