import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="font-display font-bold text-xl">
          Beer<span className="text-gold-deep">back</span>
        </div>
        <Link href="/login" className="text-sm font-semibold text-gold-deep">
          Login
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 px-6 py-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div className="text-7xl mb-6">🍺</div>

        <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
          Trink Bier.<br />
          <span className="text-gold-deep">Krieg Beerback.</span>
        </h1>

        <p className="text-lg text-ink-soft mb-8 max-w-md">
          Sammle deine Bier-Reise auf der persönlichen Welt-Karte.
          Verdiene Hopfen-Punkte. Löse sie gegen echte Belohnungen ein.
        </p>

        <Link
          href="/login"
          className="btn-gold text-lg px-8 py-4 mb-12"
        >
          Jetzt loslegen
        </Link>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="card text-left">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-display font-bold mb-1">Welt-Karte</h3>
            <p className="text-sm text-ink-soft">
              Jedes Bier wird zum Pin. Deine persönliche Bier-Reise.
            </p>
          </div>

          <div className="card text-left">
            <div className="text-3xl mb-2">🌿</div>
            <h3 className="font-display font-bold mb-1">Hopfen sammeln</h3>
            <p className="text-sm text-ink-soft">
              Pro Bier, Foto, Quiz, Achievement. Wie Payback für Bier.
            </p>
          </div>

          <div className="card text-left">
            <div className="text-3xl mb-2">🎁</div>
            <h3 className="font-display font-bold mb-1">Echte Rewards</h3>
            <p className="text-sm text-ink-soft">
              Freibier, Probiersets, Brauerei-Touren bei Partner-Bars.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-ink-soft border-t border-line">
        <p className="mb-2">🔞 Nur für Personen ab 18 Jahren · Verantwortungsvoller Genuss</p>
        <p>
          © 2026 Beerback ·{' '}
          <a href="https://faustfood.de" className="underline">
            Craftmichel-Brauerei
          </a>{' '}
          · Erfurt
        </p>
      </footer>
    </main>
  )
}
