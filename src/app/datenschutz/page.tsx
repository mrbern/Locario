import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz | Locario",
  description:
    "Datenschutzerklärung von Locario für Nutzer, Firmen, Veranstalter und Partner.",
};

const operator = {
  name: "BETREIBER ERGÄNZEN",
  street: "ADRESSE ERGÄNZEN",
  zipCity: "PLZ ORT ERGÄNZEN",
  country: "Schweiz",
  email: "info@locario.ch",
};

const dataCategories = [
  "Name, Firma und Kontaktangaben von Firmen, Veranstaltern, Kontaktpersonen und Nutzern",
  "E-Mail-Adressen, Telefonnummern, Website-Adressen und Nachrichteninhalte",
  "Firmenprofile mit Kategorien, Beschreibung, Ort, Adresse, Bildern, Suchbegriffen und Werbeangeboten",
  "Eventdaten mit Veranstalter, Datum, Ort, Adresse, Beschreibung, Website und Ticketlink",
  "Kundenanfragen, Lead-Status, Partner-Dashboard-Aktivitäten und ursprüngliche Suchanfragen",
  "Suchanfragen, normalisierte Suchbegriffe, Trefferanzahl und Zeitpunkt der Suche",
  "technische Daten wie IP-Adresse, Browsertyp, Gerätedaten, Logdaten und Zeitpunkt des Zugriffs",
];

const processingPurposes = [
  "Bereitstellung, Betrieb und Sicherheit der Plattform Locario",
  "Anzeige passender Firmen, Anbieter und Events bei Suchanfragen",
  "Erstellung, Prüfung, Veröffentlichung und Verwaltung von Firmen- und Eventeinträgen",
  "Verarbeitung und Weiterleitung von Kundenanfragen an die betroffene Firma",
  "Bereitstellung von Admin- und Partner-Dashboard-Funktionen",
  "Kommunikation mit Nutzern, Firmen, Veranstaltern und Partnern",
  "Verbesserung der Suche, der Trefferqualität und der regionalen Angebotsstruktur",
  "Erkennung von Nachfrage, Branchenlücken, Akquise-Chancen und Missbrauch",
  "Erfüllung gesetzlicher Pflichten und Durchsetzung berechtigter Ansprüche",
];

const rights = [
  "Auskunft über bearbeitete Personendaten verlangen",
  "unrichtige oder unvollständige Daten berichtigen lassen",
  "Löschung oder Einschränkung der Bearbeitung verlangen, soweit rechtlich möglich",
  "der Bearbeitung widersprechen, soweit dafür ein gesetzlicher Grund besteht",
  "eine erteilte Einwilligung für die Zukunft widerrufen",
];

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14 text-white sm:px-6 md:py-20">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
          Rechtliches
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
          Datenschutzerklärung
        </h1>

        <p className="mt-6 max-w-3xl text-slate-300">
          Diese Datenschutzerklärung informiert darüber, wie Locario
          Personendaten bearbeitet, wenn du die Plattform nutzt, eine Anfrage
          sendest, ein Firmenprofil oder Event einreichst oder das Partner- bzw.
          Admin-Dashboard verwendest.
        </p>

        <div className="mt-8 rounded-3xl border border-amber-300/25 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100">
          <p className="font-black">Hinweis vor Veröffentlichung</p>
          <p className="mt-2">
            Die Betreiberangaben müssen vor dem Livegang mit den echten Angaben
            aus dem Impressum ersetzt werden. Je nach Hosting, Analyse-Tools,
            E-Mail-Dienstleister oder Zahlungsanbieter müssen weitere Abschnitte
            ergänzt werden.
          </p>
        </div>

        <div className="mt-10 space-y-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20 sm:p-8">
          <LegalSection title="1. Verantwortliche Stelle">
            <div className="space-y-2 text-slate-300">
              <p>{operator.name}</p>
              <p>{operator.street}</p>
              <p>{operator.zipCity}</p>
              <p>{operator.country}</p>
              <p>E-Mail: {operator.email}</p>
            </div>
          </LegalSection>

          <LegalSection title="2. Zweck der Plattform">
            <p>
              Locario ist eine lokale Such-, Firmen-, Event-, Werbe- und
              Leadplattform. Nutzer können nach regionalen Firmen,
              Dienstleistungen, Produkten und Veranstaltungen suchen. Firmen und
              Veranstalter können Einträge einreichen, veröffentlichen lassen und
              je nach Paket Anfragen verwalten.
            </p>
          </LegalSection>

          <LegalSection title="3. Bearbeitete Personendaten">
            <p>Je nach Nutzung der Plattform können insbesondere folgende Daten bearbeitet werden:</p>

            <ul className="mt-4 space-y-3">
              {dataCategories.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </LegalSection>

          <LegalSection title="4. Zwecke der Datenbearbeitung">
            <p>Wir bearbeiten Personendaten insbesondere zu folgenden Zwecken:</p>

            <ul className="mt-4 space-y-3">
              {processingPurposes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </LegalSection>

          <LegalSection title="5. Firmenprofile, Events und öffentliche Daten">
            <p>
              Firmenprofile und Eventeinträge können öffentlich sichtbar sein.
              Dazu gehören insbesondere Name, Beschreibung, Kategorie,
              Unterkategorien, Tags, Suchbegriffe, Ort, Adresse, Kontaktdaten,
              Website, Bilder, Veranstalterdaten, Eventdatum, Ticketlink und
              Werbeangebote. Firmen und Veranstalter sind dafür verantwortlich,
              dass die von ihnen bereitgestellten Inhalte korrekt, zulässig und
              aktuell sind.
            </p>
          </LegalSection>

          <LegalSection title="6. Kundenanfragen und Leads">
            <p>
              Wenn Nutzer über Locario eine Anfrage an eine Firma senden, werden
              die eingegebenen Daten gespeichert und der betroffenen Firma bzw.
              dem berechtigten Partner zur Bearbeitung angezeigt. Dazu können
              Name, E-Mail-Adresse, Telefonnummer, Nachricht, Status der Anfrage
              und die ursprüngliche Suchanfrage gehören.
            </p>
          </LegalSection>

          <LegalSection title="7. Suchanfragen und Nachfrageanalyse">
            <p>
              Locario kann Suchanfragen speichern, um die Plattform zu
              verbessern, passende Treffer anzuzeigen und regionale Nachfrage zu
              erkennen. Dabei können Suchtext, normalisierte Suchanfrage,
              Trefferanzahl und Zeitpunkt gespeichert werden. Diese Daten helfen,
              fehlende Branchen, Orte oder Eventangebote zu erkennen.
            </p>
          </LegalSection>

          <LegalSection title="8. Admin- und Partner-Dashboard">
            <p>
              Für Admin- und Partnerbereiche können Zugangsdaten, Zugriffstokens,
              Profiländerungen, Lead-Status und technische Logdaten bearbeitet
              werden. Partner dürfen nur Daten ihrer eigenen Firma und ihrer
              eigenen Leads einsehen. Admins können Plattformdaten im Rahmen des
              Betriebs und Supports bearbeiten.
            </p>
          </LegalSection>

          <LegalSection title="9. Cookies, Login und technische Daten">
            <p>
              Locario kann Cookies und ähnliche Technologien verwenden, um
              Login-Funktionen, Sicherheit, Sitzungen und technische Funktionen
              bereitzustellen. Cookies können im Browser eingeschränkt oder
              gelöscht werden. Dadurch können einzelne Funktionen eingeschränkt
              sein. Falls später Analyse-, Tracking- oder Marketing-Tools
              eingesetzt werden, wird diese Datenschutzerklärung entsprechend
              ergänzt.
            </p>
          </LegalSection>

          <LegalSection title="10. Weitergabe an Dritte">
            <p>
              Personendaten werden nur weitergegeben, soweit dies für den
              Betrieb der Plattform, die Bearbeitung von Anfragen, die
              Veröffentlichung von Einträgen, gesetzliche Pflichten oder
              berechtigte Interessen erforderlich ist. Kundenanfragen werden
              insbesondere an die Firma weitergegeben, an die sie gerichtet sind.
            </p>
          </LegalSection>

          <LegalSection title="11. Hosting und Dienstleister">
            <p>
              Für den Betrieb der Website können technische Dienstleister
              eingesetzt werden, zum Beispiel Hosting-Anbieter,
              Datenbankanbieter, E-Mail-Dienstleister, Speicherlösungen,
              Sicherheitsdienste oder Analyseanbieter. Diese Dienstleister können
              Zugriff auf Personendaten erhalten, soweit dies für ihre Leistung
              notwendig ist.
            </p>
          </LegalSection>

          <LegalSection title="12. Datenübermittlung ins Ausland">
            <p>
              Werden Personendaten in Länder ausserhalb der Schweiz übermittelt,
              achten wir auf angemessene Datenschutzgarantien oder andere
              gesetzlich zulässige Grundlagen. Dies kann insbesondere bei
              Hosting-, E-Mail-, Cloud- oder Analyse-Dienstleistern relevant
              sein.
            </p>
          </LegalSection>

          <LegalSection title="13. Aufbewahrungsdauer">
            <p>
              Personendaten werden nur so lange gespeichert, wie dies für die
              genannten Zwecke erforderlich ist, gesetzliche
              Aufbewahrungspflichten bestehen oder berechtigte Interessen an der
              Speicherung bestehen. Firmenprofile, Eventdaten, Leads und
              Suchdaten können gelöscht oder anonymisiert werden, wenn sie nicht
              mehr benötigt werden.
            </p>
          </LegalSection>

          <LegalSection title="14. Datensicherheit">
            <p>
              Wir treffen angemessene technische und organisatorische
              Massnahmen, um Personendaten vor Verlust, Missbrauch,
              unberechtigtem Zugriff und unbefugter Offenlegung zu schützen. Ein
              vollständiger Schutz kann bei Datenübertragungen im Internet jedoch
              nicht garantiert werden.
            </p>
          </LegalSection>

          <LegalSection title="15. Rechte betroffener Personen">
            <p>
              Betroffene Personen können im Rahmen des anwendbaren
              Datenschutzrechts insbesondere folgende Rechte geltend machen:
            </p>

            <ul className="mt-4 space-y-3">
              {rights.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4">
              Anfragen können an {operator.email} gerichtet werden. Zur
              Bearbeitung kann ein Identitätsnachweis verlangt werden.
            </p>
          </LegalSection>

          <LegalSection title="16. Änderungen dieser Datenschutzerklärung">
            <p>
              Wir können diese Datenschutzerklärung jederzeit anpassen. Es gilt
              die jeweils auf dieser Website veröffentlichte Version.
            </p>
          </LegalSection>

          <LegalSection title="17. Stand">
            <p>Stand: Juli 2026</p>
          </LegalSection>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/impressum"
            className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Impressum
          </Link>

          <Link
            href="/agb"
            className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            AGB
          </Link>

          <Link
            href="/"
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
          >
            Zur Startseite
          </Link>
        </div>
      </section>
    </main>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-slate-300 md:text-base md:leading-8">
        {children}
      </div>
    </section>
  );
}
