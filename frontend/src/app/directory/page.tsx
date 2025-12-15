"use client";

import { useState, useEffect, Suspense, useRef } from "react";
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
  whatsappNumber?: string | null;
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

const areaOptions = [
  "All Areas",
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "JVC (Jumeirah Village Circle)",
  "Business Bay",
  "JBR",
  "DIFC",
  "Dubai Hills",
  "Arabian Ranches",
  "JLT",
  "Abu Dhabi",
  "Sharjah",
];

const languageOptions = [
  "All Languages",
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Russian",
  "Mandarin",
  "French",
  "Tagalog",
  "Spanish",
  "Portuguese",
];

/* ─── ICONS ───────────────────────────────────────────────── */
const SearchIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = ({ filled = true, className = "h-4 w-4" }: { filled?: boolean; className?: string }) => (
  <svg className={`${className} ${filled ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={`${className} text-emerald-500`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const BuildingIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ChatIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const UsersIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ShieldIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const FilterIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronDownIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ─── COMPONENTS ──────────────────────────────────────────── */
function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Platinum: "bg-gradient-to-r from-slate-600 to-slate-400 text-white shadow-sm",
    Gold: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-sm",
    Silver: "bg-gradient-to-r from-gray-400 to-gray-300 text-gray-800",
    Bronze: "bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-sm",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${colors[tier] || colors.Bronze}`}>
      {tier}
    </span>
  );
}

/* ─── ENHANCED AGENCY CARD ───────────────────────────────── */
function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-purple-100 bg-white shadow-sm transition-all duration-300 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50">
      {/* Purple accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500" />
      
      <div className="p-6">
        {/* Header with logo */}
        <div className="flex items-start gap-4">
          <div className="relative">
            {agency.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="h-20 w-20 rounded-xl object-cover ring-4 ring-purple-50 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop";
                }}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 text-3xl font-bold text-white ring-4 ring-purple-50 transition-transform duration-300 group-hover:scale-105">
                {agency.name.charAt(0)}
              </div>
            )}
            {agency.verificationStatus === "VERIFIED" && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-md">
                <VerifiedIcon className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{agency.name}</h3>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= Math.round(agency.agencyRating)} className="h-4 w-4" />
              ))}
              <span className="ml-1 text-sm font-semibold text-gray-900">{agency.agencyRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({agency.agencyReviewCount})</span>
            </div>
          </div>
        </div>

        {agency.bio && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{agency.bio}</p>
        )}

        {/* Stats Row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="text-center rounded-lg bg-purple-50 py-2.5 px-2">
            <p className="text-lg font-bold text-purple-700">{agency.brokerCount}</p>
            <p className="text-xs text-purple-600">Brokers</p>
          </div>
          <div className="text-center rounded-lg bg-amber-50 py-2.5 px-2">
            <p className="text-lg font-bold text-amber-700">{agency.brokerAvgRating.toFixed(1)}</p>
            <p className="text-xs text-amber-600">Avg Rating</p>
          </div>
          <div className="text-center rounded-lg bg-emerald-50 py-2.5 px-2">
            <p className="text-lg font-bold text-emerald-700">{agency.totalBrokerReviews}</p>
            <p className="text-xs text-emerald-600">Reviews</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/agency/${agency.id}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-violet-700 hover:shadow-lg"
        >
          <BuildingIcon className="h-4 w-4" />
          View Agency
        </Link>
      </div>
    </div>
  );
}

/* ─── ENHANCED BROKER CARD ───────────────────────────────── */
function BrokerCard({ 
  simsar, 
  onViewProfile, 
  onRecruit, 
  isAgencyOwner 
}: { 
  simsar: Simsar; 
  onViewProfile: () => void;
  onRecruit?: () => void;
  isAgencyOwner?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 to-amber-500/0 transition-all duration-300 group-hover:from-amber-500/5 group-hover:to-transparent pointer-events-none" />
      
      <div className="relative p-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          {/* Large Profile Photo */}
          <div className="relative flex-shrink-0">
            <img
              src={simsar.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"}
              alt={simsar.name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-gray-50 transition-all duration-300 group-hover:ring-amber-100 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop";
              }}
            />
            {simsar.verificationStatus === "VERIFIED" && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-md">
                <VerifiedIcon className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{simsar.name}</h3>
              {simsar.tierHint && <TierBadge tier={simsar.tierHint} />}
            </div>
            
            {simsar.simsarType === "AGENCY_BROKER" && simsar.agency ? (
              <Link 
                href={`/agency/${simsar.agency.id}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <BuildingIcon className="h-3.5 w-3.5" />
                {simsar.agency.name}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-gray-500">{simsar.companyName || "Independent Broker"}</p>
            )}

            {/* Rating */}
            <div className="mt-2 flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= Math.round(simsar.rating)} className="h-4 w-4" />
                ))}
              </div>
              <span className="ml-1 text-sm font-bold text-gray-900">{simsar.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({simsar.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {simsar.bio && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{simsar.bio}</p>
        )}

        {/* Quick Info Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {simsar.experienceYears && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {simsar.experienceYears}+ years
            </span>
          )}
          {simsar.languages.slice(0, 2).map((lang) => (
            <span key={lang} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {lang}
            </span>
          ))}
          {simsar.languages.length > 2 && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              +{simsar.languages.length - 2}
            </span>
          )}
          {simsar.reraId && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              RERA Certified
            </span>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="mt-5 flex items-center gap-2">
          {simsar.whatsappNumber && (
            <a
              href={`https://wa.me/${simsar.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white transition-all hover:bg-emerald-600 hover:scale-105"
              title="WhatsApp"
              onClick={(e) => e.stopPropagation()}
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          )}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105"
            title="Message"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
          >
            <ChatIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onViewProfile}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg"
          >
            View Profile
          </button>
          {isAgencyOwner && simsar.simsarType === "INDIVIDUAL" && onRecruit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRecruit();
              }}
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg"
              title="Recruit to your agency"
            >
              Recruit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN CONTENT ───────────────────────────────────────── */
function DirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout } = useAuth();
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  // Initialize from URL params
  const initialView = searchParams.get("view") === "agencies" ? "agencies" : "all";
  const initialArea = searchParams.get("area") || searchParams.get("location") || "All Areas";
  const initialLanguage = searchParams.get("language") || "All Languages";
  const initialExperience = searchParams.get("experience") || "";
  const initialVerified = searchParams.get("verified") === "true";
  const initialMinRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : 0;
  const initialSort = searchParams.get("sort") || "rating";

  const [viewMode, setViewMode] = useState<"all" | "individuals" | "agencies">(initialView as "all" | "individuals" | "agencies");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [selectedExperience, setSelectedExperience] = useState(initialExperience);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);
  const [minRating, setMinRating] = useState(initialMinRating);
  const [sortBy, setSortBy] = useState(initialSort);
  
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
  
  const isAgencyOwner = user?.isAgencyOwner;

  // Sticky filter detection
  useEffect(() => {
    const handleScroll = () => {
      if (filterBarRef.current) {
        const rect = filterBarRef.current.getBoundingClientRect();
        setIsFilterSticky(rect.top <= 64);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const simsarsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars`);
        if (simsarsRes.ok) {
          const simsarsData = await simsarsRes.json();
          const processed = simsarsData.map((s: any) => {
            let languages: string[] = [];
            if (Array.isArray(s.languages)) {
              languages = s.languages;
            } else if (typeof s.languages === "string") {
              try { languages = JSON.parse(s.languages); } catch { languages = []; }
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
              whatsappNumber: s.whatsappNumber,
              agency: s.agency,
            };
          });
          setSimsars(processed);
        } else {
          setError("Failed to load brokers. Please try again later.");
        }

        const agenciesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies`);
        if (agenciesRes.ok) {
          setAgencies(await agenciesRes.json());
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

  // Filters
  const filteredSimsars = simsars.filter((simsar) => {
    const matchesSearch = searchQuery === "" || 
      simsar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (simsar.companyName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === "All Languages" || simsar.languages.includes(selectedLanguage);
    const matchesArea = selectedArea === "All Areas" || (simsar.companyName || "").toLowerCase().includes(selectedArea.toLowerCase());
    const matchesType = viewMode === "all" || 
      (viewMode === "individuals" && simsar.simsarType === "INDIVIDUAL") ||
      (viewMode === "agencies" && simsar.simsarType === "AGENCY_BROKER");
    let matchesExperience = true;
    if (selectedExperience) {
      const years = simsar.experienceYears || 0;
      if (selectedExperience === "1-5") matchesExperience = years >= 1 && years <= 5;
      else if (selectedExperience === "5-10") matchesExperience = years > 5 && years <= 10;
      else if (selectedExperience === "10+") matchesExperience = years > 10;
    }
    const matchesVerified = !verifiedOnly || simsar.verificationStatus === "VERIFIED";
    const matchesRating = simsar.rating >= minRating;
    return matchesSearch && matchesLanguage && matchesArea && matchesType && matchesExperience && matchesVerified && matchesRating;
  });

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch = searchQuery === "" || agency.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedSimsars = [...filteredSimsars].sort((a, b) => {
    switch (sortBy) {
      case "rating": return b.rating - a.rating;
      case "reviews": return b.reviewCount - a.reviewCount;
      case "experience": return (b.experienceYears || 0) - (a.experienceYears || 0);
      default: return 0;
    }
  });

  const handleViewProfile = (simsarId: string) => router.push(`/simsar/${simsarId}`);

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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: recruitMessage }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send recruitment offer");
      setRecruitSuccess(data.autoApproved 
        ? `Great news! ${recruitTarget.name} has been added to your agency!`
        : `Recruitment offer sent to ${recruitTarget.name}! They will receive a notification.`
      );
      setTimeout(() => { setShowRecruitModal(false); setRecruitTarget(null); setRecruitSuccess(""); }, 3000);
    } catch (err) {
      setRecruitError(err instanceof Error ? err.message : "Failed to send offer");
    } finally {
      setRecruitLoading(false);
    }
  };

  const verifiedCount = simsars.filter(s => s.verificationStatus === "VERIFIED").length;
  const hasActiveFilters = verifiedOnly || minRating > 0 || selectedArea !== "All Areas" || selectedLanguage !== "All Languages" || selectedExperience || searchQuery;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
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
                <Link href="/register" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600">
                  Join
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Real Estate Expert
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Connect with verified professionals who understand your property needs in the UAE
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-white">
                <UsersIcon className="h-5 w-5 text-amber-400" />
                <span className="font-semibold">{simsars.length}+ Brokers</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-white">
                <BuildingIcon className="h-5 w-5 text-purple-400" />
                <span className="font-semibold">{agencies.length}+ Agencies</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-white">
                <ShieldIcon className="h-5 w-5 text-emerald-400" />
                <span className="font-semibold">{verifiedCount} Verified</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/20">
                <div className="flex flex-1 items-center gap-3 px-4">
                  <SearchIcon className="h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by broker name or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
                  />
                </div>
                <button className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Filter Bar */}
        <div 
          ref={filterBarRef}
          className={`sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 ${
            isFilterSticky ? "bg-white/95 backdrop-blur shadow-md" : "bg-transparent"
          }`}
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* View Mode Tabs */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1">
                {[
                  { key: "all", label: "All", icon: null },
                  { key: "individuals", label: "Brokers", icon: <UsersIcon className="h-4 w-4" /> },
                  { key: "agencies", label: "Agencies", icon: <BuildingIcon className="h-4 w-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setViewMode(tab.key as typeof viewMode)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      viewMode === tab.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {areaOptions.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Experience</option>
                    <option value="1-5">1-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <FilterIcon className="h-4 w-4" />
                Quick:
              </span>
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  verifiedOnly
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <VerifiedIcon className={`h-4 w-4 ${verifiedOnly ? "text-white" : ""}`} />
                Verified
              </button>
              <button
                onClick={() => setMinRating(minRating === 4 ? 0 : 4)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  minRating === 4
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <StarIcon filled className={`h-4 w-4 ${minRating === 4 ? "text-white" : ""}`} />
                4+ Rating
              </button>
              
              {/* Results count */}
              <div className="ml-auto flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setVerifiedOnly(false);
                      setMinRating(0);
                      setSelectedArea("All Areas");
                      setSelectedLanguage("All Languages");
                      setSelectedExperience("");
                      setSearchQuery("");
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Clear filters
                  </button>
                )}
                <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
                  {sortedSimsars.length} results
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline">
              Reload page
            </button>
          </div>
        )}

        {/* Agencies Section */}
        {(viewMode === "all" || viewMode === "agencies") && filteredAgencies.length > 0 && (
          <section className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Real Estate Agencies</h2>
                <p className="mt-1 text-gray-500">Top agencies with verified brokers</p>
              </div>
              {viewMode === "all" && filteredAgencies.length > 3 && (
                <button
                  onClick={() => setViewMode("agencies")}
                  className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                >
                  View All {filteredAgencies.length} Agencies →
                </button>
              )}
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {(viewMode === "all" ? filteredAgencies.slice(0, 3) : filteredAgencies).map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
          </section>
        )}

        {/* Brokers Section */}
        {(viewMode === "all" || viewMode === "individuals") && (
          <section className={viewMode === "all" && filteredAgencies.length > 0 ? "mt-12" : "mt-8"}>
            {(viewMode === "all" && filteredAgencies.length > 0) && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Individual Brokers</h2>
                <p className="mt-1 text-gray-500">Independent professionals ready to help</p>
              </div>
            )}
            {sortedSimsars.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {sortedSimsars.map((simsar) => (
                  <BrokerCard
                    key={simsar.id}
                    simsar={simsar}
                    onViewProfile={() => handleViewProfile(simsar.id)}
                    onRecruit={() => openRecruitModal(simsar)}
                    isAgencyOwner={isAgencyOwner}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No brokers found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedArea("All Areas");
                    setSelectedLanguage("All Languages");
                    setSelectedExperience("");
                    setVerifiedOnly(false);
                    setMinRating(0);
                  }}
                  className="mt-4 rounded-lg bg-amber-500 px-6 py-2 font-semibold text-white hover:bg-amber-600"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Recruitment Modal */}
      {showRecruitModal && recruitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">Recruit to Your Agency</h2>
            <p className="mt-2 text-gray-600">Send a recruitment offer to <strong>{recruitTarget.name}</strong></p>
            
            {recruitSuccess ? (
              <div className="mt-6">
                <div className="rounded-xl bg-emerald-50 p-4 text-emerald-700">{recruitSuccess}</div>
              </div>
            ) : (
              <>
                {recruitError && (
                  <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{recruitError}</div>
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
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
                  <textarea
                    rows={3}
                    value={recruitMessage}
                    onChange={(e) => setRecruitMessage(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Tell them why they should join your agency..."
                  />
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowRecruitModal(false); setRecruitTarget(null); }}
                    disabled={recruitLoading}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecruit}
                    disabled={recruitLoading}
                    className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
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
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading directory...</p>
        </div>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}
