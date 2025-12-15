"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const topSimsars = [
  {
    id: "1",
    name: "Sarah Al-Rashid",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    areas: ["Dubai Marina", "JVC", "Business Bay"],
    languages: ["English", "Arabic"],
    rating: 4.9,
    reviews: 127,
    score: 94,
    tier: "Platinum",
    verified: true,
    specialties: ["Off-plan", "Luxury Apartments"],
    experience: "8 years",
    company: "Emaar Properties",
  },
  {
    id: "2",
    name: "Ahmed Hassan",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    areas: ["Downtown Dubai", "DIFC", "Palm Jumeirah"],
    languages: ["English", "Arabic", "French"],
    rating: 4.8,
    reviews: 89,
    score: 88,
    tier: "Gold",
    verified: true,
    specialties: ["Luxury Villas", "Investment"],
    experience: "12 years",
    company: "Dubai Properties",
  },
  {
    id: "3",
    name: "Maria Santos",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    areas: ["JLT", "Marina", "JBR"],
    languages: ["English", "Spanish", "Tagalog"],
    rating: 4.7,
    reviews: 64,
    score: 82,
    tier: "Gold",
    verified: true,
    specialties: ["Rentals", "Family Homes"],
    experience: "5 years",
    company: "Betterhomes",
  },
  {
    id: "4",
    name: "Omar Al-Maktoum",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    areas: ["Abu Dhabi", "Yas Island", "Saadiyat"],
    languages: ["English", "Arabic"],
    rating: 4.9,
    reviews: 156,
    score: 91,
    tier: "Platinum",
    verified: true,
    specialties: ["Commercial", "Off-plan"],
    experience: "15 years",
    company: "Aldar Properties",
  },
];

const testimonials = [
  {
    text: "Sarah helped us find our dream apartment in Dubai Marina. Her knowledge of the market and attention to our needs was exceptional.",
    author: "James & Emily Thompson",
    location: "Dubai Marina",
    rating: 5,
  },
  {
    text: "Ahmed made our investment property purchase seamless. His expertise in the luxury market saved us both time and money.",
    author: "Michael Chen",
    location: "Palm Jumeirah",
    rating: 5,
  },
  {
    text: "The MySimsar platform gave us confidence in choosing a verified broker. The transaction claim process ensured authentic reviews.",
    author: "Fatima Al-Zahra",
    location: "Business Bay",
    rating: 5,
  },
];

const stats = [
  { value: "2,500+", label: "Verified Simsars" },
  { value: "50,000+", label: "Happy Clients" },
  { value: "4.8", label: "Average Rating" },
  { value: "15+", label: "Cities Covered" },
];

const AREAS = [
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "JVC (Jumeirah Village Circle)",
  "Business Bay",
  "JBR",
  "DIFC",
  "Dubai Hills",
  "Arabian Ranches",
  "Abu Dhabi",
  "Sharjah",
];

const LANGUAGES = [
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

const EXPERIENCE_LEVELS = [
  { value: "", label: "Any Experience" },
  { value: "1-5", label: "1-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

const SPECIALTIES = [
  { id: "residential", label: "Residential", icon: "🏠" },
  { id: "commercial", label: "Commercial", icon: "🏢" },
  { id: "off-plan", label: "Off-Plan", icon: "🏗️" },
  { id: "luxury", label: "Luxury", icon: "💎" },
  { id: "agencies", label: "Agencies", icon: "🏛️" },
];

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

const ShieldIcon = () => (
  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────────── */
function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= Math.round(rating)} />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-900">{rating}</span>
      <span className="text-sm text-gray-500">({reviews} reviews)</span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Platinum: "bg-gradient-to-r from-slate-600 to-slate-400 text-white",
    Gold: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white",
    Silver: "bg-gradient-to-r from-gray-400 to-gray-300 text-gray-800",
    Bronze: "bg-gradient-to-r from-orange-600 to-orange-400 text-white",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[tier] || colors.Bronze}`}>
      {tier}
    </span>
  );
}

function SimsarCard({ simsar }: { simsar: typeof topSimsars[0] }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleViewProfile = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/simsar/${simsar.id}`);
    } else {
      router.push(`/simsar/${simsar.id}`);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={simsar.photo}
            alt={simsar.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
          />
          {simsar.verified && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
              <VerifiedIcon />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{simsar.name}</h3>
            <TierBadge tier={simsar.tier} />
          </div>
          <p className="text-sm text-gray-500 truncate">{simsar.company}</p>
          <div className="mt-1">
            <StarRating rating={simsar.rating} reviews={simsar.reviews} />
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2">
        <span className="text-sm text-gray-600">MySimsar Score</span>
        <span className="text-lg font-bold text-slate-800">{simsar.score}/100</span>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <LocationIcon />
          <span className="text-gray-600">{simsar.areas.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">🗣</span>
          <span className="text-gray-600">{simsar.languages.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">⏱</span>
          <span className="text-gray-600">{simsar.experience} experience</span>
        </div>
      </div>

      {/* Specialties */}
      <div className="mt-4 flex flex-wrap gap-2">
        {simsar.specialties.map((spec) => (
          <span key={spec} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            {spec}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <button 
          onClick={handleViewProfile}
          className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          View Profile
        </button>
        <button className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-emerald-600 transition-colors hover:bg-emerald-50">
          <WhatsAppIcon />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DROPDOWN COMPONENT
───────────────────────────────────────────────────────────────── */
function Dropdown({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  options: { value: string; label: string }[]; 
  placeholder: string;
  icon: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-left text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        <span className="text-white/70">{icon}</span>
        <span className="flex-1 truncate">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-auto rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                value === option.value ? "bg-amber-50 font-medium text-amber-700" : "text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AREA AUTOCOMPLETE COMPONENT
───────────────────────────────────────────────────────────────── */
function AreaAutocomplete({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState(AREAS);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setFilteredAreas(AREAS.filter(area => 
        area.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setFilteredAreas(AREAS);
    }
  }, [value]);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm transition hover:bg-white/20">
        <span className="text-white/70"><LocationIcon /></span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="City, community or building"
          className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none"
        />
      </div>
      
      {isOpen && filteredAreas.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-auto rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
          {filteredAreas.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => {
                onChange(area);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>{area}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("residential");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");
  const [experience, setExperience] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [featuredSimsars, setFeaturedSimsars] = useState<typeof topSimsars>([]);
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // Fetch top simsars from API (only on client side)
  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    
    const fetchTopSimsars = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/simsars?sort=rating`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const transformed = data.slice(0, 4).map((s: any) => ({
              id: s.id || String(Math.random()),
              name: s.name || "Unknown",
              photo: s.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
              areas: s.companyName ? [s.companyName] : ["Dubai"],
              languages: Array.isArray(s.languages) ? s.languages : [],
              rating: s.rating || 0,
              reviews: s.reviewCount || 0,
              score: s.score || 0,
              tier: s.tierHint || "Bronze",
              verified: s.verificationStatus === "VERIFIED",
              specialties: [],
              experience: s.experienceYears ? `${s.experienceYears} years` : "N/A",
              company: s.agency?.name || s.companyName || "Independent",
            }));
            setFeaturedSimsars(transformed);
          } else {
            setFeaturedSimsars(topSimsars);
          }
        } else {
          setFeaturedSimsars(topSimsars);
        }
      } catch (error) {
        console.error("Failed to fetch featured simsars:", error);
        setFeaturedSimsars(topSimsars);
      }
    };
    
    fetchTopSimsars();
  }, [isLoading]);

  // Redirect logged-in users to directory
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/directory");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (selectedSpecialty === "agencies") {
      params.set("view", "agencies");
    } else if (selectedSpecialty) {
      params.set("specialty", selectedSpecialty);
    }
    if (location) params.set("area", location);
    if (language) params.set("language", language);
    if (experience) params.set("experience", experience);
    if (verifiedOnly) params.set("verified", "true");
    if (minRating) params.set("minRating", "4");
    if (topRated) params.set("sort", "rating");
    
    router.push(`/directory?${params.toString()}`);
  };

  const languageOptions = [
    { value: "", label: "Any Language" },
    ...LANGUAGES.map(l => ({ value: l, label: l })),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVIGATION ─────────────────────────────────────── */}
      <header className="absolute left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-800 shadow-lg">
              M
            </div>
            <div>
              <span className="text-xl font-bold text-white">MySimsar</span>
              <span className="hidden text-xs text-white/70 sm:block">Trusted Broker Ratings</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/directory" className="text-sm font-medium text-white/90 transition-colors hover:text-white">
              Find Simsars
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-white/90 transition-colors hover:text-white">
              How It Works
            </Link>
            <Link href="#for-brokers" className="text-sm font-medium text-white/90 transition-colors hover:text-white">
              For Brokers
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm font-medium text-white/90 transition-colors hover:text-white sm:block">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-lg transition-all hover:bg-gray-100"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO WITH DUBAI SKYLINE ─────────────────────────── */}
      <section className="relative min-h-[600px] sm:min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&h=1080&fit=crop&q=80"
            alt="Dubai Skyline"
            className="h-full w-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 sm:pt-40 lg:px-8">
          <div className="text-center">
            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect Real Estate Broker
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
              Connect with verified simsars across the UAE. Search by specialty, language, and experience.
            </p>

            {/* Category Tabs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialty(spec.id)}
                  className={`flex items-center gap-2 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all ${
                    selectedSpecialty === spec.id
                      ? "bg-white text-slate-900 shadow-lg"
                      : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  }`}
                >
                  <span>{spec.icon}</span>
                  <span className="hidden sm:inline">{spec.label}</span>
                  <span className="sm:hidden">{spec.label}</span>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-5xl px-4">
              <div className="flex flex-col gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md sm:flex-row sm:items-center lg:gap-2">
                {/* Location Input */}
                <AreaAutocomplete value={location} onChange={setLocation} />

                {/* Language Dropdown */}
                <div className="sm:w-48 lg:w-52">
                  <Dropdown
                    value={language}
                    onChange={setLanguage}
                    options={languageOptions}
                    placeholder="Language"
                    icon={<GlobeIcon />}
                  />
                </div>

                {/* Experience Dropdown */}
                <div className="sm:w-48 lg:w-52">
                  <Dropdown
                    value={experience}
                    onChange={setExperience}
                    options={EXPERIENCE_LEVELS}
                    placeholder="Experience"
                    icon={<BriefcaseIcon />}
                  />
                </div>

                {/* Search Button */}
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-8 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-red-600 hover:to-rose-600 sm:px-10"
                >
                  <SearchIcon />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Quick Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  verifiedOnly
                    ? "bg-emerald-500 text-white"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                <VerifiedIcon />
                Verified Only
              </button>
              <button
                type="button"
                onClick={() => setMinRating(!minRating)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  minRating
                    ? "bg-amber-500 text-white"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                <StarIcon filled />
                4+ Rating
              </button>
              <button
                type="button"
                onClick={() => setTopRated(!topRated)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  topRated
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                🏆 Top Rated
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900 sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP SIMSARS ────────────────────────────────────── */}
      <section id="directory" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Top Rated Simsars</h2>
              <p className="mt-2 text-gray-600">Discover verified brokers with the highest ratings and reviews</p>
            </div>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 font-semibold text-amber-600 transition-colors hover:text-amber-700"
            >
              View All Simsars
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="mt-10 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {(featuredSimsars.length > 0 ? featuredSimsars : topSimsars).map((simsar) => (
              <SimsarCard key={simsar.id} simsar={simsar} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How MySimsar Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              A transparent, trust-first approach to connecting you with verified real estate professionals
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Search & Filter",
                desc: "Browse verified simsars by area, language, specialty, and ratings. Find the perfect match for your needs.",
              },
              {
                step: "2",
                title: "Review Profiles",
                desc: "Check MySimsar scores, verified reviews, credentials, and transaction history before connecting.",
              },
              {
                step: "3",
                title: "Connect & Transact",
                desc: "Contact your chosen simsar via WhatsApp or phone. Complete your property transaction.",
              },
              {
                step: "4",
                title: "Leave a Review",
                desc: "Submit a transaction claim, get verified, and share your authentic experience with the community.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                {/* Step Number */}
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-600">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ──────────────────────────────────── */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Why Choose MySimsar?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              We&apos;re revolutionizing how people find and trust real estate professionals in the UAE and GCC region
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
            {[
              {
                icon: <ShieldIcon />,
                title: "Verified Professionals",
                desc: "Every simsar undergoes rigorous verification of RERA licenses, credentials, and background checks before appearing on our platform.",
              },
              {
                icon: <ChartIcon />,
                title: "MySimsar Score",
                desc: "Our proprietary scoring algorithm rates brokers on verification, reviews, response time, and reliability for transparent comparison.",
              },
              {
                icon: <CheckCircleIcon />,
                title: "Authentic Reviews",
                desc: "Transaction-validated reviews ensure every rating comes from a real client who completed a verified property deal.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8">
                <div className="mb-4 text-amber-400">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Users Say</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Join thousands of satisfied clients who found their perfect simsar through our platform
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= testimonial.rating} />
                  ))}
                </div>
                {/* Quote */}
                <p className="mt-4 text-gray-700">&ldquo;{testimonial.text}&rdquo;</p>
                {/* Author */}
                <div className="mt-6">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR BROKERS CTA ────────────────────────────────── */}
      <section id="for-brokers" className="bg-gradient-to-r from-amber-500 to-amber-600 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Are You a Simsar?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-100">
            Join UAE&apos;s fastest-growing broker platform. Get verified, build your reputation, and connect with qualified leads.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
            <Link
              href="/register?role=broker"
              className="rounded-lg bg-white px-6 sm:px-8 py-3 sm:py-3.5 font-semibold text-amber-600 shadow-lg transition-all hover:bg-gray-50 w-full sm:w-auto text-center"
            >
              Join as Simsar
            </Link>
            <Link
              href="/for-brokers"
              className="rounded-lg border-2 border-white px-6 sm:px-8 py-3 sm:py-3.5 font-semibold text-white transition-all hover:bg-white/10 w-full sm:w-auto text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-lg font-bold text-white">
                  M
                </div>
                <span className="text-xl font-bold text-gray-900">MySimsar</span>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                The trusted platform for finding verified real estate brokers in UAE &amp; GCC.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-gray-900">For Clients</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="/directory" className="text-sm text-gray-500 hover:text-gray-900">Find Simsars</Link></li>
                <li><Link href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900">How It Works</Link></li>
                <li><Link href="/reviews" className="text-sm text-gray-500 hover:text-gray-900">Leave a Review</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">For Simsars</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="/register?role=broker" className="text-sm text-gray-500 hover:text-gray-900">Join the Platform</Link></li>
                <li><Link href="/verification" className="text-sm text-gray-500 hover:text-gray-900">Get Verified</Link></li>
                <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact</Link></li>
                <li><Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms & Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} MySimsar. All rights reserved. UAE&apos;s #1 Broker Rating Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
