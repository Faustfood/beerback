// Hopfen-Konstanten – Single Source of Truth für alle Belohnungen
// Wenn du Werte änderst, ändert sich überall in der App

export const HOPFEN = {
  // Bier-Logging (mit Tageslimit)
  BEER_LOG: 5,           // Bier-Sorte eingetragen
  BEER_PHOTO: 10,        // Foto hinzugefügt
  BEER_RATING: 5,        // Sterne-Bewertung
  BEER_NOTE: 10,         // Tasting-Notiz geschrieben

  // Bonus (kein Tageslimit für First-Time)
  GEO_VERIFIED: 20,      // GPS in Partner-Bar bestätigt
  FIRST_BEER_NAME: 25,   // Diese Sorte zum ersten Mal
  FIRST_BAR: 25,         // Diese Bar zum ersten Mal
  FIRST_CITY: 50,        // Diese Stadt zum ersten Mal
  FIRST_COUNTRY: 150,    // Dieses Land zum ersten Mal
  FIRST_STYLE: 30,       // Diesen Bierstil zum ersten Mal

  // Wasser (Schutz-Belohnung)
  WATER_LOG: 5,

  // Spiele
  QUIZ_PER_CORRECT: 5,
  QUIZ_PERFECT_BONUS: 10,
  GAME_PER_PLAY: 5,
  GAME_NEW_HIGHSCORE: 25,

  // Wheel (Glücksrad-Werte)
  WHEEL_VALUES: [10, 15, 25, 30, 50, 100, 250, 500],
  WHEEL_WEIGHTS: [25, 15, 22, 5, 20, 10, 2, 1],

  // Streaks & Pausen
  STREAK_7_DAYS: 75,         // App 7 Tage in Folge geöffnet
  STREAK_MULTIPLIER_3: 1.5,  // Wheel-Bonus bei 3+ Tagen
  STREAK_MULTIPLIER_7: 2.0,  // Wheel-Bonus bei 7+ Tagen
  PAUSE_7_DAYS: 200,         // 7 Tage ohne Bier-Log

  // Limits (Schutzmechanismen!)
  MAX_REWARDED_BEERS_PER_DAY: 3,
  MAX_REWARDED_WATER_PER_DAY: 5,
  MAX_GAME_PLAYS_PER_DAY: 10,
  REDEMPTION_VALIDITY_MINUTES: 30,
} as const

// Berechne Hopfen für ein Bier-Logging-Event
export function calculateBeerHopfen(opts: {
  hasPhoto: boolean
  hasRating: boolean
  hasNote: boolean
  isGeoVerified: boolean
  isFirstBeerName: boolean
  isFirstBar: boolean
  isFirstCity: boolean
  isFirstCountry: boolean
  isFirstStyle: boolean
  withinDailyLimit: boolean
}): { total: number; breakdown: Array<{ source: string; amount: number; label: string }> } {
  const breakdown: Array<{ source: string; amount: number; label: string }> = []

  // Tageslimit-Check: Standard-Hopfen nur wenn unter Limit
  if (opts.withinDailyLimit) {
    breakdown.push({ source: 'beer_log', amount: HOPFEN.BEER_LOG, label: 'Bier dokumentiert' })

    if (opts.hasPhoto) {
      breakdown.push({ source: 'photo_bonus', amount: HOPFEN.BEER_PHOTO, label: 'Foto hinzugefügt' })
    }
    if (opts.hasRating) {
      breakdown.push({ source: 'rating_bonus', amount: HOPFEN.BEER_RATING, label: 'Bewertung' })
    }
    if (opts.hasNote) {
      breakdown.push({ source: 'note_bonus', amount: HOPFEN.BEER_NOTE, label: 'Tasting-Notiz' })
    }
    if (opts.isGeoVerified) {
      breakdown.push({ source: 'geo_bonus', amount: HOPFEN.GEO_VERIFIED, label: 'Vor-Ort verifiziert' })
    }
  }

  // First-Time-Boni gelten IMMER (auch über Tageslimit hinaus)
  if (opts.isFirstBeerName) {
    breakdown.push({ source: 'first_style', amount: HOPFEN.FIRST_BEER_NAME, label: 'Neue Sorte!' })
  }
  if (opts.isFirstBar) {
    breakdown.push({ source: 'first_bar', amount: HOPFEN.FIRST_BAR, label: 'Neue Bar!' })
  }
  if (opts.isFirstCity) {
    breakdown.push({ source: 'first_city', amount: HOPFEN.FIRST_CITY, label: 'Neue Stadt!' })
  }
  if (opts.isFirstCountry) {
    breakdown.push({ source: 'first_country', amount: HOPFEN.FIRST_COUNTRY, label: '🌍 Neues Land!' })
  }
  if (opts.isFirstStyle) {
    breakdown.push({ source: 'first_style', amount: HOPFEN.FIRST_STYLE, label: 'Neuer Bierstil!' })
  }

  const total = breakdown.reduce((sum, b) => sum + b.amount, 0)
  return { total, breakdown }
}

// Wheel-Spin: zufälliger Gewinn nach Wahrscheinlichkeiten
export function spinWheel(streakDays: number = 0): {
  baseAmount: number
  multiplier: number
  finalAmount: number
} {
  const totalWeight = HOPFEN.WHEEL_WEIGHTS.reduce((a, b) => a + b, 0)
  let rand = Math.random() * totalWeight

  let baseAmount = HOPFEN.WHEEL_VALUES[0]
  for (let i = 0; i < HOPFEN.WHEEL_VALUES.length; i++) {
    rand -= HOPFEN.WHEEL_WEIGHTS[i]
    if (rand <= 0) {
      baseAmount = HOPFEN.WHEEL_VALUES[i]
      break
    }
  }

  let multiplier = 1
  if (streakDays >= 7) multiplier = HOPFEN.STREAK_MULTIPLIER_7
  else if (streakDays >= 3) multiplier = HOPFEN.STREAK_MULTIPLIER_3

  const finalAmount = Math.floor(baseAmount * multiplier)
  return { baseAmount, multiplier, finalAmount }
}

// Reward-Code generieren
export function generateRedemptionCode(): string {
  const prefix = 'BB'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // ohne verwirrende Zeichen
  let code = prefix + '-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
