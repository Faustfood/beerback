import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

type GroupedBeer = {
  name: string
  count: number
  avgRating: number | null
  lastDate: string
  locations: Set<string>
  photo_url: string | null
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Alle Biere holen für Gruppierung
  const { data: allBeers } = await supabase
    .from('beers')
    .select('id, name, location_freetext, rating, photo_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Biere nach Name gruppieren
  const groupedMap = new Map<string, GroupedBeer>()
  allBeers?.forEach((beer) => {
    const key = beer.name.trim().toLowerCase()
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        name: beer.name,
        count: 1,
        avgRating: beer.rating,
        lastDate: beer.created_at,
        locations: new Set(beer.location_freetext ? [beer.location_freetext] : []),
        photo_url: beer.photo_url,
      })
    } else {
      const existing = groupedMap.get(key)!
      existing.count += 1
      if (beer.rating) {
        existing.avgRating = existing.avgRating
          ? (existing.avgRating * (existing.count - 1) + beer.rating) / existing.count
          : beer.rating
      }
      if (beer.location_freetext) existing.locations.add(beer.location_freetext)
      // Foto vom letzten/neuesten Eintrag bevorzugen, aber nur falls vorhanden
      if (!existing.photo_url && beer.photo_url) {
        existing.photo_url = beer.photo_url
      }
    }
  })

  const groupedBeers = Array.from(groupedMap.values()).sort((a, b) => b.count - a.count)

  // Stats
  const totalBeers = allBeers?.length || 0
  const uniqueBeers = groupedBeers.length

  // Jahres-Stats (aktuelles Jahr)
  const currentYear = new Date().getFullYear()
  const beersThisYear = allBeers?.filter(
    (b) => new Date(b.created_at).getFullYear() === currentYear
  ) || []
  const uniqueThisYear = new Set(beersThisYear.map(b => b.name.trim().toLowerCase())).size

  return (
    <div>
      <header className="sticky top-0 z-40 px-4 py-3 bg-bg/95 backdrop-blur-xl border-b border-line">
        <strong>Profil</strong>
      </header>

      {/* Profile Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-3xl flex-shrink-0"
          style={{ background: profile.avatar_color }}
        >
          {profile.pseudonym.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{profile.pseudonym}</h1>
          <span className="bg-ink text-gold text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-semibold inline-block mt-1">
            {profile.level}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 grid grid-cols-3 gap-2 mb-4">
        <div className="card text-center !p-3">
          <div className="font-display text-xl font-extrabold text-gold-deep">
            {totalBeers}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-ink-soft">
            Biere gesamt
          </div>
        </div>
        <div className="card text-center !p-3">
          <div className="font-display text-xl font-extrabold text-gold-deep">
            {uniqueBeers}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-ink-soft">
            Versch. Sorten
          </div>
        </div>
        <div className="card text-center !p-3">
          <div className="font-display text-xl font-extrabold text-gold-deep">
            {profile.total_hopfen_earned.toLocaleString('de-DE')}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-ink-soft">
            Total 🌿
          </div>
        </div>
      </div>

      {/* Jahres-Stats */}
      {beersThisYear.length > 0 && (
        <div className="mx-5 mb-6 bg-gradient-to-br from-gold-light/30 to-foam border border-gold/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📊</span>
            <strong className="font-display">Dein Jahr {currentYear}</strong>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="font-display text-2xl font-bold text-gold-deep">
                {beersThisYear.length}
              </div>
              <div className="text-xs text-ink-soft">Biere dieses Jahr</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-gold-deep">
                {uniqueThisYear}
              </div>
              <div className="text-xs text-ink-soft">Sorten probiert</div>
            </div>
          </div>
        </div>
      )}

      {/* Beer Collection (gruppiert) */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display text-lg font-bold">Meine Sammlung</h2>
          {groupedBeers.length > 0 && (
            <span className="text-xs text-ink-soft">
              {uniqueBeers} Sorten · {totalBeers} Biere
            </span>
          )}
        </div>

        {!groupedBeers || groupedBeers.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-5xl mb-2 opacity-50">🍺</div>
            <p className="text-sm text-ink-soft">
              Noch keine Biere dokumentiert
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupedBeers.map((beer) => (
              <div key={beer.name} className="card flex items-center gap-3 relative overflow-hidden">
                {/* Count-Badge oben rechts */}
                {beer.count > 1 && (
                  <div className="absolute top-2 right-2 bg-gold text-white text-xs font-bold rounded-full min-w-[28px] h-7 flex items-center justify-center px-2">
                    ×{beer.count}
                  </div>
                )}

                {/* Photo or Icon */}
                {beer.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={beer.photo_url}
                    alt={beer.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-gold-light to-gold-deep rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🍺
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-8">
                  <strong className="text-sm block truncate">{beer.name}</strong>
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <span className="truncate">
                      {beer.locations.size === 1
                        ? Array.from(beer.locations)[0]
                        : `${beer.locations.size} Orte`}
                    </span>
                    {beer.avgRating && (
                      <span className="flex-shrink-0">
                        · {beer.avgRating.toFixed(1)} ⭐
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-soft">
                    Zuletzt: {format(new Date(beer.lastDate), 'd. MMM yyyy', { locale: de })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="px-5 pb-6">
        <LogoutButton />
      </div>
    </div>
  )
}
