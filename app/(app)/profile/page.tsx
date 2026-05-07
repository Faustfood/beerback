import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

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

  const { data: beers } = await supabase
    .from('beers')
    .select('id, name, location_freetext, rating, photo_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { count: totalBeers } = await supabase
    .from('beers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

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
      <div className="px-5 grid grid-cols-3 gap-2 mb-6">
        <div className="card text-center !p-3">
          <div className="font-display text-xl font-extrabold text-gold-deep">
            {totalBeers || 0}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-ink-soft">
            Biere
          </div>
        </div>
        <div className="card text-center !p-3">
          <div className="font-display text-xl font-extrabold text-gold-deep">
            {profile.streak_days}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-ink-soft">
            Streak
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

      {/* Beer Collection */}
      <div className="px-5 mb-6">
        <h2 className="font-display text-lg font-bold mb-3">Meine Biere</h2>

        {!beers || beers.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-5xl mb-2 opacity-50">🍺</div>
            <p className="text-sm text-ink-soft">
              Noch keine Biere dokumentiert
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {beers.map((beer) => (
              <div key={beer.id} className="card flex items-center gap-3">
                {beer.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={beer.photo_url}
                    alt={beer.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-light to-gold-deep rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🍺
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <strong className="text-sm block truncate">{beer.name}</strong>
                  <span className="text-xs text-ink-soft">
                    {beer.location_freetext || 'Ohne Ort'} ·{' '}
                    {format(new Date(beer.created_at), 'd. MMM', { locale: de })}
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

      {/* Logout */}
      <div className="px-5 pb-6">
        <LogoutButton />
      </div>
    </div>
  )
}
