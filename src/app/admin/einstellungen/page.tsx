import Link from "next/link";
import {
  getSubcategoriesForMainCategory,
  mainCategories,
} from "@/data/categories";
import { companyPlans } from "@/data/plans";

export default function AdminSettingsPage() {
  const totalSubCategories = mainCategories.reduce((total, category) => {
    return total + getSubcategoriesForMainCategory(category).length;
  }, 0);

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Einstellungen
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Admin{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Einstellungen
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Hier entsteht später der zentrale Bereich für Plattformtexte,
            Pakete, Kategorien, Preise und weitere Locario-Einstellungen.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Pakete"
          value={companyPlans.length.toString()}
          description="Aktive Paketstufen"
        />

        <AdminStatCard
          title="Hauptkategorien"
          value={mainCategories.length.toString()}
          description="Branchenbereiche"
        />

        <AdminStatCard
          title="Unterkategorien"
          value={totalSubCategories.toString()}
          description="Leistungen und Branchen"
        />

        <AdminStatCard
          title="Status"
          value="MVP"
          description="Plattform im Aufbau"
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Paketübersicht
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Aktuelle Locario-Pakete
          </h2>

          <p className="mt-3 text-slate-400">
            Diese Pakete werden aktuell in der Plattform verwendet. Später
            können Preise, Leistungen und Sichtbarkeit hier direkt bearbeitet
            werden.
          </p>

          <div className="mt-6 grid gap-4">
            {companyPlans.map((plan) => (
              <article
                key={plan.value}
                className="rounded-3xl border border-white/10 bg-slate-950/50 p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-2xl font-black">{plan.label}</h3>

                    <p className="mt-2 text-slate-300">{plan.description}</p>
                  </div>

                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                    {plan.value}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Schnellzugriff
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Wichtige Admin-Bereiche
          </h2>

          <p className="mt-3 text-slate-400">
            Von hier kommst du schnell zu den wichtigsten Verwaltungsseiten.
          </p>

          <div className="mt-6 grid gap-4">
            <QuickLink
              href="/admin/firmen"
              title="Firmen verwalten"
              description="Firmenprofile, Pakete, Suchbegriffe und Werbung bearbeiten."
            />

            <QuickLink
              href="/admin/firmenanfragen"
              title="Firmenanfragen prüfen"
              description="Neue Firmen prüfen und als Firma veröffentlichen."
            />

            <QuickLink
              href="/admin/leads"
              title="Leads ansehen"
              description="Kundenanfragen und Kontaktmöglichkeiten prüfen."
            />

            <QuickLink
              href="/admin/suchanfragen"
              title="Suchanalyse öffnen"
              description="Top-Suchen und Akquise-Chancen erkennen."
            />
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
          Kategorien
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Aktuelle Kategorienstruktur
        </h2>

        <p className="mt-3 max-w-3xl text-slate-400">
          Die Kategorien kommen aktuell noch aus der Datei{" "}
          <span className="font-semibold text-slate-200">
            src/data/categories.ts
          </span>
          . Später kann daraus ein Admin-Bereich entstehen, in dem du
          Hauptkategorien und Unterkategorien direkt bearbeiten kannst.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mainCategories.map((category) => {
            const subCategories = getSubcategoriesForMainCategory(category);

            return (
              <article
                key={category}
                className="rounded-3xl border border-white/10 bg-slate-950/50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-black">{category}</h3>

                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                    {subCategories.length}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {subCategories.slice(0, 8).map((subCategory) => (
                    <span
                      key={subCategory}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
                    >
                      {subCategory}
                    </span>
                  ))}

                  {subCategories.length > 8 && (
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-400">
                      +{subCategories.length - 8} weitere
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 shadow-2xl shadow-slate-950/20">
        <p className="text-sm font-black uppercase tracking-wide text-amber-200">
          Später ausbauen
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Mögliche nächste Einstellungen
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FutureSetting
            title="Preise bearbeiten"
            description="Starter, Pro und Premium direkt im Admin preislich anpassen."
          />

          <FutureSetting
            title="Kategorien verwalten"
            description="Neue Branchen, Unterkategorien und Suchbegriffe ohne Code ergänzen."
          />

          <FutureSetting
            title="Plattformtexte"
            description="Startseiten-Texte, Footer-Texte und rechtliche Hinweise zentral ändern."
          />

          <FutureSetting
            title="Admin-Benutzer"
            description="Später mehrere Admin-Zugänge mit Rollen und Rechten verwalten."
          />

          <FutureSetting
            title="Regionen"
            description="Nachbardörfer, Orte und Suchumgebung direkt im Admin pflegen."
          />

          <FutureSetting
            title="SEO"
            description="Seitentitel, Beschreibungen und Indexierung pro Seite steuern."
          />
        </div>
      </section>
    </section>
  );
}

function AdminStatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
      <p className="text-sm font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-4 text-5xl font-black text-cyan-200">{value}</p>

      <p className="mt-3 text-sm text-slate-300">{description}</p>
    </article>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
    >
      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </Link>
  );
}

function FutureSetting({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-amber-300/20 bg-slate-950/50 p-5">
      <h3 className="text-xl font-black text-amber-100">{title}</h3>

      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </article>
  );
}
