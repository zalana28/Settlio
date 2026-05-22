"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEMO_ACCOUNTS = [
  {
    label: "Seller",
    email: "seller@arcsettle.dev",
    password: "password123",
    description: "Issues invoices and receives USDC",
  },
  {
    label: "Buyer",
    email: "buyer@arcsettle.dev",
    password: "password123",
    description: "Approves and pays invoices",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setForm({ email, password });
    setError("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle ambient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative flex min-h-screen flex-col px-4 py-10 sm:px-6">
        {/* Top brand bar */}
        <div className="mx-auto w-full max-w-md mb-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Sett<span className="text-primary-600">lio</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            &larr; Home
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Arc Testnet &middot; USDC settlement
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              B2B invoice settlement with USDC on Arc Testnet.
            </p>
          </div>

          {/* Login card */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl shadow-indigo-500/5"
          >
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
                  placeholder="company@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="mt-5 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Demo accounts
              </h2>
              <span className="text-xs text-gray-400">Click to autofill</span>
            </div>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email, account.password)}
                  className="group flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:border-primary-200 hover:bg-primary-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">
                        {account.label}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 ring-1 ring-gray-200">
                        Demo
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {account.email} &middot; {account.description}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Demo Flow */}
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-800">
              Demo flow
            </h3>
            <ol className="space-y-2 text-sm text-indigo-900">
              <DemoStep n={1}>
                Create an invoice as the <strong>Seller</strong>
              </DemoStep>
              <DemoStep n={2}>
                Approve it as the <strong>Buyer</strong>
              </DemoStep>
              <DemoStep n={3}>
                Connect wallet and pay on <strong>Arc Testnet</strong>
              </DemoStep>
              <DemoStep n={4}>
                View the settlement receipt and transaction details
              </DemoStep>
            </ol>
            <p className="mt-4 border-t border-indigo-200/60 pt-3 text-xs leading-relaxed text-indigo-700">
              This is a testnet MVP. Real wallet settlement uses Arc Testnet,
              not mainnet funds. Mock settlement is local/demo-only when
              explicitly enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
