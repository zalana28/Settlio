"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  status: string;
  settlementHash: string | null;
  settlementDate: string | null;
  settlementFee: string | null;
  sellerId: string;
  buyerId: string;
  seller: { id: string; name: string };
  buyer: { id: string; name: string };
}

interface Me {
  id: string;
  name: string;
  email: string;
}

const TOWER_EXCHANGE_URL = "https://www.tower.exchange/";

export default function TreasuryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/auth/me").then((res) => res.json()),
      fetch("/api/invoices").then((res) => res.json()),
    ])
      .then(([meData, invoiceData]) => {
        if (cancelled) return;
        if (meData?.success) setMe(meData.data);
        if (invoiceData?.success) setInvoices(invoiceData.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const settledInvoices = useMemo(
    () => invoices.filter((i) => i.status === "settled"),
    [invoices]
  );

  const totals = useMemo(() => {
    const totalSettledValue = settledInvoices.reduce(
      (sum, i) => sum + parseFloat(i.amount || "0"),
      0
    );

    const usdcReceived = settledInvoices
      .filter(
        (i) =>
          i.currency === "USDC" && me && i.sellerId === me.id
      )
      .reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0);

    return { totalSettledValue, usdcReceived };
  }, [settledInvoices, me]);

  const recentReceipts = useMemo(() => {
    return [...settledInvoices]
      .sort((a, b) => {
        const ta = a.settlementDate ? new Date(a.settlementDate).getTime() : 0;
        const tb = b.settlementDate ? new Date(b.settlementDate).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 5);
  }, [settledInvoices]);

  if (loading) {
    return <div className="animate-pulse text-gray-500">Loading treasury...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Treasury</h1>
        <p className="text-gray-500 mt-1">
          Track settled value and prepare for stablecoin conversion via external
          liquidity routes.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Settled Value"
          value={`$${totals.totalSettledValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          color="green"
        />
        <StatCard
          label="USDC Received"
          value={`${totals.usdcReceived.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} USDC`}
          color="blue"
        />
        <StatCard
          label="Settled Invoices"
          value={settledInvoices.length.toString()}
        />
      </div>

      {/* Recent settlement receipts */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Settlement Receipts
          </h2>
        </div>
        {recentReceipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No settled invoices yet.{" "}
            <Link
              href="/dashboard/invoices"
              className="text-primary-600 hover:underline"
            >
              View invoices
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Counterparty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Settled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tx Hash
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReceipts.map((invoice) => {
                  const isSeller = me?.id === invoice.sellerId;
                  const counterparty = isSeller
                    ? invoice.buyer.name
                    : invoice.seller.name;
                  const direction = isSeller ? "from" : "to";
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {direction} {counterparty}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {parseFloat(invoice.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {invoice.currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {invoice.settlementDate
                          ? new Date(invoice.settlementDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">
                        {invoice.settlementHash
                          ? `${invoice.settlementHash.slice(
                              0,
                              10
                            )}...${invoice.settlementHash.slice(-6)}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Treasury & Convert section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Treasury &amp; Convert
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Convert received stablecoins via Tower Exchange, the leading
              liquidity venue on Arc.
            </p>
          </div>
          <a
            href={TOWER_EXCHANGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Swap on Tower
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
          <p>
            <span className="font-semibold">External liquidity route.</span>{" "}
            Settlio routes treasury conversion to{" "}
            <a
              href={TOWER_EXCHANGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-700"
            >
              Tower Exchange
            </a>{" "}
            rather than running an in-app DEX. Direct in-app conversion depends
            on the public availability of Tower API/SDK/router documentation;
            until those are published, swaps are executed on Tower&apos;s
            interface.
          </p>
        </div>
      </div>

      {/* Planned conversion cards */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Planned Conversions
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Preview of routes Settlio plans to support. Execution is not yet
          enabled in-app.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConversionCard
          from="USDC"
          to="EURC"
          description="Convert USD-denominated receipts into EUR-denominated stablecoin for European treasury operations."
        />
        <ConversionCard
          from="USDC"
          to="USDT"
          description="Bridge between major USD stablecoins to access broader Tower liquidity."
        />
        <ConversionCard
          from="USDC"
          to="Arc assets"
          description="Convert into supported Arc-native assets for ecosystem participation."
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "gray",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    gray: "bg-white border-gray-200",
    yellow: "bg-yellow-50 border-yellow-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
  };

  return (
    <div
      className={`p-6 rounded-xl border ${
        colorClasses[color] || colorClasses.gray
      }`}
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ConversionCard({
  from,
  to,
  description,
}: {
  from: string;
  to: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">
          {from}
        </span>
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
          {to}
        </span>
      </div>
      <p className="text-sm text-gray-600 flex-1">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-800 text-xs font-medium">
          Planned
        </span>
        <a
          href={TOWER_EXCHANGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Open Tower &rarr;
        </a>
      </div>
    </div>
  );
}
