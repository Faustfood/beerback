'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HOPFEN } from '@/lib/hopfen/calculate'

export default function AddBeerPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsRequested, setGpsRequested] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Live-Vorschau der Hopfen
  const [estimatedHopfen, setEstimatedHopfen] = useState(0)

  useEffect(() => {
    let total = HOPFEN.BEER_LOG // immer
    if (photo) total += HOPFEN.BEER_PHOTO
    if (rating > 0) total += HOPFEN.BEER_RATING
    if (note.trim().length > 0) total += HOPFEN.BEER_NOTE
    if (gpsCoords) total += HOPFEN.GEO_VERIFIED
    setEstimatedHopfen(total)
  }, [photo, rating, note, gpsCoords])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Foto darf max. 5 MB groß sein.')
      return
    }

    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setError('Dein Browser unterstützt keine Standortbestimmung.')
      return
    }

    setGpsRequested(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: parseFloat(pos.coords.latitude.toFixed(4)),
          lng: parseFloat(pos.coords.longitude.toFixed(4)),
        })
      },
      (err) => {
        console.error('GPS Error:', err)
        setError('Standort konnte nicht ermittelt werden. Geht auch ohne!')
        setGpsRequested(false)
      },
      { timeout: 10000 }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let photoUrl: string | null = null

      // Foto hochladen
      if (photo) {
        const ext = photo.name.split('.').pop()
        const filename = `${user.id}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('beer-photos')
          .upload(filename, photo)

        if (uploadError) {
          throw new Error(`Foto-Upload fehlgeschlagen: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('beer-photos')
          .getPublicUrl(filename)

        photoUrl = publicUrl
      }

      // Bier-Eintrag anlegen
      const { data: beer, error: beerError } = await supabase
        .from('beers')
        .insert({
          user_id: user.id,
          name: name.trim(),
          location_freetext: location.trim() || null,
          rating: rating || null,
          note: note.trim() || null,
          photo_url: photoUrl,
          gps_lat: gpsCoords?.lat ?? null,
          gps_lng: gpsCoords?.lng ?? null,
          hopfen_earned: estimatedHopfen,
        })
        .select()
        .single()

      if (beerError) throw beerError

      // Hopfen-Transaktion anlegen
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: estimatedHopfen,
        source: 'beer_log',
        description: `Bier dokumentiert: ${name}`,
        beer_id: beer.id,
      })

      if (txError) throw txError

      // Erfolg → zurück zu Home mit Hopfen-Animation
      router.push(`/home?earned=${estimatedHopfen}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-bg/95 backdrop-blur-xl border-b border-line flex justify-between items-center">
        <Link href="/home" className="w-9 h-9 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <strong>Neues Bier</strong>
        <div className="w-9" />
      </header>

      <form onSubmit={handleSubmit} className="px-5 pt-4 pb-32">
        <h1 className="font-display text-2xl font-bold mb-1">
          Was trinkst du gerade?
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          Foto, Sorte, Bewertung – Hopfen kassieren 🌿
        </p>

        {/* Foto */}
        <div className="mb-4">
          <label className="label">Foto (optional, +10 🌿)</label>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className={`aspect-[4/5] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
              photoPreview
                ? 'bg-gradient-to-br from-gold-light to-gold-deep'
                : 'bg-bg-deep text-white'
            }`}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Vorschau"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <>
                  <div className="text-5xl mb-2">📸</div>
                  <strong>Foto machen</strong>
                  <span className="text-xs opacity-70 mt-1">
                    Tap zum Aufnehmen
                  </span>
                </>
              )}
            </div>
          </label>
        </div>

        {/* Bier-Sorte */}
        <div className="mb-4">
          <label className="label">Bier-Sorte *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="z.B. Goldmichel Pils"
            required
            maxLength={150}
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="label">Wo bist du?</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field"
            placeholder="z.B. Faustfood, Erfurt"
            maxLength={150}
          />

          {!gpsCoords && (
            <button
              type="button"
              onClick={requestLocation}
              disabled={gpsRequested}
              className="text-xs text-gold-deep font-semibold mt-2"
            >
              {gpsRequested ? '📍 Standort wird ermittelt...' : '📍 Standort hinzufügen für +20 🌿'}
            </button>
          )}

          {gpsCoords && (
            <div className="text-xs text-green-700 mt-2 flex items-center gap-1">
              ✓ Standort verifiziert (+20 🌿)
            </div>
          )}
        </div>

        {/* Bewertung */}
        <div className="mb-4">
          <label className="label">Bewertung (+5 🌿)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className={`text-3xl transition-all ${
                  s <= rating ? 'opacity-100 scale-110' : 'opacity-40 grayscale'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Notiz */}
        <div className="mb-6">
          <label className="label">Tasting-Notiz (optional, +10 🌿)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field"
            placeholder="z.B. spritzig, herb, leicht blumig"
            maxLength={500}
          />
        </div>

        {/* Hopfen-Vorschau */}
        <div className="bg-gradient-to-br from-ink to-bg-deep text-white rounded-2xl p-4 mb-6 flex justify-between items-center">
          <div>
            <strong className="block">Du verdienst gleich</strong>
            <span className="text-xs opacity-70">Bier-Logging mit Boni</span>
          </div>
          <div className="font-display text-2xl font-extrabold text-gold flex items-center gap-1">
            +{estimatedHopfen} 🌿
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary w-full"
        >
          {loading ? 'Wird gespeichert...' : 'Bier speichern 🍺'}
        </button>
      </form>
    </div>
  )
}
