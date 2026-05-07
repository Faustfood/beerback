import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Letzte 3 Biere
  const { data: recentBeers } = await supabase
    .from('beers')
    .select('id, name, location_freetext, rating, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Stats
  const { count: totalBeers } = await supabase
    .from('beers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div>
      {/* Status Bar */}
      <div className="sticky top-0 z-40 px-4 py-3 bg-bg/90 backdrop-blur-xl border-b border-line flex justify-between items-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: profile.avatar_color }}
        >
          {profile.pseudonym.charAt(0).toUpperCase()}
        </div>
        <div className="flex items-center gap-2 bg-ink text-gold px-3 py-1.5 rounded-full font-bold text-sm">
          <span>🌿</span>
          <span>{profile.current_hopfen.toLocaleString('de-DE')}</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-sm text-ink-soft">Servus,</p>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold">{profile.pseudonym}</h1>
          <span className="bg-ink text-gold text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-semibold">
            {profile.level}
          </span>
        </div>
      </div>

      {/* Streak Card */}
      {profile.streak_days > 0 && (
        <div className="mx-5 mb-4 bg-gradient-to-br from-orange-400 to-red-600 text-white rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-3 -top-5 text-7xl opacity-20">🔥</div>
          <div className="font-display text-4xl font-extrabold">
            {profile.streak_days}
          </div>
          <div>
            <strong className="block text-sm">Tage Streak!</strong>
            <span className="text-xs opacity-85">
              App täglich öffnen für Bonus-Hopfen
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <Link href="/add-beer" className="card hover:border-gold transition-colors">
          <div className="w-9 h-9 bg-foam rounded-xl flex items-center justify-center text-xl mb-2">
            📸
          </div>
          <div className="text-sm font-semibold">Bier hinzufügen</div>
          <div className="text-xs text-ink-soft">+10 bis +200 Hopfen</div>
        </Link>

        <Link href="/map" className="card hover:border-gold transition-colors">
          <div className="w-9 h-9 bg-foam rounded-xl flex items-center justify-center text-xl mb-2">
            🗺️
          </div>
          <div className="text-sm font-semibold">Bier-Welt</div>
          <div className="text-xs text-ink-soft">{totalBeers ?? 0} Pins</div>
        </Link>
      </div>

      {/* Recent Beers */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display text-lg font-bold">Deine letzten Biere</h2>
          {recentBeers && recentBeers.length > 0 && (
            <Link href="/profile" className="text-xs text-gold-deep font-semibold">
              Alle ansehen
            </Link>
          )}
        </div>

        {!recentBeers || recentBeers.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-5xl mb-2 opacity-50">🍺</div>
            <p className="text-sm text-ink-soft mb-4">
              Noch keine Biere dokumentiert
            </p>
            <Link href="/add-beer" className="btn-gold inline-block text-sm">
              Erstes Bier hinzufügen
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentBeers.map((beer) => (
              <div key={beer.id} className="card flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-light to-gold-deep rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  🍺
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="text-sm block truncate">{beer.name}</strong>
                  <span className="text-xs text-ink-soft">
                    {beer.location_freetext || 'Ohne Ort'}
                  </span>
                </div>
                {beer.rating && (
                  <div className="text-sm">{'⭐'.repeat(beer.rating)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
