'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">📬</div>
          <h1 className="font-display text-2xl font-bold mb-2">Email gesendet!</h1>
          <p className="text-ink-soft mb-6">
            Wir haben dir einen Login-Link an <strong>{email}</strong> geschickt.
            Klick einfach drauf und du bist drin.
          </p>
          <p className="text-sm text-ink-soft">
            Tipp: Im Spam-Ordner schauen, falls nichts ankommt.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col px-6">
      {/* Header */}
      <header className="py-4">
        <Link href="/" className="font-display font-bold text-xl">
          Beer<span className="text-gold-deep">back</span>
        </Link>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🍺</div>
            <h1 className="font-display text-3xl font-bold mb-2">Willkommen zurück</h1>
            <p className="text-ink-soft">
              Trag deine Email ein – wir schicken dir einen Login-Link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="du@example.com"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-gold w-full"
            >
              {loading ? 'Wird gesendet...' : 'Login-Link senden'}
            </button>
          </form>

          <p className="text-xs text-ink-soft text-center mt-6">
            Mit dem Login bestätigst du, mindestens 18 Jahre alt zu sein.
          </p>
        </div>
      </div>
    </main>
  )
}
