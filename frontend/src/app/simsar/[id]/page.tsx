"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ChatModal } from "@/components/ChatModal";

/* ─── TYPES ───────────────────────────────────────────────── */
interface Agency {
  id: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  verificationStatus: string;
}

interface Review {
  id: string;
  rating: number;
  text: string;
  verified: boolean;
  createdAt: string;
  author: string;
}

interface Simsar {
  id: string;
  name: string;
  photoUrl: string | null;
  companyName: string | null;
  bio: string | null;
  reraId: string | null;
  experienceYears: number | null;
  languages: string[];
  whatsappNumber: string | null;
  verificationStatus: string;
  tierHint: string | null;
  simsarType: string;
  agencyId: string | null;
  agency: Agency | null;
  score: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

interface PortfolioItem {
  id: string;
  type: "sale" | "rental" | "off-plan";
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  images: string[]; // Multiple images for carousel
  status: "sold" | "rented" | "available";
  date: string;
}

/* ─── MOCK PORTFOLIO (will be replaced with API) ──────────── */
const mockPortfolio: PortfolioItem[] = [
  {
    id: "1",
    type: "sale",
    title: "Luxury Penthouse - Marina View",
    location: "Dubai Marina",
    price: "AED 4,500,000",
    bedrooms: 3,
    bathrooms: 4,
    area: "3,200 sq ft",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    ],
    status: "sold",
    date: "2024-11-15",
  },
  {
    id: "2",
    type: "sale",
    title: "Downtown Executive Suite",
    location: "Downtown Dubai",
    price: "AED 2,800,000",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,850 sq ft",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    ],
    status: "sold",
    date: "2024-10-20",
  },
  {
    id: "3",
    type: "rental",
    title: "Modern Villa - Palm Jumeirah",
    location: "Palm Jumeirah",
    price: "AED 450,000/year",
    bedrooms: 5,
    bathrooms: 6,
    area: "6,500 sq ft",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7f34b5063c7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
    ],
    status: "rented",
    date: "2024-09-01",
  },
];

/* ─── ICONS ───────────────────────────────────────────────── */
const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg className={`h-5 w-5 ${filled ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg className="h-6 w-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

/* ─── PROPERTY DETAIL MODAL WITH CAROUSEL ─────────────────── */
function PropertyDetailModal({ property, onClose }: { property: PortfolioItem; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} aria-label="Close property modal" className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Carousel */}
        <div className="relative h-48 sm:h-80 bg-gray-900">
          {/* Main Image */}
          <img
            src={property.images[currentImageIndex] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop"}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="h-full w-full object-cover transition-opacity duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop";
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Price badge */}
          <div className="absolute bottom-4 left-4">
            <p className="text-3xl font-bold text-white drop-shadow-lg">{property.price}</p>
          </div>

          {/* Navigation arrows */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        {property.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-gray-100 p-3">
            {property.images.map((img, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                  index === currentImageIndex
                    ? "ring-2 ring-amber-500 ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=150&fit=crop";
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Property details */}
        <div className="p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
          <p className="mt-1 flex items-center gap-2 text-gray-500">
            <LocationIcon />
            {property.location}
          </p>
          
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
              <p className="text-xs font-medium text-gray-500">Bedrooms</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
              <p className="text-xs font-medium text-gray-500">Bathrooms</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{property.area.replace(' sq ft', '')}</p>
              <p className="text-xs font-medium text-gray-500">Sq Ft</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{new Date(property.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</p>
              <p className="text-xs font-medium text-gray-500">Completed</p>
            </div>
          </div>

          <button onClick={onClose} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── COMPONENTS ──────────────────────────────────────────── */
function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Platinum: "bg-gradient-to-r from-slate-600 to-slate-400 text-white",
    Gold: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white",
    Silver: "bg-gradient-to-r from-gray-400 to-gray-300 text-gray-800",
    Bronze: "bg-gradient-to-r from-orange-600 to-orange-400 text-white",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${colors[tier] || colors.Bronze}`}>
      {tier}
    </span>
  );
}

function PortfolioCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  const statusColors = {
    sold: "bg-emerald-100 text-emerald-700",
    rented: "bg-blue-100 text-blue-700",
    available: "bg-amber-100 text-amber-700",
  };

  const typeLabels = { sale: "Sale", rental: "Rental", "off-plan": "Off-Plan" };

  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg" onClick={onClick}>
      <div className="relative h-40 overflow-hidden">
        <img 
          src={item.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"} 
          alt={item.title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop";
          }}
        />
        {item.images.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
            +{item.images.length - 1} photos
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{typeLabels[item.type]}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status]}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
        </div>
        <div className="absolute bottom-2 left-2">
          <p className="text-lg font-bold text-white">{item.price}</p>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm">{item.title}</h4>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
          <LocationIcon />
          {item.location}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span>{item.bedrooms} Beds</span>
          <span>{item.bathrooms} Baths</span>
          <span>{item.area}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────── */
export default function SimsarProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [simsar, setSimsar] = useState<Simsar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeSection, setActiveSection] = useState<"about" | "portfolio" | "reviews">("about");
  const [portfolioFilter, setPortfolioFilter] = useState<"all" | "sale" | "rental" | "off-plan">("all");
  const [selectedProperty, setSelectedProperty] = useState<PortfolioItem | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  
  // Claim & Review state
  const [claimForm, setClaimForm] = useState({ transactionType: "purchase", location: "", proofUrl: "" });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [userClaims, setUserClaims] = useState<{ id: string; status: string }[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "", claimId: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchSimsar = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${params.id}`);
        if (res.ok) {
          setSimsar(await res.json());
        } else if (res.status === 404) {
          // Handle 404 specifically
          setSimsar(null);
        } else {
          throw new Error("Failed to load profile");
        }
      } catch (error) {
        console.error("Failed to fetch simsar:", error);
        setSimsar(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSimsar();
  }, [params.id]);

  // Track profile view (counts only, no identity exposed)
  useEffect(() => {
    if (!params.id) return;
    const headers: Record<string, string> = {};
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/analytics/profile-view/${params.id}`, {
      method: "POST",
      headers,
    }).catch(() => {});
  }, [params.id]);

  const portfolio = mockPortfolio;
  const filteredPortfolio = portfolioFilter === "all" ? portfolio : portfolio.filter(item => item.type === portfolioFilter);

  const handleWorkWithSimsar = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/simsar/${params.id}`);
      return;
    }
    if (user?.role === "BROKER") {
      setClaimError("Only clients can submit transaction claims");
      return;
    }
    setClaimError("");
    setClaimSuccess(false);
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simsar) return;
    
    setClaimSubmitting(true);
    setClaimError("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${simsar.id}/claims`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            proofLinks: {
              transactionType: claimForm.transactionType,
              location: claimForm.location,
              proofUrl: claimForm.proofUrl,
            },
          }),
        }
      );

      if (res.ok) {
        setClaimSuccess(true);
        setClaimForm({ transactionType: "purchase", location: "", proofUrl: "" });
      } else {
        const data = await res.json();
        setClaimError(data.error || "Failed to submit claim");
      }
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simsar || !reviewForm.claimId) return;
    
    setReviewSubmitting(true);
    setReviewError("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${simsar.id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            claimId: reviewForm.claimId,
            rating: reviewForm.rating,
            text: reviewForm.text,
          }),
        }
      );

      if (res.ok) {
        setReviewSuccess(true);
        setReviewForm({ rating: 5, text: "", claimId: "" });
        // Refresh simsar data to show new review
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${params.id}`);
        if (refreshRes.ok) {
          setSimsar(await refreshRes.json());
        }
      } else {
        const data = await res.json();
        setReviewError(data.error || "Failed to submit review");
      }
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!simsar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Simsar Not Found</h1>
          <p className="mt-2 text-gray-600">The profile you&apos;re looking for doesn&apos;t exist.</p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-lg font-bold text-white shadow-sm">M</div>
            <span className="text-xl font-bold text-gray-900">MySimsar</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/directory" className="text-sm font-medium text-gray-600 hover:text-gray-900">Find Simsars</Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
                <button onClick={logout} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Sign In</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-8 py-8 sm:py-12">
            <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row md:items-end">
              <div className="relative">
                <img
                  src={simsar.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"}
                  alt={simsar.name}
                  className="h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
                {simsar.verificationStatus === "VERIFIED" && (
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-1 shadow">
                    <VerifiedIcon />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">{simsar.name}</h1>
                  {simsar.tierHint && <TierBadge tier={simsar.tierHint} />}
                  {simsar.verificationStatus === "VERIFIED" && (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300">Verified</span>
                  )}
                </div>

                {/* Agency Badge */}
                {simsar.simsarType === "AGENCY_BROKER" && simsar.agency && (
                  <Link
                    href={`/agency/${simsar.agency.id}`}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-1.5 text-sm font-medium text-purple-200 transition-colors hover:bg-purple-500/30"
                  >
                    <BuildingIcon />
                    Part of {simsar.agency.name}
                  </Link>
                )}

                <p className="mt-2 text-slate-300">
                  {simsar.companyName || "Independent"} · {simsar.experienceYears ? `${simsar.experienceYears} years experience` : "New on platform"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= Math.round(simsar.rating)} />
                    ))}
                    <span className="ml-2 text-lg font-semibold text-white">{simsar.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({simsar.reviewCount} reviews)</span>
                  </div>
                  <div className="rounded-lg bg-white/10 px-4 py-2">
                    <span className="text-sm text-slate-300">MySimsar Score</span>
                    <span className="ml-2 text-lg font-bold text-amber-400">{simsar.score}/100</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                {simsar.whatsappNumber && (
                  <a
                    href={`https://wa.me/${simsar.whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 sm:px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                )}
                <button
                  onClick={handleWorkWithSimsar}
                  className="rounded-lg bg-amber-500 px-4 sm:px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600 text-sm sm:text-base"
                >
                  I Worked With This Simsar
                </button>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="border-t border-gray-100 bg-white px-4 sm:px-8">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
              {[
                { key: "about", label: "About" },
                { key: "portfolio", label: `Portfolio (${portfolio.length})` },
                { key: "reviews", label: `Reviews (${simsar.reviewCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key as typeof activeSection)}
                  className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                    activeSection === tab.key
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="grid gap-6 sm:gap-8 p-4 sm:p-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {activeSection === "about" && (
                <>
                  <section>
                    <h2 className="text-xl font-bold text-gray-900">About</h2>
                    <p className="mt-4 text-gray-600 leading-relaxed">{simsar.bio || "No bio available."}</p>
                  </section>

                  {simsar.languages.length > 0 && (
                    <section>
                      <h2 className="text-xl font-bold text-gray-900">Languages</h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {simsar.languages.map((lang) => (
                          <span key={lang} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{lang}</span>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {activeSection === "portfolio" && (
                <section>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                    <div className="flex gap-2">
                      {["all", "sale", "rental", "off-plan"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setPortfolioFilter(f as typeof portfolioFilter)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            portfolioFilter === f ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {filteredPortfolio.map((item) => (
                      <PortfolioCard key={item.id} item={item} onClick={() => setSelectedProperty(item)} />
                    ))}
                  </div>
                </section>
              )}

              {activeSection === "reviews" && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                  {simsar.reviews.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      {simsar.reviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{review.author}</span>
                                {review.verified && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Verified</span>
                                )}
                              </div>
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
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                      <p className="text-gray-500">No reviews yet.</p>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agency Card (if agency broker) */}
              {simsar.simsarType === "AGENCY_BROKER" && simsar.agency && (
                <Link
                  href={`/agency/${simsar.agency.id}`}
                  className="block rounded-xl border border-purple-200 bg-purple-50 p-6 transition-colors hover:bg-purple-100"
                >
                  <div className="flex items-center gap-4">
                    {simsar.agency.logoUrl ? (
                      <img 
                        src={simsar.agency.logoUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"} 
                        alt={simsar.agency.name} 
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-lg font-bold text-white">
                        {simsar.agency.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-purple-600">Part of Agency</p>
                      <p className="font-semibold text-gray-900">{simsar.agency.name}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-purple-700">View all brokers from this agency →</p>
                </Link>
              )}

              {/* Quick Stats */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                <dl className="mt-4 space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="font-semibold text-gray-900">{simsar.experienceYears ? `${simsar.experienceYears} years` : "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">RERA ID</dt>
                    <dd className="font-semibold text-gray-900">{simsar.reraId || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Reviews</dt>
                    <dd className="font-semibold text-gray-900">{simsar.reviewCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-semibold text-gray-900">
                      {simsar.simsarType === "AGENCY_BROKER" ? "Agency Broker" : "Individual"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Contact {simsar.name.split(" ")[0]}</h3>
                <div className="mt-4 space-y-3">
                  {simsar.whatsappNumber && (
                    <a
                      href={`https://wa.me/${simsar.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push(`/login?redirect=/simsar/${params.id}`);
                        return;
                      }
                      if (simsar.verificationStatus !== "VERIFIED") return;
                      setConversationId(undefined);
                      setShowChatModal(true);
                    }}
                    disabled={simsar.verificationStatus !== "VERIFIED"}
                    className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Message
                  </button>
                  <button
                    onClick={handleWorkWithSimsar}
                    className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    Submit Transaction Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClaimModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 sm:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {claimSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Claim Submitted!</h2>
                <p className="mt-2 text-gray-600">
                  Your transaction claim has been submitted for review. Once approved, you&apos;ll be able to leave a verified review for {simsar.name}.
                </p>
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setClaimSuccess(false);
                  }}
                  className="mt-6 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Submit Transaction Claim</h2>
                <p className="mt-2 text-gray-600">To leave a verified review, please submit proof of your transaction with {simsar.name}.</p>
                
                {claimError && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {claimError}
                  </div>
                )}
                
                <form onSubmit={handleClaimSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">Transaction Type *</label>
                    <select
                      id="transactionType"
                      value={claimForm.transactionType}
                      onChange={(e) => setClaimForm({ ...claimForm, transactionType: e.target.value })}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="purchase">Property Purchase</option>
                      <option value="rental">Property Rental</option>
                      <option value="investment">Investment</option>
                      <option value="off-plan">Off-plan Purchase</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Property Location *</label>
                    <input
                      id="location"
                      type="text"
                      required
                      value={claimForm.location}
                      onChange={(e) => setClaimForm({ ...claimForm, location: e.target.value })}
                      placeholder="e.g., Dubai Marina, Tower X"
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="proofUrl" className="block text-sm font-medium text-gray-700">Proof Document URL (optional)</label>
                    <input
                      id="proofUrl"
                      type="url"
                      value={claimForm.proofUrl}
                      onChange={(e) => setClaimForm({ ...claimForm, proofUrl: e.target.value })}
                      placeholder="https://drive.google.com/... or Dropbox link"
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Upload contract, receipt, or other proof to Google Drive/Dropbox and paste link here</p>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={claimSubmitting}
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {claimSubmitting ? "Submitting..." : "Submit Claim"}
                    </button>
                  </div>
            </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && simsar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReviewModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 sm:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {reviewSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Review Posted!</h2>
                <p className="mt-2 text-gray-600">
                  Thank you for sharing your experience. Your verified review is now visible on {simsar.name}&apos;s profile.
                </p>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewSuccess(false);
                  }}
                  className="mt-6 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                <p className="mt-2 text-gray-600">Share your experience working with {simsar.name}</p>
                
                {reviewError && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {reviewError}
                  </div>
                )}
                
                <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Rating *</label>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="p-1 transition-transform hover:scale-110"
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
                    <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">Your Review *</label>
                    <textarea
                      id="reviewText"
                      required
                      rows={4}
                      minLength={10}
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      placeholder="Tell others about your experience..."
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 10 characters</p>
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
                      disabled={reviewSubmitting || reviewForm.text.length < 10}
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewSubmitting ? "Posting..." : "Post Review"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          simsarId={simsar?.id}
          existingConversationId={conversationId}
        />
      )}
    </div>
  );
}
