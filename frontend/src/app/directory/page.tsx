"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface Simsar {
  id: string;
  name: string;
  photoUrl: string | null;
  companyName: string | null;
  bio: string | null;
  reraId: string | null;
  experienceYears: number | null;
  languages: string[];
  verificationStatus: string;
  tierHint: string | null;
  simsarType: string;
  agencyId: string | null;
  rating: number;
  reviewCount: number;
  agency?: {
    id: string;
    name: string;
  } | null;
}

interface Agency {
  id: string;
  name: string;
  logoUrl: string | null;
  bio: string | null;
  verificationStatus: string;
  brokerCount: number;
  agencyRating: number;
  agencyReviewCount: number;
  brokerAvgRating: number;
  totalBrokerReviews: number;
}

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const areaOptions = [
  "All Areas",
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "JVC",
  "Business Bay",
  "JBR",
  "DIFC",
  "Abu Dhabi",
  "JLT",
];

const languageOptions = ["All Languages", "English", "Arabic", "French", "Hindi", "Spanish", "Mandarin"];

/* Icons */
const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg className={`h-4 w-4 ${filled ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const LocationIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Platinum: "bg-gradient-to-r from-slate-600 to-slate-400 text-white",
    Gold: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white",
    Silver: "bg-gradient-to-r from-gray-400 to-gray-300 text-gray-800",
    Bronze: "bg-gradient-to-r from-orange-600 to-orange-400 text-white",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors[tier] || colors.Bronze}`}>
      {tier}
    </span>
  );
}

function AgencyBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
      <BuildingIcon />
      Agency
    </span>
  );
}

function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <Link
      href={`/agency/${agency.id}`}
      className="block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:border-purple-200 hover:shadow-lg"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {agency.logoUrl ? (
            <img
              src={agency.logoUrl}
              alt={agency.name}
              className="h-16 w-16 rounded-xl object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-2xl font-bold text-white ring-2 ring-gray-100">
              {agency.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">{agency.name}</h3>
              {agency.verificationStatus === "VERIFIED" && <VerifiedIcon />}
            </div>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= Math.round(agency.agencyRating)} />
              ))}
              <span className="ml-1 text-sm font-medium text-gray-900">{agency.agencyRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({agency.agencyReviewCount})</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{agency.brokerCount} Brokers</p>
          </div>
        </div>

        {agency.bio && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{agency.bio}</p>
        )}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2">
          <span className="text-sm text-gray-600">Avg. Broker Rating</span>
          <span className="font-bold text-purple-700">{agency.brokerAvgRating.toFixed(1)}/5</span>
        </div>

        <div className="mt-4 text-center text-sm font-medium text-purple-600">
          View Agency →
        </div>
      </div>
    </Link>
  );
}

function DirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout } = useAuth();

  const [viewMode, setViewMode] = useState<"all" | "individuals" | "agencies">("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedArea, setSelectedArea] = useState(searchParams.get("location") || "All Areas");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [sortBy, setSortBy] = useState("rating");
  
  const [simsars, setSimsars] = useState<Simsar[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Recruitment modal state
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [recruitTarget, setRecruitTarget] = useState<Simsar | null>(null);
  const [recruitMessage, setRecruitMessage] = useState("");
  const [recruitLoading, setRecruitLoading] = useState(false);
  const [recruitError, setRecruitError] = useState("");
  const [recruitSuccess, setRecruitSuccess] = useState("");
  
  // Check if user is an agency owner
  const isAgencyOwner = user?.isAgencyOwner;

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        // Fetch simsars
        const simsarsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars`);
        if (simsarsRes.ok) {
          const simsarsData = await simsarsRes.json();
          // Process simsars data
          const processed = simsarsData.map((s: any) => {
            // Handle languages - might be array or string
            let languages: string[] = [];
            if (Array.isArray(s.languages)) {
              languages = s.languages;
            } else if (typeof s.languages === "string") {
              try {
                languages = JSON.parse(s.languages);
              } catch {
                languages = [];
              }
            }
            
            return {
              id: s.id,
              name: s.name,
              photoUrl: s.photoUrl,
              companyName: s.companyName,
              bio: s.bio,
              reraId: s.reraId,
              experienceYears: s.experienceYears,
              languages,
              verificationStatus: s.verificationStatus,
              tierHint: s.tierHint,
              simsarType: s.simsarType || "INDIVIDUAL",
              agencyId: s.agencyId,
              rating: s.rating || 0,
              reviewCount: s.reviewCount || 0,
              agency: s.agency,
            };
          });
          setSimsars(processed);
        } else {
          setError("Failed to load simsars. Please try again later.");
        }

        // Fetch agencies
        const agenciesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies`);
        if (agenciesRes.ok) {
          setAgencies(await agenciesRes.json());
        } else if (!simsarsRes.ok) {
          // Only set error if both fail
          setError("Failed to load data. Please try again later.");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter simsars based on search criteria
  const filteredSimsars = simsars.filter((simsar) => {
    const matchesSearch = searchQuery === "" || 
      simsar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (simsar.companyName || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLanguage = selectedLanguage === "All Languages" || 
      simsar.languages.includes(selectedLanguage);
    
    const matchesType = viewMode === "all" || 
      (viewMode === "individuals" && simsar.simsarType === "INDIVIDUAL") ||
      (viewMode === "agencies" && simsar.simsarType === "AGENCY_BROKER");

    return matchesSearch && matchesLanguage && matchesType;
  });

  // Filter agencies
  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch = searchQuery === "" || 
      agency.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Sort simsars
  const sortedSimsars = [...filteredSimsars].sort((a, b) => {
    switch (sortBy) {
      case "rating": return b.rating - a.rating;
      case "reviews": return b.reviewCount - a.reviewCount;
      case "experience": return (b.experienceYears || 0) - (a.experienceYears || 0);
      default: return 0;
    }
  });

  const handleViewProfile = (simsarId: string) => {
    router.push(`/simsar/${simsarId}`);
  };

  const openRecruitModal = (simsar: Simsar) => {
    setRecruitTarget(simsar);
    setRecruitMessage(`We'd love to have you join our team at our agency!`);
    setRecruitError("");
    setRecruitSuccess("");
    setShowRecruitModal(true);
  };

  const handleRecruit = async () => {
    if (!recruitTarget || !user?.agencyId) return;

    setRecruitLoading(true);
    setRecruitError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${user.agencyId}/recruit/${recruitTarget.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: recruitMessage }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send recruitment offer");
      }

      if (data.autoApproved) {
        setRecruitSuccess(`Great news! ${recruitTarget.name} has been added to your agency!`);
      } else {
        setRecruitSuccess(`Recruitment offer sent to ${recruitTarget.name}! They will receive a notification.`);
      }
      
      // Close modal after delay
      setTimeout(() => {
        setShowRecruitModal(false);
        setRecruitTarget(null);
        setRecruitSuccess("");
      }, 3000);
    } catch (err) {
      setRecruitError(err instanceof Error ? err.message : "Failed to send offer");
    } finally {
      setRecruitLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading directory...</p>
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
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-gray-600 sm:block">
                  Hi, {user?.name || user?.email?.split("@")[0]}
                </span>
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
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
                <Link href="/register" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
                  Join
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Simsar</h1>
          <p className="mt-2 text-gray-600">
            {!isLoading && !error && (
              <>
                Browse {filteredSimsars.length} verified professionals
                {viewMode === "all" && agencies.length > 0 && ` and ${filteredAgencies.length} agencies`}
              </>
            )}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
            >
              Reload page
            </button>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1 sm:w-fit">
          {[
            { key: "all", label: "All" },
            { key: "individuals", label: "Individual Brokers" },
            { key: "agencies", label: "Agencies" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as typeof viewMode)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by name or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none flex-1 sm:flex-none min-w-0"
              >
                {areaOptions.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none flex-1 sm:flex-none min-w-0"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none flex-1 sm:flex-none min-w-0"
              >
                <option value="rating">Sort: Rating</option>
                <option value="reviews">Sort: Reviews</option>
                <option value="experience">Sort: Experience</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agencies Section (only in "all" or "agencies" mode) */}
        {(viewMode === "all" || viewMode === "agencies") && filteredAgencies.length > 0 && (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Real Estate Agencies</h2>
              {viewMode === "all" && (
                <button
                  onClick={() => setViewMode("agencies")}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  View All →
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {(viewMode === "all" ? filteredAgencies.slice(0, 3) : filteredAgencies).map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
          </div>
        )}

        {/* Individual Brokers Section */}
        {(viewMode === "all" || viewMode === "individuals") && (
          <>
            {viewMode === "all" && filteredAgencies.length > 0 && (
              <h2 className="mb-4 text-xl font-bold text-gray-900">Individual Brokers</h2>
            )}
            {sortedSimsars.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {sortedSimsars.map((simsar) => (
                  <div
                    key={simsar.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:border-amber-200 hover:shadow-lg"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={simsar.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                            alt={simsar.name}
                            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                          />
                          {simsar.verificationStatus === "VERIFIED" && (
                            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
                              <VerifiedIcon />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{simsar.name}</h3>
                            {simsar.tierHint && <TierBadge tier={simsar.tierHint} />}
                          </div>
                          {simsar.simsarType === "AGENCY_BROKER" && simsar.agency ? (
                            <Link 
                              href={`/agency/${simsar.agency.id}`}
                              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                            >
                              <BuildingIcon />
                              {simsar.agency.name}
                            </Link>
                          ) : (
                            <p className="text-sm text-gray-500">{simsar.companyName || "Independent"}</p>
                          )}
                          <div className="mt-1 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon key={star} filled={star <= Math.round(simsar.rating)} />
                            ))}
                            <span className="ml-1 text-sm font-medium text-gray-900">{simsar.rating.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({simsar.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {simsar.bio && (
                        <p className="mt-4 text-sm text-gray-600 line-clamp-2">{simsar.bio}</p>
                      )}

                      {/* Details */}
                      <div className="mt-4 space-y-2 text-sm">
                        {simsar.experienceYears && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">📅</span>
                            <span className="text-gray-600">{simsar.experienceYears} years experience</span>
                          </div>
                        )}
                        {simsar.languages.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">🗣</span>
                            <span className="text-gray-600">{simsar.languages.join(", ")}</span>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {simsar.simsarType === "AGENCY_BROKER" && (
                          <AgencyBadge />
                        )}
                        {simsar.reraId && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            RERA Certified
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleViewProfile(simsar.id)}
                          className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          View Profile
                        </button>
                        {isAgencyOwner && simsar.simsarType === "INDIVIDUAL" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRecruitModal(simsar);
                            }}
                            className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
                            title="Recruit to your agency"
                          >
                            Recruit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-500">No simsars found matching your criteria.</p>                                                               
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedArea("All Areas");
                    setSelectedLanguage("All Languages");
                  }}
                  className="mt-4 text-amber-600 hover:text-amber-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Recruitment Modal */}
      {showRecruitModal && recruitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8">
            <h2 className="text-xl font-bold text-gray-900">Recruit to Your Agency</h2>
            <p className="mt-2 text-gray-600">Send a recruitment offer to <strong>{recruitTarget.name}</strong></p>
            
            {recruitSuccess ? (
              <div className="mt-6">
                <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700">
                  {recruitSuccess}
                </div>
              </div>
            ) : (
              <>
                {recruitError && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{recruitError}</div>
                )}

                <div className="mt-6 flex items-center gap-4">
                  <img
                    src={recruitTarget.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                    alt={recruitTarget.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{recruitTarget.name}</h3>
                    <p className="text-sm text-gray-500">
                      {recruitTarget.experienceYears ? `${recruitTarget.experienceYears} years exp.` : ""}
                      {recruitTarget.companyName && ` · ${recruitTarget.companyName}`}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= Math.round(recruitTarget.rating)} />
                      ))}
                      <span className="ml-1 text-sm text-gray-500">({recruitTarget.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
                  <textarea
                    rows={3}
                    value={recruitMessage}
                    onChange={(e) => setRecruitMessage(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Tell them why they should join your agency..."
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowRecruitModal(false); setRecruitTarget(null); }}
                    disabled={recruitLoading}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecruit}
                    disabled={recruitLoading}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {recruitLoading ? "Sending..." : "Send Offer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading directory...</p>
        </div>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}
