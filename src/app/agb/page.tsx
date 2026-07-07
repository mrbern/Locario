import Link from "next/link";

const operator = {
  name: "BETREIBER ERGÄNZEN",
  person: "KONTAKTPERSON ERGÄNZEN",
  street: "ADRESSE ERGÄNZEN",
  zipCity: "PLZ ORT ERGÄNZEN",
  country: "Schweiz",
  email: "info@locario.ch",
};

const agbSections = [
  {
    title: "1. Anbieter",
    content: [
      `${operator.name}`,
      `${operator.person}`,
      `${operator.street}`,
      `${operator.zipCity}`,
      `${operator.country}`,
      `E-Mail: ${operator.email}`,
    ],
  },
  {
    title: "2. Geltungsbereich",
    paragraphs: [
      "Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform Locario durch Besucherinnen und Besucher, Firmen, Veranstalter und weitere Nutzerinnen und Nutzer.",
      "Locario richtet sich an Personen, die regionale Firmen, Dienstleistungen, Produkte oder Events suchen, sowie an Firmen und Veranstalter, die Profile, Eventeinträge, Werbeflächen, Lead-Funktionen oder Partner-Dashboards nutzen.",
    ],
  },
  {
    title: "3. Leistungsbeschreibung",
    paragraphs: [
      "Locario stellt eine lokale Such-, Event-, Werbe- und Leadplattform bereit. Nutzerinnen und Nutzer können Firmen, Anbieter und Events suchen, ansehen und je nach Funktion Kontakt aufnehmen.",
      "Firmen können ein Profil erfassen oder erfassen lassen, Kategorien und Suchbegriffe hinterlegen, Kontaktinformationen anzeigen, Kundenanfragen erhalten und je nach Paket ein Partner-Dashboard sowie Werbeanzeigen nutzen.",
      "Veranstalter können Events einreichen. Locario kann Eventanfragen prüfen, annehmen, ablehnen und als öffentlichen Eventeintrag veröffentlichen.",
    ],
  },
  {
    title: "4. Firmenprofile",
    paragraphs: [
      "Firmen sind verpflichtet, vollständige, wahrheitsgemässe und aktuelle Angaben zu machen. Dazu gehören insbesondere Firmenname, Kontaktangaben, Adresse, Kategorien, Beschreibung, Website, Bilder, Suchbegriffe und Angebote.",
      "Locario kann Firmenprofile prüfen, ablehnen, bearbeiten, deaktivieren oder entfernen, wenn Inhalte unvollständig, irreführend, rechtswidrig, qualitativ ungeeignet oder nicht zum Zweck der Plattform passend sind.",
    ],
  },
  {
    title: "5. Events und Veranstalter",
    paragraphs: [
      "Veranstalter sind dafür verantwortlich, dass Eventangaben korrekt, aktuell und zulässig sind. Dazu gehören insbesondere Titel, Datum, Ort, Adresse, Veranstalterangaben, Beschreibung, Bilder, Website, Ticketlink und Kategorie.",
      "Locario kann Eventeinträge prüfen, ablehnen, bearbeiten, deaktivieren oder entfernen, wenn Inhalte unvollständig, irreführend, rechtswidrig, qualitativ ungeeignet oder nicht zum Zweck der Plattform passend sind.",
    ],
  },
  {
    title: "6. Pakete und Sichtbarkeit",
    paragraphs: [
      "Locario kann unterschiedliche Firmen- und Eventpakete anbieten. Pakete können unterschiedliche Funktionen, Laufzeiten, Darstellungen, Sichtbarkeitsstufen, Partnerfunktionen, Werbeflächen oder Lead-Funktionen enthalten.",
      "Eine bestimmte Anzahl an Suchtreffern, Klicks, Leads, Buchungen, Verkäufen, Aufträgen oder Vertragsabschlüssen wird nicht garantiert.",
      "Premium-, Highlight- oder hervorgehobene Einträge können bevorzugt dargestellt werden, soweit dies technisch und redaktionell vorgesehen ist.",
    ],
  },
  {
    title: "7. Werbung und Angebote",
    paragraphs: [
      "Werbeanzeigen, Angebote, Preise, Rabatte und Leistungsversprechen müssen wahrheitsgemäss, aktuell und rechtlich zulässig sein.",
      "Die jeweilige Firma oder der jeweilige Veranstalter ist für Inhalt, Preisangaben, Verfügbarkeit, Leistungserbringung und rechtliche Zulässigkeit der eigenen Werbung verantwortlich.",
      "Locario kann Werbung ablehnen, anpassen oder entfernen, wenn sie nicht zum Zweck der Plattform passt oder rechtliche, qualitative oder redaktionelle Risiken bestehen.",
    ],
  },
  {
    title: "8. Kundenanfragen und Leads",
    paragraphs: [
      "Locario kann Nutzerinnen und Nutzern ermöglichen, Anfragen an Firmen zu senden. Diese Anfragen können der jeweiligen Firma im Partner-Dashboard oder in anderer geeigneter Form angezeigt werden.",
      "Locario übernimmt keine Garantie dafür, dass aus einer Anfrage ein Auftrag, Kauf, Eventbesuch, Vertrag oder sonstiger geschäftlicher Erfolg entsteht.",
      "Firmen sind selbst verantwortlich für die Bearbeitung, Beantwortung und weitere Kommunikation mit anfragenden Personen.",
    ],
  },
  {
    title: "9. Pflichten von Firmen und Veranstaltern",
    paragraphs: [
      "Firmen und Veranstalter verpflichten sich, erhaltene Anfragen sorgfältig zu bearbeiten, keine missbräuchlichen Inhalte zu veröffentlichen, keine Rechte Dritter zu verletzen und keine falschen oder irreführenden Angaben zu machen.",
      "Zugangsdaten, Partner-Links und Admin- oder Dashboard-Zugänge sind vertraulich zu behandeln. Eine Weitergabe an unbefugte Dritte ist nicht erlaubt.",
    ],
  },
  {
    title: "10. Inhalte Dritter",
    paragraphs: [
      "Für Inhalte, Bilder, Texte, Logos, Angebote, Eventinformationen und Kontaktangaben, die von Firmen, Veranstaltern oder anderen Dritten bereitgestellt werden, sind diese selbst verantwortlich.",
      "Locario ist nicht verpflichtet, sämtliche Inhalte vor Veröffentlichung umfassend zu prüfen. Locario kann Inhalte jedoch nach eigenem Ermessen prüfen, bearbeiten, deaktivieren oder löschen.",
    ],
  },
  {
    title: "11. Preise und Zahlung",
    paragraphs: [
      "Preise, Laufzeiten und Zahlungsbedingungen richten sich nach dem jeweils vereinbarten Paket, Angebot oder Vertrag. Sofern nicht anders angegeben, verstehen sich Preise in Schweizer Franken.",
      "Locario kann Preise und Pakete für zukünftige Vertragsperioden anpassen. Bereits vereinbarte Leistungen bleiben für die vereinbarte Laufzeit nach Massgabe der jeweiligen Vereinbarung gültig.",
    ],
  },
  {
    title: "12. Laufzeit und Kündigung",
    paragraphs: [
      "Laufzeit und Kündigungsfristen richten sich nach der jeweiligen Vereinbarung mit der Firma oder dem Veranstalter.",
      "Ohne besondere Vereinbarung kann ein Paket jeweils auf Ende der laufenden Abrechnungsperiode gekündigt werden. Bereits bezahlte Beträge werden grundsätzlich nicht zurückerstattet, sofern keine zwingenden gesetzlichen Ansprüche bestehen.",
    ],
  },
  {
    title: "13. Verfügbarkeit und technische Änderungen",
    paragraphs: [
      "Locario bemüht sich um eine stabile und sichere Verfügbarkeit der Plattform. Eine unterbruchfreie Verfügbarkeit wird jedoch nicht garantiert.",
      "Wartung, technische Störungen, Sicherheitsmassnahmen, externe Einflüsse oder Weiterentwicklungen können zu Einschränkungen, Änderungen oder vorübergehenden Unterbrüchen führen.",
    ],
  },
  {
    title: "14. Datenschutz",
    paragraphs: [
      "Informationen zur Bearbeitung von Personendaten finden sich in der Datenschutzerklärung von Locario. Diese ist Bestandteil der Nutzung der Plattform.",
      "Bei Kundenanfragen werden die eingegebenen Daten an die betreffende Firma weitergegeben, damit diese die Anfrage bearbeiten kann.",
    ],
  },
  {
    title: "15. Haftung",
    paragraphs: [
      "Locario haftet, soweit gesetzlich zulässig, nur für direkte Schäden, die durch absichtliches oder grobfahrlässiges Verhalten verursacht wurden.",
      "Für Inhalte von Firmenprofilen, Eventeinträgen, Angeboten, externen Links, geschäftliche Abschlüsse zwischen Nutzerinnen und Nutzern und Firmen oder Veranstaltern, indirekte Schäden, entgangenen Gewinn, Datenverlust oder Folgeschäden wird keine Haftung übernommen, soweit gesetzlich zulässig.",
    ],
  },
  {
    title: "16. Geistiges Eigentum",
    paragraphs: [
      "Die Struktur, Gestaltung, Texte, Softwarebestandteile und sonstigen Inhalte von Locario sind geschützt, soweit sie rechtlich schützbar sind.",
      "Firmen und Veranstalter räumen Locario das Recht ein, bereitgestellte Inhalte, Logos, Bilder und Texte im Rahmen der Plattform darzustellen, zu bearbeiten, technisch anzupassen und für die Bewerbung des jeweiligen Eintrags zu verwenden.",
    ],
  },
  {
    title: "17. Änderungen der AGB",
    paragraphs: [
      "Locario kann diese AGB jederzeit anpassen. Für bestehende Vertragsverhältnisse gelten Änderungen ab Mitteilung oder ab der nächsten Vertragsperiode, sofern keine zwingenden gesetzlichen Regelungen entgegenstehen.",
      "Die jeweils aktuelle Version wird auf der Website veröffentlicht.",
    ],
  },
  {
    title: "18. Anwendbares Recht und Gerichtsstand",
    paragraphs: [
      "Es gilt Schweizer Recht. Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Betreibers von Locario.",
    ],
  },
  {
    title: "19. Stand",
    paragraphs: ["Stand: Juli 2026"],
  },
];

const legalLinks = [
  {
    href: "/impressum",
    label: "Impressum",
  },
  {
    href: "/datenschutz",
    label: "Datenschutz",
  },
  {
    href: "/",
    label: "Zur Startseite",
    primary: true,
  },
];

export default function AgbPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white sm:px-6 md:py-16">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
          Rechtliches
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
          Allgemeine Geschäftsbedingungen
        </h1>

        <p className="mt-6 max-w-3xl text-slate-300">
          Diese AGB regeln die Nutzung von Locario durch Firmen,
          Veranstalterinnen und Veranstalter sowie Nutzerinnen und Nutzer.
        </p>

        <div className="mt-10 space-y-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20 sm:p-8">
          {agbSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-black text-white">
                {section.title}
              </h2>

              {section.content && (
                <div className="mt-4 space-y-2 text-slate-300">
                  {section.content.map((line, index) => (
                    <p key={`${section.title}-${index}`}>{line}</p>
                  ))}
                </div>
              )}

              {section.paragraphs && (
                <div className="mt-4 space-y-4 text-slate-300">
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={`${section.title}-paragraph-${index}`}
                      className="leading-7"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.primary
                  ? "rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                  : "rounded-2xl border border-white/15 px-5 py-3 font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
