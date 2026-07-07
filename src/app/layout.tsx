import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Locario | Lokale Firmen & Events entdecken",
    template: "%s | Locario",
  },
  description:
    "Locario ist ein lokales Portal für regionale Firmen, KMUs, Dienstleister, Händler und Events.",
  applicationName: "Locario",
  keywords: [
    "Locario",
    "lokale Firmen",
    "regionale Anbieter",
    "KMU",
    "Events",
    "Veranstaltungen",
    "lokale Suche",
  ],
  openGraph: {
    title: "Locario | Lokale Firmen & Events entdecken",
    description:
      "Finde regionale Firmen, Dienstleister, Händler und Events an einem Ort.",
    type: "website",
    locale: "de_CH",
    siteName: "Locario",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const footerActions = [
  {
    href: "/suche",
    label: "Suche starten",
    variant: "secondary",
  },
  {
    href: "/events",
    label: "Events ansehen",
    variant: "secondary",
  },
  {
    href: "/fuer-firmen",
    label: "Firma oder Event eintragen",
    variant: "primary",
  },
];

const platformLinks = [
  {
    href: "/",
    label: "Startseite",
  },
  {
    href: "/suche",
    label: "Suche",
  },
  {
    href: "/firmen",
    label: "Firmen",
  },
  {
    href: "/events",
    label: "Events",
  },
  {
    href: "/fuer-firmen",
    label: "Für Firmen & Veranstalter",
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
    href: "/agb",
    label: "AGB",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body className="bg-slate-950 text-white antialiased">
        <Header />

        {children}

        <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute right-[-10rem] bottom-[-10rem] h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:grid-cols-[1.2fr_0.8fr_0.8fr] md:p-8">
              <div>
                <Link href="/" className="group inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
                    L
                  </div>

                  <div>
                    <p className="text-2xl font-black tracking-tight">
                      Locario
                    </p>
                    <p className="-mt-1 text-xs font-medium text-slate-400">
                      Lokale Firmen & Events
                    </p>
                  </div>
                </Link>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                  Locario verbindet lokale Suchanfragen mit passenden regionalen
                  Firmen, KMUs, Dienstleistern, Händlern und Events.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {footerActions.map((action, actionIndex) => {
                    const isPrimary = action.variant === "primary";

                    return (
                      <Link
                        key={`${action.href}-${actionIndex}`}
                        href={action.href}
                        className={
                          isPrimary
                            ? "rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-5 py-3 text-center text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                            : "rounded-2xl border border-white/15 px-5 py-3 text-center text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                        }
                      >
                        {action.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <FooterLinkGroup title="Plattform" links={platformLinks} />
              <FooterLinkGroup title="Rechtliches" links={legalLinks} />
            </div>

            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 md:flex-row md:items-center">
              <p>
                © {new Date().getFullYear()} Locario. Alle Rechte vorbehalten.
              </p>

              <p>
                Lokale Suche, Events und digitale Sichtbarkeit für regionale
                Anbieter.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: {
    href: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
        {title}
      </p>

      <nav className="mt-5 grid gap-3 text-sm font-semibold text-slate-300">
        {links.map((link, linkIndex) => (
          <Link
            key={`${link.href}-${linkIndex}`}
            href={link.href}
            className="transition hover:text-cyan-200"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
