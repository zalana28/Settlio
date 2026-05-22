"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/constants";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  status: string;
  seller: { name: string };
  buyer: { name: string };
  createdAt: string;
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInvoices(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: invoices.length,
    pending: invoices.filter((i) => i.status === "pending_approval").length,
    approved: invoices.filter((i) => i.status === "approved").length,
    settled: invoices.filter((i) => i.status === "settled").length,
    totalVolume: invoices
      .filter((i) => i.status === "settled")
      .reduce((sum, i) => sum + parseFloat(i.amount), 0),
  };

  if (loading) {
    return (
      <div className="animate-pulse text-gray-500">Loading dashboard...</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Arc Testnet &middot; USDC settlement
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your invoice activity
          </p>
        </div>
        <Link
          href="/dashboard/invoices/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Invoices"
          value={stats.total.toString()}
          tone="slate"
          icon={<DocumentIcon />}
        />
        <StatCard
          label="Pending Approval"
          value={stats.pending.toString()}
          tone="amber"
          icon={<ClockIcon />}
        />
        <StatCard
          label="Ready to Settle"
          value={stats.approved.toString()}
          tone="blue"
          icon={<CheckBadgeIcon />}
        />
        <StatCard
          label="Settled Volume"
          value={`$${stats.totalVolume.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          tone="emerald"
          icon={<CashIcon />}
        />
      </div>

      {/* Treasury CTA */}
      <Link
        href="/dashboard/treasury"
        className="group mb-8 flex items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-5 transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-100">
            <VaultIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Manage received USDC and future conversions in Treasury
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Track settled value and prepare stablecoin conversion via external
              liquidity routes.
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 text-sm font-medium text-indigo-600 sm:inline-flex">
          Open Treasury
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
        </span>
      </Link>

      {/* Recent Invoices */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Recent invoices
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Your five most recent invoices across all statuses.
            </p>
          </div>
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            View all
          </Link>
        </div>
        {invoices.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <DocumentIcon />
            </div>
            <p className="text-sm text-gray-500">
              No invoices yet.{" "}
              <Link
                href="/dashboard/invoices/create"
                className="font-medium text-primary-600 hover:underline"
              >
                Create your first invoice
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/70">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Counterparty
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.slice(0, 5).map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-sm font-medium text-primary-600 hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {invoice.seller.name}
                      </span>
                      <span className="mx-1.5 text-gray-300">&rarr;</span>
                      <span className="text-gray-700">
                        {invoice.buyer.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {parseFloat(invoice.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs font-medium text-gray-500">
                        {invoice.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          INVOICE_STATUS_COLORS[invoice.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {INVOICE_STATUS_LABELS[invoice.status] ||
                          invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type StatTone = "slate" | "amber" | "blue" | "emerald";

function StatCard({
  label,
  value,
  tone = "slate",
  icon,
}: {
  label: string;
  value: string;
  tone?: StatTone;
  icon?: React.ReactNode;
}) {
  const toneStyles: Record<
    StatTone,
    { card: string; icon: string; accent: string }
  > = {
    slate: {
      card: "from-white to-slate-50 border-slate-200",
      icon: "bg-slate-100 text-slate-600",
      accent: "text-slate-700",
    },
    amber: {
      card: "from-white to-amber-50 border-amber-200",
      icon: "bg-amber-100 text-amber-700",
      accent: "text-amber-700",
    },
    blue: {
      card: "from-white to-blue-50 border-blue-200",
      icon: "bg-blue-100 text-blue-700",
      accent: "text-blue-700",
    },
    emerald: {
      card: "from-white to-emerald-50 border-emerald-200",
      icon: "bg-emerald-100 text-emerald-700",
      accent: "text-emerald-700",
    },
  };

  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${styles.card}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        {icon && (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon}`}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7l9-4 9 4M5 9v8a2 2 0 002 2h10a2 2 0 002-2V9M9 21V12h6v9"
      />
    </svg>
  );
}
