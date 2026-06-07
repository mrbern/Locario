export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-cyan-300">Rechtliches</p>

        <h1 className="mt-3 text-4xl font-bold md:text-6xl">Impressum</h1>

        <p className="mt-6 text-slate-300">
          Angaben zum Betreiber der Plattform Locario.
        </p>

        <div className="mt-10 space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8">
          <section>
            <h2 className="text-2xl font-bold">Betreiber</h2>

            <div className="mt-4 space-y-2 text-slate-300">
              <p>DEINE FIRMA</p>
              <p>Vorname Nachname</p>
              <p>Strasse Hausnummer</p>
              <p>PLZ Ort</p>
              <p>Schweiz</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Kontakt</h2>

            <div className="mt-4 space-y-2 text-slate-300">
              <p>E-Mail: info@Locario.ch</p>
              <p>Telefon: +41 XX XXX XX XX</p>
              <p>Website: www.Locario.ch</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Unternehmensangaben</h2>

            <div className="mt-4 space-y-2 text-slate-300">
              <p>UID: CHE-XXX.XXX.XXX</p>
              <p>Rechtsform: Einzelunternehmen / GmbH / AG</p>
              <p>Sitz: Ort, Schweiz</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Verantwortlich für den Inhalt
            </h2>

            <div className="mt-4 space-y-2 text-slate-300">
              <p>DEIN NAME</p>
              <p>E-Mail: info@Locario.ch</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Haftungsausschluss</h2>

            <p className="mt-4 text-slate-300">
              Locario stellt Informationen über regionale Firmen, Angebote,
              Dienstleistungen und Kontaktmöglichkeiten bereit. Trotz
              sorgfältiger Prüfung übernehmen wir keine Gewähr für die
              Aktualität, Richtigkeit und Vollständigkeit der bereitgestellten
              Informationen. Für Inhalte von eingetragenen Firmen sind die
              jeweiligen Firmen selbst verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Externe Links</h2>

            <p className="mt-4 text-slate-300">
              Diese Website kann Links zu externen Websites enthalten. Für den
              Inhalt externer Seiten übernehmen wir keine Verantwortung. Für den
              Inhalt verlinkter Seiten sind ausschliesslich deren Betreiber
              verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Urheberrechte</h2>

            <p className="mt-4 text-slate-300">
              Die Inhalte, Struktur, Gestaltung und Texte dieser Website sind,
              soweit rechtlich möglich, urheberrechtlich geschützt. Eine
              Verwendung ohne Zustimmung des Betreibers ist nicht gestattet.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/datenschutz"
            className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            Datenschutz
          </a>

          <a
            href="/agb"
            className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            AGB
          </a>

          <a
            href="/"
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Zur Startseite
          </a>
        </div>
      </section>
    </main>
  );
}

