import Link from "next/link";

const operator = {
  companyName: "Lovaro GmbH",
  responsiblePerson: "Marco Rieder",
  street: "ADRESSE ERGÄNZEN",
  zipCity: "PLZ ORT ERGÄNZEN",
  country: "Schweiz",
  email: "info@locario.ch",
  phone: "TELEFON ERGÄNZEN",
  website: "www.locario.ch",
  uid: "CHE-XXX.XXX.XXX",
  legalForm: "GmbH",
  registeredOffice: "SITZ ERGÄNZEN, Schweiz",
  commercialRegister: "Handelsregistereintrag ergänzen",
};

const legalLinks = [
  {
    href: "/datenschutz",
    label: "Datenschutz",
  },
  {
    href: "/agb",
    label: "AGB",
  },
  {
    href: "/",
    label: "Zur Startseite",
    primary: true,
  },
];

function getMailtoHref(email: string) {
  return `mailto:${email}`;
}

function getWebsiteHref(website: string) {
  const trimmedWebsite = website.trim();

  if (!trimmedWebsite) {
    return "/";
  }

  if (
    trimmedWebsite.startsWith("http://") ||
    trimmedWebsite.startsWith("https://")
  ) {
    return trimmedWebsite;
  }

  return `https://${trimmedWebsite}`;
}

export default function ImpressumPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-12 text-white sm:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-[-14rem] top-[12rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-5xl">
        <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Rechtliches
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
          Impressum
        </h1>

        <p className="mt-5 max-w-3xl text-slate-300">
          Angaben zum Betreiber der Plattform Locario und rechtliche Hinweise
          zur Nutzung dieser Website.
        </p>

        <div className="mt-8 rounded-3xl border border-amber-300/25 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">
          <p className="font-black">Wichtig vor Veröffentlichung</p>
          <p className="mt-2">
            Die Felder mit „ERGÄNZEN“ müssen vor dem öffentlichen Einsatz mit
            den korrekten Unternehmensangaben ersetzt werden.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Betreiber
            </p>

            <h2 className="mt-3 text-3xl font-black">{operator.companyName}</h2>

            <div className="mt-5 space-y-2 text-slate-300">
              <p>{operator.responsiblePerson}</p>
              <p>{operator.street}</p>
              <p>{operator.zipCity}</p>
              <p>{operator.country}</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Kontakt
            </p>

            <div className="mt-5 space-y-3 text-slate-300">
              <p>
                E-Mail: {" "}
                <a
                  href={getMailtoHref(operator.email)}
                  className="font-bold text-cyan-200 transition hover:text-cyan-100"
                >
                  {operator.email}
                </a>
              </p>

              <p>Telefon: {operator.phone}</p>

              <p>
                Website: {" "}
                <a
                  href={getWebsiteHref(operator.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-cyan-200 transition hover:text-cyan-100"
                >
                  {operator.website}
                </a>
              </p>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Unternehmensangaben
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoBox title="UID" value={operator.uid} />
            <InfoBox title="Rechtsform" value={operator.legalForm} />
            <InfoBox title="Sitz" value={operator.registeredOffice} />
            <InfoBox
              title="Handelsregister"
              value={operator.commercialRegister}
            />
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Verantwortlich für den Inhalt
          </p>

          <div className="mt-5 space-y-2 text-slate-300">
            <p>{operator.responsiblePerson}</p>
            <p>
              E-Mail: {" "}
              <a
                href={getMailtoHref(operator.email)}
                className="font-bold text-cyan-200 transition hover:text-cyan-100"
              >
                {operator.email}
              </a>
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <LegalTextCard title="Haftungsausschluss">
            Locario stellt Informationen über regionale Firmen, Angebote,
            Dienstleistungen, Veranstaltungen und Kontaktmöglichkeiten bereit.
            Trotz sorgfältiger Prüfung übernehmen wir keine Gewähr für die
            Aktualität, Richtigkeit und Vollständigkeit der bereitgestellten
            Informationen. Für Inhalte von eingetragenen Firmen und Events sind
            die jeweiligen Anbieter und Veranstalter selbst verantwortlich.
          </LegalTextCard>

          <LegalTextCard title="Externe Links">
            Diese Website kann Links zu externen Websites enthalten. Für den
            Inhalt externer Seiten übernehmen wir keine Verantwortung. Für den
            Inhalt verlinkter Seiten sind ausschliesslich deren Betreiber
            verantwortlich.
          </LegalTextCard>

          <LegalTextCard title="Urheberrechte">
            Die Inhalte, Struktur, Gestaltung und Texte dieser Website sind,
            soweit rechtlich möglich, urheberrechtlich geschützt. Eine
            Verwendung ohne Zustimmung des Betreibers ist nicht gestattet.
          </LegalTextCard>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.primary
                  ? "rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-5 py-3 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  : "rounded-2xl border border-white/15 px-5 py-3 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function LegalTextCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{children}</p>
    </section>
  );
}
