"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface Broker {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  experienceYears: number | null;
  languages: string[];
  verificationStatus: string;
  tierHint: string | null;
  rating: number;
  reviewCount: number;
}

interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  author: string;
}

interface Agency {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  reraLicenseNumber: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  verificationStatus: string;
  createdAt: string;
  brokerCount: number;
  agencyRating: number;
  agencyReviewCount: number;
  brokerAvgRating: number;
  totalBrokerReviews: number;
  brokers: Broker[];
  reviews: Review[];
}

/* ─── ICONS ───────────────────────────────────────────────── */
const StarIcon = ({ filled, className = "h-5 w-5" }: { filled: boolean; className?: string }) => (
  <svg className={`${className} ${filled ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={`${className} text-emerald-500`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const GlobeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const PhoneIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const UsersIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CalendarIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const HomeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

/* ─── BROKER CARD ─────────────────────────────────────────── */
function BrokerCard({ broker }: { broker: Broker }) {
  return (
    <Link
      href={`/simsar/${broker.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-gray-300"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={broker.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
              alt={broker.name}
              className="h-16 w-16 rounded-xl object-cover border border-gray-100"
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"; }}
            />
            {broker.verificationStatus === "VERIFIED" && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
                <VerifiedIcon className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900 truncate">{broker.name}</h3>
              {broker.tierHint && (
                <span className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  broker.tierHint === "Platinum" ? "bg-slate-700 text-white" :
                  broker.tierHint === "Gold" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {broker.tierHint}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <StarIcon filled className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-700">{broker.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({broker.reviewCount})</span>
            </div>
            {broker.experienceYears && (
              <p className="mt-1 text-sm text-gray-500">{broker.experienceYears} years experience</p>
            )}
          </div>
        </div>
        {broker.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{broker.bio}</p>
        )}
        {broker.languages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {broker.languages.slice(0, 3).map((lang) => (
              <span key={lang} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {lang}
              </span>
            ))}
            {broker.languages.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                +{broker.languages.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── REVIEW CARD ─────────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  const initials = review.author.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-400 text-sm font-bold text-white">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{review.author}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= review.rating} className="h-4 w-4" />
              ))}
            </div>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date(review.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <p className="mt-3 text-gray-600 leading-relaxed">{review.text}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────── */
export default function AgencyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "brokers" | "reviews">("about");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setAgency(data);
        } else if (res.status === 404) {
          setAgency(null);
        } else {
          throw new Error("Failed to load agency");
        }
      } catch (error) {
        console.error("Failed to fetch agency:", error);
        setAgency(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgency();
  }, [params.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?redirect=/agency/${params.id}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${params.id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reviewForm),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      // Refresh agency data
      const agencyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${params.id}`);
      if (agencyRes.ok) {
        setAgency(await agencyRes.json());
      }

      setShowReviewModal(false);
      setReviewForm({ rating: 5, text: "" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate years in business
  const yearsInBusiness = agency ? Math.floor((Date.now() - new Date(agency.createdAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading agency...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Agency Not Found</h1>
          <p className="mt-2 text-gray-600">The agency you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/directory" className="mt-4 inline-block rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-800">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-lg font-bold text-white shadow-sm">
              M
            </div>
            <span className="text-xl font-bold text-gray-900">MySimsar</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/directory" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Find Simsars
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Agency Header Card */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* Banner */}
              <div className="relative h-40 sm:h-48 bg-gradient-to-r from-slate-800 to-slate-600">
                {agency.bannerUrl && (
                  <img
                    src={agency.bannerUrl}
                    alt={`${agency.name} banner`}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Agency Info */}
              <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
                {/* Logo */}
                <div className="-mt-12 mb-4 flex items-end gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg">
                    {agency.logoUrl ? (
                      <img src={agency.logoUrl} alt={agency.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800 text-2xl font-bold text-white">
                        {agency.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name and Verification */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
                      {agency.verificationStatus === "VERIFIED" && (
                        <VerifiedIcon className="h-6 w-6" />
                      )}
                    </div>
                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        <StarIcon filled className="h-5 w-5" />
                        <span className="text-lg font-bold text-gray-900">{agency.agencyRating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">({agency.agencyReviewCount} reviews)</span>
                    </div>
                    {/* Member Since */}
                    <p className="mt-1 text-sm text-gray-500">
                      Member since {new Date(agency.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {agency.phone && (
                    <a
                      href={`tel:${agency.phone}`}
                      className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-white transition-all hover:bg-emerald-600"
                    >
                      <PhoneIcon className="h-5 w-5" />
                      Call
                    </a>
                  )}
                  {agency.email && (
                    <a
                      href={`mailto:${agency.email}`}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <EmailIcon className="h-5 w-5" />
                      Email
                    </a>
                  )}
                  {agency.website && (
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <GlobeIcon className="h-5 w-5" />
                      Website
                    </a>
                  )}
                  {agency.phone && (
                    <a
                      href={`https://wa.me/${agency.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <HomeIcon className="mx-auto h-6 w-6 text-gray-400" />
                <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Active Listings</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <UsersIcon className="mx-auto h-6 w-6 text-gray-400" />
                <p className="mt-2 text-2xl font-bold text-gray-900">{agency.brokerCount}</p>
                <p className="text-sm text-gray-500">Brokers</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <CalendarIcon className="mx-auto h-6 w-6 text-gray-400" />
                <p className="mt-2 text-2xl font-bold text-gray-900">{yearsInBusiness}</p>
                <p className="text-sm text-gray-500">Years in Business</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4">
                <nav className="flex gap-6">
                  {[
                    { key: "about", label: "About" },
                    { key: "brokers", label: "Agents", count: agency.brokerCount },
                    { key: "reviews", label: "Reviews", count: agency.agencyReviewCount },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`relative py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? "text-amber-600"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="ml-1.5 text-gray-400">({tab.count})</span>
                      )}
                      {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-5">
                {activeTab === "about" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">About {agency.name}</h3>
                      <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-line">
                        {agency.bio || "No description available."}
                      </p>
                    </div>

                    {agency.reraLicenseNumber && (
                      <div>
                        <h3 className="font-semibold text-gray-900">RERA License</h3>
                        <p className="mt-1 text-gray-600">{agency.reraLicenseNumber}</p>
                      </div>
                    )}

                    {/* Featured Agents Preview */}
                    {agency.brokers.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Our Team</h3>
                          <button
                            onClick={() => setActiveTab("brokers")}
                            className="text-sm font-medium text-amber-600 hover:text-amber-700"
                          >
                            View All →
                          </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {agency.brokers.slice(0, 4).map((broker) => (
                            <BrokerCard key={broker.id} broker={broker} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "brokers" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-semibold text-gray-900">Our Agents</h3>
                        <p className="text-sm text-gray-500">Meet the professionals at {agency.name}</p>
                      </div>
                    </div>
                    {agency.brokers.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {agency.brokers.map((broker) => (
                          <BrokerCard key={broker.id} broker={broker} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
                        <UsersIcon className="mx-auto h-10 w-10 text-gray-300" />
                        <p className="mt-3 text-gray-500">No agents have joined this agency yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-semibold text-gray-900">Client Reviews</h3>
                        <p className="text-sm text-gray-500">What clients say about {agency.name}</p>
                      </div>
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                      >
                        Write a Review
                      </button>
                    </div>
                    {agency.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {agency.reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
                        <StarIcon filled={false} className="mx-auto h-10 w-10 text-gray-300" />
                        <p className="mt-3 text-gray-500">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Contact Agency</h3>
              <div className="mt-4 space-y-3">
                {agency.phone && (
                  <a
                    href={`tel:${agency.phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    Call
                  </a>
                )}
                {agency.email && (
                  <a
                    href={`mailto:${agency.email}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <EmailIcon className="h-5 w-5" />
                    Email
                  </a>
                )}
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total Brokers</dt>
                  <dd className="font-medium text-gray-900">{agency.brokerCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Agency Reviews</dt>
                  <dd className="font-medium text-gray-900">{agency.agencyReviewCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Broker Reviews</dt>
                  <dd className="font-medium text-gray-900">{agency.totalBrokerReviews}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Avg. Broker Rating</dt>
                  <dd className="flex items-center gap-1 font-medium text-gray-900">
                    <StarIcon filled className="h-4 w-4" />
                    {agency.brokerAvgRating.toFixed(1)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Member Since</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(agency.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </dd>
                </div>
                {agency.reraLicenseNumber && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">RERA License</dt>
                    <dd className="font-medium text-gray-900">{agency.reraLicenseNumber}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowReviewModal(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
            <p className="mt-1 text-sm text-gray-600">Share your experience with {agency.name}</p>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {submitError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{submitError}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <svg
                        className={`h-7 w-7 ${star <= reviewForm.rating ? "text-amber-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="Share your experience working with this agency..."
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reviewForm.text.length < 10}
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
