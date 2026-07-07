import Link from "next/link";
import {
  getSubcategoriesForMainCategory,
  mainCategories,
} from "@/data/categories";
import { eventPlans } from "@/data/event-plans";
import { companyPlans } from "@/data/plans";

const systemAreas = [
  {
    title: "Firmenpakete",
    status: "Code",
    description:
      "Starter, Pro, Premium und Paketlogik kommen aktuell aus src/data/plans.ts.",
    href: "/admin/firmen",
  },
  {
    title: "Eventpakete",
    status: "Code",
    description:
      "Basic, Highlight und Premium kommen aktuell aus src/data/event-plans.ts.",
    href: "/admin/events",
  },
  {
    title: "Kategorien",
    status: "Code",
    description:
      "Haupt- und Unterkategorien werden aktuell in src/data/categories.ts gepflegt.",
    href: "/admin/suchanfragen",
  },
  {
    title: "Suchbegriffe",
    status: "Code",
    description:
      "Automatische Firmen- und Event-Suchbegriffe liegen in search-taxonomy.ts und event-search-taxonomy.ts.",
    href: "/admin/suchanfragen",
  },
  {
    title: "Firmen, Events und Leads",
    status: "Datenbank",
    description:
      "Operative Inhalte werden über Adminseiten gepflegt und in der lokalen Datenbank gespeichert.",
    href: "/admin",
  },
  {
    title: "Admin-Zugang",
    status: "MVP",
    description:
      "Login und Logout sind vorhanden. Benutzerrollen und Rechteverwaltung kommen später.",
    href: "/admin",
  },
];

const quickLinks = [
  {
    href: "/admin/firmen",
    title: "Firmenverwaltung",
    description:
      "Firmen, Pakete, Partner-Links, Bilder, Adresse und Werbung bearbeiten.",
  },
  {
    href: "/admin/events",
    title: "Eventverwaltung",
    description:
      "Events, Sichtbarkeit, Wochenpakete, Eventbilder und Adressen bearbeiten.",
  },
  {
    href: "/admin/firmenanfragen",
    title: "Firmen-Inbox",
    description: "Neue Firmen prüfen, kontaktieren, annehmen oder ablehnen.",
  },
  {
    href: "/admin/eventanfragen",
    title: "Event-Inbox",
    description: "Neue Events prüfen, kontaktieren, annehmen oder ablehnen.",
  },
  {
    href: "/admin/leads",
    title: "Lead-Inbox",
    description: "Kundenanfragen nachfassen und erledigen.",
  },
  {
    href: "/admin/suchanfragen",
    title: "Akquise-Cockpit",
    description: "0-Treffer und Nachfrage für Akquise auswerten.",
  },
];

const futureSettings = [
  {
    title: "Preise im Admin bearbeiten",
    description:
      "Pakete und Preise später direkt im Admin ändern, ohne Code anzupassen.",
    priority: "Später",
  },
  {
    title: "Kategorien verwalten",
    description:
      "Neue Branchen, Unterkategorien und Suchbegriffe direkt im Admin ergänzen.",
    priority: "Wichtig",
  },
  {
    title: "Regionen verwalten",
    description: "Orte, Nachbardörfer und Umkreislogik zentral steuern.",
    priority: "Wichtig",
  },
  {
    title: "Plattformtexte",
    description:
      "Startseite, Footer, AGB-Hinweise und Verkaufstexte im Admin pflegen.",
    priority: "Später",
  },
  {
    title: "Admin-Benutzer",
    description:
      "Mehrere Admin-Zugänge mit Rollen und Rechten verwalten.",
    priority: "Später",
  },
  {
    title: "Deployment-Migrationen",
    description:
      "Vor Livegang Datenbankschema sauber versionieren, ohne lokale Daten per Reset zu löschen.",
    priority: "Wichtig",
  },
];

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueValues(values: string[]) {
  const seenValues = new Set<string>();
  const uniqueItems: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();
    const normalizedValue = normalizeKey(cleanValue);

    if (!cleanValue || !normalizedValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueItems.push(cleanValue);
  });

  return uniqueItems;
}

function getSafeSubCategories(category: string) {
  return uniqueValues(getSubcategoriesForMainCategory(category));
}

export default function AdminSettingsPage() {
  const totalSubCategories = mainCategories.reduce((total, category) => {
    return total + getSafeSubCategories(category).length;
  }, 0);

  const largestCategories = [...mainCategories]
    .map((category) => {
      return {
        name: category,
        subCategories: getSafeSubCategories(category),
      };
    })
    .sort((firstCategory, secondCategory) => {
      return (
        secondCategory.subCategories.length - firstCategory.subCategories.length
      );
    });

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            System
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Admin{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Einstellungen
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Zentrale Übersicht über Locario-Konfiguration, Pakete, Kategorien,
            Datenbankbereiche und spätere Admin-Einstellungen. Diese Seite ist
            bewusst eine Orientierungshilfe, damit klar bleibt, was bereits im
            Admin bearbeitet wird und was aktuell noch im Code gepflegt wird.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-3xl border border-white/15 px-6 py-4 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
        >
          Zum Dashboard
        </Link>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <CompactMetric label="Firmenpakete" value={companyPlans.length} />
        <CompactMetric label="Eventpakete" value={eventPlans.length} />
        <CompactMetric label="Hauptkategorien" value={mainCategories.length} />
        <CompactMetric label="Unterkategorien" value={totalSubCategories} />
        <CompactMetric label="Status" value="MVP" variant="amber" />
        <CompactMetric label="Build" value="Grün" variant="emerald" />
      </div>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Systemstatus
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Was aktuell wie gesteuert wird
          </h2>

          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Alles mit Status Datenbank wird operativ über Locario gepflegt. Alles
            mit Status Code ist aktuell noch bewusst in Projektdateien fixiert.
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="hidden grid-cols-[minmax(0,1fr)_8rem_minmax(0,1.4fr)_8rem] gap-4 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
            <span>Bereich</span>
            <span>Status</span>
            <span>Hinweis</span>
            <span className="text-right">Öffnen</span>
          </div>

          {systemAreas.map((area) => (
            <SystemRow
              key={area.title}
              title={area.title}
              status={area.status}
              description={area.description}
              href={area.href}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 2xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Firmenpakete
            </p>

            <h2 className="mt-2 text-3xl font-black">Aktuelle Paketlogik</h2>

            <p className="mt-2 text-sm text-slate-400">
              Diese Pakete steuern Sichtbarkeit, Leads, Partner-Dashboard und
              Werbung.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {companyPlans.map((plan) => (
              <PlanCard
                key={plan.value}
                title={plan.label}
                value={plan.value}
                description={plan.description}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-amber-300">
              Eventpakete
            </p>

            <h2 className="mt-2 text-3xl font-black">Aktuelle Eventpakete</h2>

            <p className="mt-2 text-sm text-slate-400">
              Diese Pakete steuern Event-Sichtbarkeit und Hervorhebung.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {eventPlans.map((plan) => (
              <PlanCard
                key={plan.value}
                title={plan.label}
                value={plan.value}
                description={`${plan.description} · ${plan.price}`}
                variant="amber"
              />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Schnellzugriff
            </p>

            <h2 className="mt-2 text-3xl font-black">Admin-Bereiche</h2>

            <p className="mt-2 text-sm text-slate-400">
              Direkt zu den wichtigsten operativen Bereichen wechseln.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((quickLink) => (
            <QuickLink
              key={quickLink.href}
              href={quickLink.href}
              title={quickLink.title}
              description={quickLink.description}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Kategorien
          </p>

          <h2 className="mt-2 text-3xl font-black">Kategorienstruktur</h2>

          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Kategorien sind aktuell noch Code-basiert. Für den MVP ist das gut,
            weil die Struktur stabil bleibt. Später kann daraus ein eigener
            Admin-Bereich entstehen.
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="hidden grid-cols-[minmax(0,1fr)_8rem_minmax(0,2fr)] gap-4 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
            <span>Hauptkategorie</span>
            <span>Anzahl</span>
            <span>Beispiele</span>
          </div>

          {largestCategories.map((category) => (
            <CategoryRow
              key={category.name}
              name={category.name}
              subCategories={category.subCategories}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-5 shadow-2xl shadow-slate-950/20">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-amber-200">
            Roadmap
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Spätere echte Einstellungen
          </h2>

          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Diese Punkte sind sinnvoll, sobald Locario operativ läuft und du
            weniger direkt im Code ändern möchtest.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {futureSettings.map((setting) => (
            <FutureSetting
              key={setting.title}
              title={setting.title}
              description={setting.description}
              priority={setting.priority}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function CompactMetric({
  label,
  value,
  variant = "cyan",
}: {
  label: string;
  value: number | string;
  variant?: "cyan" | "emerald" | "amber" | "red";
}) {
  const valueClassName =
    variant === "emerald"
      ? "text-emerald-200"
      : variant === "amber"
        ? "text-amber-200"
        : variant === "red"
          ? "text-red-200"
          : "text-cyan-200";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-xl shadow-slate-950/10">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className={`mt-1 break-words text-3xl font-black ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function SystemRow({
  title,
  status,
  description,
  href,
}: {
  title: string;
  status: string;
  description: string;
  href: string;
}) {
  const statusClassName =
    status === "Datenbank"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : status === "MVP"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <Link
      href={href}
      className="grid gap-4 border-b border-white/10 bg-slate-950/40 px-4 py-4 transition last:border-b-0 hover:bg-white/[0.04] lg:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1.4fr)_8rem] lg:items-center"
    >
      <p className="font-black text-white">{title}</p>

      <span
        className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${statusClassName}`}
      >
        {status}
      </span>

      <p className="text-sm leading-6 text-slate-400">{description}</p>

      <p className="text-sm font-black text-cyan-200 lg:text-right">
        Öffnen →
      </p>
    </Link>
  );
}

function PlanCard({
  title,
  value,
  description,
  variant = "cyan",
}: {
  title: string;
  value: string;
  description: string;
  variant?: "cyan" | "amber";
}) {
  const className =
    variant === "amber"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h3 className="text-2xl font-black text-white">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {description}
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${className}`}
        >
          {value}
        </span>
      </div>
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <span className="shrink-0 text-sm font-black text-cyan-300">→</span>
      </div>
    </Link>
  );
}

function CategoryRow({
  name,
  subCategories,
}: {
  name: string;
  subCategories: string[];
}) {
  return (
    <div className="grid gap-4 border-b border-white/10 bg-slate-950/40 px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_8rem_minmax(0,2fr)] lg:items-start">
      <p className="font-black text-white">{name}</p>

      <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
        {subCategories.length}
      </span>

      <div className="flex flex-wrap gap-2">
        {subCategories.slice(0, 10).map((subCategory, index) => (
          <span
            key={`${normalizeKey(subCategory)}-${index}`}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
          >
            {subCategory}
          </span>
        ))}

        {subCategories.length > 10 && (
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-500">
            +{subCategories.length - 10} weitere
          </span>
        )}
      </div>
    </div>
  );
}

function FutureSetting({
  title,
  description,
  priority,
}: {
  title: string;
  description: string;
  priority: string;
}) {
  const isImportant = priority === "Wichtig";

  return (
    <article className="rounded-3xl border border-amber-300/20 bg-slate-950/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-black text-white">{title}</h3>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${
            isImportant
              ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
              : "border-white/10 bg-white/[0.06] text-slate-400"
          }`}
        >
          {priority}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </article>
  );
}
