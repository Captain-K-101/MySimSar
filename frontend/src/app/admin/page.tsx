"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface Stats {
  totalUsers: number;
  totalBrokers: number;
  verifiedBrokers: number;
  pendingVerifications: number;
  pendingClaims: number;
  totalReviews: number;
}

interface VerificationRequest {
  id: string;
  status: string;
  submittedAt: string;
  simsar: {
    id: string;
    name: string;
    user: { email: string };
  };
}

interface Claim {
  id: string;
  status: string;
  createdAt: string;
  user: { email: string };
  simsar: { name: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "verifications" | "claims">("overview");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.replace("/login?redirect=/admin");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, verificationsRes, claimsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/admin/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/admin/verifications`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/admin/claims`, { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (verificationsRes.ok) setVerifications(await verificationsRes.json());
      if (claimsRes.ok) setClaims(await claimsRes.json());
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationDecision = async (id: string, status: "VERIFIED" | "REJECTED") => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/admin/verifications/${id}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        setSuccess(`Verification ${status.toLowerCase()}`);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Failed to process verification:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimDecision = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/admin/claims/${id}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        setSuccess(`Claim ${status.toLowerCase()}`);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Failed to process claim:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 text-sm font-bold text-white">
                M
              </div>
              <span className="font-bold text-gray-900">MySimsar Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white p-4 min-h-[calc(100vh-4rem)]">
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "verifications", label: "Verifications", badge: verifications.length },
              { id: "claims", label: "Claims", badge: claims.length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon} {item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {success && (
            <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
              {success}
            </div>
          )}

          {activeTab === "overview" && stats && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Total Users", value: stats.totalUsers, color: "bg-blue-500" },
                  { label: "Total Brokers", value: stats.totalBrokers, color: "bg-emerald-500" },
                  { label: "Verified Brokers", value: stats.verifiedBrokers, color: "bg-amber-500" },
                  { label: "Pending Verifications", value: stats.pendingVerifications, color: "bg-red-500" },
                  { label: "Pending Claims", value: stats.pendingClaims, color: "bg-purple-500" },
                  { label: "Total Reviews", value: stats.totalReviews, color: "bg-slate-500" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} text-white`}>
                      {stat.value}
                    </div>
                    <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "verifications" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Verifications</h1>
              <div className="mt-6 space-y-4">
                {verifications.length === 0 ? (
                  <p className="text-gray-500">No pending verifications</p>
                ) : (
                  verifications.map((v) => (
                    <div key={v.id} className="rounded-xl border border-gray-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{v.simsar.name}</h3>
                          <p className="text-sm text-gray-500">{v.simsar.user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {new Date(v.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerificationDecision(v.id, "VERIFIED")}
                            disabled={actionLoading === v.id}
                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerificationDecision(v.id, "REJECTED")}
                            disabled={actionLoading === v.id}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "claims" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Claims</h1>
              <div className="mt-6 space-y-4">
                {claims.length === 0 ? (
                  <p className="text-gray-500">No pending claims</p>
                ) : (
                  claims.map((c) => (
                    <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Claim for {c.simsar.name}</h3>
                          <p className="text-sm text-gray-500">By: {c.user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleClaimDecision(c.id, "APPROVED")}
                            disabled={actionLoading === c.id}
                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleClaimDecision(c.id, "REJECTED")}
                            disabled={actionLoading === c.id}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

