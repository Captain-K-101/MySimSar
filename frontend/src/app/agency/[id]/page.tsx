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

// Icons
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg className={`h-5 w-5 ${filled ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function BrokerCard({ broker }: { broker: Broker }) {
  return (
    <Link
      href={`/simsar/${broker.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <img
            src={broker.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
            alt={broker.name}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{broker.name}</h3>
              {broker.verificationStatus === "VERIFIED" && <VerifiedIcon />}
            </div>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= Math.round(broker.rating)} />
              ))}
              <span className="ml-1 text-sm font-medium text-gray-700">{broker.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({broker.reviewCount})</span>
            </div>
            {broker.experienceYears && (
              <p className="mt-1 text-sm text-gray-500">{broker.experienceYears} years experience</p>
            )}
          </div>
        </div>
        {broker.bio && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{broker.bio}</p>
        )}
        {broker.languages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {broker.languages.slice(0, 3).map((lang) => (
              <span key={lang} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {lang}
              </span>
            ))}
          </div>
        )}
        {broker.tierHint && (
          <div className="absolute right-4 top-4">
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
              broker.tierHint === "Platinum" ? "bg-slate-800 text-white" :
              broker.tierHint === "Gold" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {broker.tierHint}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-semibold text-gray-900">{review.author}</span>
          <p className="text-sm text-gray-500">
            {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= review.rating} />
          ))}
        </div>
      </div>
      <p className="mt-4 text-gray-600">{review.text}</p>
    </div>
  );
}

export default function AgencyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading agency...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Agency Header with Banner */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Banner */}
          <div className="relative h-48 bg-gradient-to-r from-slate-800 to-slate-700 md:h-64">
            {agency.bannerUrl && (
              <img
                src={agency.bannerUrl}
                alt={`${agency.name} banner`}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Agency Info */}
          <div className="relative px-6 pb-6 lg:px-8">
            {/* Logo */}
            <div className="-mt-16 mb-4 flex items-end gap-6">
              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg">
                {agency.logoUrl ? (
                  <img src={agency.logoUrl} alt={agency.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800 text-3xl font-bold text-white">
                    {agency.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="mb-2 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{agency.name}</h1>
                  {agency.verificationStatus === "VERIFIED" && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                      <VerifiedIcon />
                      Verified Agency
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {agency.brokerCount} Brokers
                  </span>
                  {agency.reraLicenseNumber && (
                    <span>RERA: {agency.reraLicenseNumber}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Stats */}
            <div className="mt-4 flex flex-wrap gap-6">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Agency Rating</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{agency.agencyRating.toFixed(1)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= Math.round(agency.agencyRating)} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({agency.agencyReviewCount} reviews)</span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Avg. Broker Rating</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{agency.brokerAvgRating.toFixed(1)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= Math.round(agency.brokerAvgRating)} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({agency.totalBrokerReviews} broker reviews)</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-4 flex flex-wrap gap-4">
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                >
                  <GlobeIcon />
                  Website
                </a>
              )}
              {agency.phone && (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <PhoneIcon />
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <EmailIcon />
                  {agency.email}
                </a>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-100 bg-white px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { key: "about", label: "About" },
                { key: "brokers", label: `Brokers (${agency.brokerCount})` },
                { key: "reviews", label: `Reviews (${agency.agencyReviewCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === tab.key
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "about" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h2 className="text-xl font-bold text-gray-900">About {agency.name}</h2>
                  <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">
                    {agency.bio || "No description available."}
                  </p>
                </div>

                {/* Featured Brokers Preview */}
                {agency.brokers.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Meet Our Team</h2>
                      <button
                        onClick={() => setActiveTab("brokers")}
                        className="text-sm font-medium text-amber-600 hover:text-amber-700"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
                      {agency.brokers.slice(0, 4).map((broker) => (
                        <BrokerCard key={broker.id} broker={broker} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="font-semibold text-gray-900">Contact Agency</h3>
                  <div className="mt-4 space-y-3">
                    {agency.phone && (
                      <a
                        href={`tel:${agency.phone}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                      >
                        <PhoneIcon />
                        Call
                      </a>
                    )}
                    {agency.email && (
                      <a
                        href={`mailto:${agency.email}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <EmailIcon />
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

                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                  <dl className="mt-4 space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total Brokers</dt>
                      <dd className="font-semibold text-gray-900">{agency.brokerCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Agency Reviews</dt>
                      <dd className="font-semibold text-gray-900">{agency.agencyReviewCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Broker Reviews</dt>
                      <dd className="font-semibold text-gray-900">{agency.totalBrokerReviews}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Member Since</dt>
                      <dd className="font-semibold text-gray-900">
                        {new Date(agency.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === "brokers" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900">Our Brokers</h2>
              <p className="mt-2 text-gray-600">Meet the experienced professionals at {agency.name}</p>
              {agency.brokers.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {agency.brokers.map((broker) => (
                    <BrokerCard key={broker.id} broker={broker} />
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No brokers have joined this agency yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Agency Reviews</h2>
                  <p className="mt-1 text-gray-600">What clients say about {agency.name}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  Write a Review
                </button>
              </div>
              {agency.reviews.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {agency.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No reviews yet. Be the first to review this agency!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
            <p className="mt-2 text-gray-600">Share your experience with {agency.name}</p>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
              {submitError && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{submitError}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1"
                    >
                      <svg
                        className={`h-8 w-8 ${star <= reviewForm.rating ? "text-amber-400" : "text-gray-300"}`}
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
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reviewForm.text.length < 10}
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
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

