"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Admin-Login ist fehlgeschlagen."
        );
      }

      window.location.href = "/admin";
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Beim Login ist ein unbekannter Fehler passiert.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/30">
        <p className="text-sm font-semibold text-cyan-300">Neario Admin</p>

        <h1 className="mt-3 text-4xl font-bold">Admin-Login</h1>

        <p className="mt-4 text-slate-300">
          Melde dich an, um Firmen, Firmenanfragen, Leads und Suchdaten zu
          verwalten.
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-300">
              Admin-Passwort
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Passwort eingeben"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Login läuft..." : "Einloggen"}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          Zurück zur Startseite
        </a>
      </section>
    </main>
  );
}