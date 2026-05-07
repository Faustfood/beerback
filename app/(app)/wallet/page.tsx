import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

const SOURCE_LABELS: Record<string, { emoji: string; label: string }> = {
  beer_log: { emoji: '🍺', label: 'Bier dokumentiert' },
  photo_bonus: { emoji: '📸', label: 'Foto-Bonus' },
  rating_bonus: { emoji: '⭐', label: 'Bewertung' },
  note_bonus: { emoji: '📝', label: 'Tasting-Notiz' },
  geo_bonus: { emoji: '📍', label: 'Vor-Ort verifiziert' },
  first_country: { emoji: '🌍', label: 'Neues Land!' },
  first_city: { emoji: '🏙️', label: 'Neue Stadt' },
  first_bar: { emoji: '🏠', label: 'Neue Bar' },
  first_style: { emoji: '🎨', label: 'Neuer Bierstil' },
  wheel: { emoji: '🎰', label: 'Glücksrad' },
  quiz: { emoji: '🧠', label: 'Quiz gemeistert' },
  game: { emoji: '🎮', label: 'Spiel gespielt' },
  redemption: { emoji: '🎁', label: 'Eingelöst' },
  streak: { emoji: '🔥', label: 'Streak-Bonus' },
  pause_bonus: { emoji: '☕', label: 'Pause-Bonus' },
  achievement: { emoji: '🏆', label: 'Achievement' },
  water_bonus: { emoji: '💧', label: 'Wasser dokumentiert' },
}

export default async function WalletPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_hopfen, total_hopfen_earned, total_hopfen_spent, level')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-bg/95 backdrop-blur-xl border-b border-line">
        <strong>Mein Hopfen</strong>
      </header>

      {/* Balance Card */}
      <div className="mx-5 mt-5 bg-gradient-to-br from-ink to-bg-deep text-white rounded-3xl p-7 text-center relative overflow-hidden">
        <div className="absolute -right-5 -bottom-8 text-9xl opacity-[0.06]">🌿</div>
        <div className="text-xs uppercase tracking-widest opacity-70 mb-1">
          Aktueller Stand
        </div>
        <div className="font-display text-6xl font-extrabold text-gold leading-none mb-1">
          {profile.current_hopfen.toLocaleString('de-DE')}
        </div>
        <div className="text-sm opacity-70">
          ≈ {(profile.current_hopfen / 100).toFixed(2)} € Bierwert
        </div>
        <div className="mt-3 text-xs opacity-60">
          Level: <strong className="text-gold">{profile.level}</strong>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <div className="card">
          <div className="text-xs text-ink-soft">Gesamt verdient</div>
          <div className="font-display text-xl font-bold text-green-700">
            +{profile.total_hopfen_earned.toLocaleString('de-DE')}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-ink-soft">Gesamt eingelöst</div>
          <div className="font-display text-xl font-bold text-red-700">
            −{profile.total_hopfen_spent.toLocaleString('de-DE')}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5 mt-6">
        <h2 className="font-display text-lg font-bold mb-3">Verlauf</h2>

        {!transactions || transactions.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-5xl mb-2 opacity-50">🌿</div>
            <p className="text-sm text-ink-soft">
              Noch keine Hopfen-Aktivität.<br />
              Dokumentiere dein erstes Bier!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => {
              const meta = SOURCE_LABELS[tx.source] || { emoji: '🌿', label: tx.source }
              const isIn = tx.amount > 0

              return (
                <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-line">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                    isIn ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-sm block">
                      {tx.description || meta.label}
                    </strong>
                    <span className="text-xs text-ink-soft">
                      {formatDistanceToNow(new Date(tx.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                  </div>
                  <div className={`font-display font-bold ${
                    isIn ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isIn ? '+' : ''}{tx.amount}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
