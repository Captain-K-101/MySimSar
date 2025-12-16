"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type BrokerType = "INDIVIDUAL" | "AGENCY";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  
  const [step, setStep] = useState<1 | 2>(1);
  const [brokerType, setBrokerType] = useState<BrokerType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: roleParam === "broker" ? "BROKER" : "USER",
    // Agency fields
    agencyName: "",
    agencyBio: "",
    agencyReraLicense: "",
    agencyWebsite: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          // Include agency data if creating an agency
          ...(formData.role === "BROKER" && brokerType === "AGENCY" && {
            createAgency: true,
            agencyName: formData.agencyName,
            agencyBio: formData.agencyBio || undefined,
            agencyReraLicense: formData.agencyReraLicense || undefined,
            agencyWebsite: formData.agencyWebsite || undefined,
          }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to login on success
      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrokerTypeSelect = (type: BrokerType) => {
    setBrokerType(type);
    setStep(2);
  };

  const handleRoleChange = (role: "USER" | "BROKER") => {
    setFormData({ ...formData, role });
    if (role === "USER") {
      setBrokerType(null);
      setStep(1);
    }
  };

  // Step 1: Choose broker type (only for brokers)
  if (formData.role === "BROKER" && step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="MySimsar" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold text-gray-900">MySimsar</span>
            </Link>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-2xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">How will you operate?</h1>
                <p className="mt-2 text-gray-600">
                  Choose the type of broker account that fits your business
                </p>
              </div>

              <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Individual Broker Option */}
                <button
                  onClick={() => handleBrokerTypeSelect("INDIVIDUAL")}
                  className="group relative rounded-xl border-2 border-gray-200 p-6 text-left transition-all hover:border-amber-400 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">Individual Broker</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Perfect for independent real estate agents. Build your personal brand and collect reviews directly.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Personal profile & portfolio
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Individual verification
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Direct client reviews
                    </li>
                  </ul>
                </button>

                {/* Agency Option */}
                <button
                  onClick={() => handleBrokerTypeSelect("AGENCY")}
                  className="group relative rounded-xl border-2 border-gray-200 p-6 text-left transition-all hover:border-amber-400 hover:shadow-lg"
                >
                  <div className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    Premium
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">Real Estate Agency</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    For agencies with multiple brokers. Manage your team, showcase combined portfolio, and build agency reputation.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Agency branding (logo, banner)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Add & manage brokers
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Combined portfolio view
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Agency + broker reviews
                    </li>
                  </ul>
                </button>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => handleRoleChange("USER")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Not a broker? Register as a client instead
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="MySimsar" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold text-gray-900">MySimsar</span>
          </Link>
        </div>
      </header>

      {/* Register Form */}
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {brokerType === "AGENCY" ? "Create your agency" : "Create your account"}
              </h1>
              <p className="mt-2 text-gray-600">
                {formData.role === "BROKER" 
                  ? brokerType === "AGENCY"
                    ? "Set up your real estate agency on MySimsar"
                    : "Join as a verified simsar on MySimsar" 
                  : "Start finding trusted simsars today"}
              </p>
            </div>

            {/* Role Tabs (only show for non-agency) */}
            {brokerType !== "AGENCY" && (
              <div className="mt-6 flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => handleRoleChange("USER")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    formData.role === "USER"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  I&apos;m a Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: "BROKER" });
                    setStep(1);
                  }}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    formData.role === "BROKER"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  I&apos;m a Simsar
                </button>
              </div>
            )}

            {/* Back button for agency registration */}
            {brokerType === "AGENCY" && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change broker type
              </button>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Agency fields */}
              {brokerType === "AGENCY" && (
                <>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h3 className="font-medium text-amber-900">Agency Details</h3>
                    <p className="mt-1 text-xs text-amber-700">This information will appear on your agency profile</p>
                  </div>

                  <div>
                    <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
                      Agency Name *
                    </label>
                    <input
                      id="agencyName"
                      type="text"
                      required
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="Gulf Premier Properties"
                    />
                  </div>

                  <div>
                    <label htmlFor="agencyBio" className="block text-sm font-medium text-gray-700">
                      Agency Description
                    </label>
                    <textarea
                      id="agencyBio"
                      rows={3}
                      value={formData.agencyBio}
                      onChange={(e) => setFormData({ ...formData, agencyBio: e.target.value })}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="Tell clients about your agency..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="agencyReraLicense" className="block text-sm font-medium text-gray-700">
                        RERA License
                      </label>
                      <input
                        id="agencyReraLicense"
                        type="text"
                        value={formData.agencyReraLicense}
                        onChange={(e) => setFormData({ ...formData, agencyReraLicense: e.target.value })}
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="RERA-AGY-XXXXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="agencyWebsite" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        id="agencyWebsite"
                        type="url"
                        value={formData.agencyWebsite}
                        onChange={(e) => setFormData({ ...formData, agencyWebsite: e.target.value })}
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-medium text-slate-900">Your Account</h3>
                    <p className="mt-1 text-xs text-slate-600">You&apos;ll be the agency owner/admin</p>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {brokerType === "AGENCY" ? "Your Name (Agency Owner)" : "Full Name"} *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>

              {formData.role === "BROKER" && brokerType !== "AGENCY" && (
                <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  <strong>Note:</strong> After registration, you&apos;ll need to complete your profile and submit documents for verification before appearing in the directory.
                </div>
              )}

              {brokerType === "AGENCY" && (
                <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                  <strong>What&apos;s next?</strong> After registration, you can add your agency&apos;s logo, banner, and start inviting brokers to join your team.
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  brokerType === "AGENCY" 
                    ? "Create Agency Account" 
                    : formData.role === "BROKER" 
                      ? "Create Simsar Account" 
                      : "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-500">                                                              
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
