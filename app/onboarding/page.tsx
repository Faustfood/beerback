'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const AVATAR_COLORS = ['#d4a017', '#c53030', '#2d7a3e', '#3d6dff', '#c238b3']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [pseudonym, setPseudonym] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [acceptedAGB, setAcceptedAGB] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      } else {
        router.push('/login')
      }
    })
  }, [router, supabase])

  function isOver18(date: string): boolean {
    const birth = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18
    }
    return age >= 18
  }

  async function handleFinish() {
    if (!userId) return

    if (!isOver18(birthdate)) {
      setError('Du musst mindestens 18 Jahre alt sein.')
      return
    }

    if (!acceptedAGB || !acceptedPrivacy) {
      setError('Bitte akzeptiere AGB und Datenschutz.')
      return
    }

    setLoading(true)
    setError('')

    const now = new Date().toISOString()
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      pseudonym: pseudonym.trim(),
      birthdate,
      avatar_color: avatarColor,
      age_verified: true,
      agb_accepted_at: now,
      privacy_accepted_at: now,
    })

    setLoading(false)

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Dieses Pseudonym ist schon vergeben. Wähl ein anderes.')
        setStep(1)
      } else {
        setError(insertError.message)
      }
      return
    }

    router.push('/home')
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col px-6">
      {/* Progress */}
      <div className="pt-4 pb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${
                s <= step ? 'bg-gold' : 'bg-line'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
        {/* Step 1: Pseudonym */}
        {step === 1 && (
          <div>
            <div className="text-5xl mb-4">👋</div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Wie sollen wir dich nennen?
            </h1>
            <p className="text-ink-soft mb-6">
              Wähle ein Pseudonym. Du kannst es später ändern.
            </p>

            <div className="mb-6">
              <label className="label">Pseudonym</label>
              <input
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                className="input-field"
                placeholder="z.B. Bier-Mike83"
                maxLength={50}
              />
            </div>

            <div className="mb-8">
              <label className="label">Avatar-Farbe</label>
              <div className="flex gap-3">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    className={`w-12 h-12 rounded-full transition-transform ${
                      avatarColor === c ? 'ring-4 ring-ink scale-110' : ''
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={pseudonym.trim().length < 3}
              className="btn-primary w-full"
            >
              Weiter
            </button>
          </div>
        )}

        {/* Step 2: Alter */}
        {step === 2 && (
          <div>
            <div className="text-5xl mb-4">🔞</div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Wann bist du geboren?
            </h1>
            <p className="text-ink-soft mb-6">
              Beerback ist nur für Personen ab 18. Wir prüfen das einmal.
            </p>

            <div className="mb-6">
              <label className="label">Geburtsdatum</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="input-field"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {birthdate && !isOver18(birthdate) && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">
                Du musst mindestens 18 Jahre alt sein.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl border border-line"
              >
                Zurück
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!birthdate || !isOver18(birthdate)}
                className="btn-primary flex-1"
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AGB */}
        {step === 3 && (
          <div>
            <div className="text-5xl mb-4">📝</div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Fast geschafft!
            </h1>
            <p className="text-ink-soft mb-6">
              Letzter Schritt: Bedingungen akzeptieren.
            </p>

            <label className="flex items-start gap-3 mb-3 cursor-pointer card">
              <input
                type="checkbox"
                checked={acceptedAGB}
                onChange={(e) => setAcceptedAGB(e.target.checked)}
                className="mt-1 w-5 h-5 accent-gold"
              />
              <span className="text-sm">
                Ich akzeptiere die <a href="/agb" target="_blank" className="underline text-gold-deep">AGB</a>
              </span>
            </label>

            <label className="flex items-start gap-3 mb-6 cursor-pointer card">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-5 h-5 accent-gold"
              />
              <span className="text-sm">
                Ich akzeptiere die <a href="/datenschutz" target="_blank" className="underline text-gold-deep">Datenschutzerklärung</a>
              </span>
            </label>

            <div className="bg-foam border border-line rounded-2xl p-4 mb-6 text-xs text-ink-soft">
              <p className="font-semibold mb-1 text-ink">🍺 Verantwortungsvoll genießen</p>
              <p>
                Beerback ist eine App für Bier-Genießer, kein Anreiz zum Mehrtrinken.
                Hopfen-Punkte sind pro Tag begrenzt. Falls du eine Pause brauchst,
                kannst du dich jederzeit selbst sperren.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl border border-line"
                disabled={loading}
              >
                Zurück
              </button>
              <button
                onClick={handleFinish}
                disabled={loading || !acceptedAGB || !acceptedPrivacy}
                className="btn-gold flex-1"
              >
                {loading ? 'Wird angelegt...' : 'Los geht\'s! 🍻'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
