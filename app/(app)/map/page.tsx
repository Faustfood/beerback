import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: beers } = await supabase
    .from('beers')
    .select('id, name, location_freetext, gps_lat, gps_lng, country, city, created_at')
    .eq('user_id', user.id)

  // Stats berechnen
  const countries = new Set(beers?.filter(b => b.country).map(b => b.country) || [])
  const cities = new Set(beers?.filter(b => b.city).map(b => b.city) || [])
  const withGps = beers?.filter(b => b.gps_lat && b.gps_lng).length || 0

  return (
    <div>
      <header className="sticky top-0 z-40 px-4 py-3 bg-bg/95 backdrop-blur-xl border-b border-line flex items-center justify-between">
        <strong>🗺️ Bier-Welt</strong>
      </header>

      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl font-bold mb-1">Deine Bier-Reise</h1>
        <p className="text-sm text-ink-soft mb-5">
          Jeder Pin erzählt eine Geschichte
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="card text-center !p-3">
            <div className="font-display text-xl font-extrabold text-gold-deep">
              {countries.size}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-ink-soft">
              Länder
            </div>
          </div>
          <div className="card text-center !p-3">
            <div className="font-display text-xl font-extrabold text-gold-deep">
              {cities.size}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-ink-soft">
              Städte
            </div>
          </div>
          <div className="card text-center !p-3">
            <div className="font-display text-xl font-extrabold text-gold-deep">
              {withGps}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-ink-soft">
              Pins
            </div>
          </div>
          <div className="card text-center !p-3">
            <div className="font-display text-xl font-extrabold text-gold-deep">
              {beers?.length || 0}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-ink-soft">
              Biere
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="card text-center py-12 bg-gradient-to-br from-foam to-bg-card">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="font-display text-lg font-bold mb-2">
            Karte kommt bald!
          </h3>
          <p className="text-sm text-ink-soft max-w-xs mx-auto">
            Deine Welt-Karte mit allen Bier-Pins wird in der nächsten Version verfügbar sein.
            Sammle schon mal mit GPS!
          </p>
        </div>

        {/* Liste der GPS-Biere als Vorschau */}
        {beers && beers.filter(b => b.gps_lat).length > 0 && (
          <div className="mt-6">
            <h3 className="font-display font-bold mb-3">Deine Pins</h3>
            <div className="space-y-2">
              {beers.filter(b => b.gps_lat).slice(0, 10).map((beer) => (
                <div key={beer.id} className="card flex items-center gap-3 !py-2.5">
                  <div className="text-xl">📍</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-sm block truncate">{beer.name}</strong>
                    <span className="text-xs text-ink-soft">
                      {beer.location_freetext || `${beer.gps_lat}, ${beer.gps_lng}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
