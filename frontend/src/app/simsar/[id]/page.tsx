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
  specialties: string[];
  areasOfOperation: string[];
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
  images: string[];
  status: "sold" | "rented" | "available";
  date: string;
}

/* ─── MOCK PORTFOLIO ─────────────────────────────────────── */
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
const StarIcon = ({ filled = true, className = "h-5 w-5" }: { filled?: boolean; className?: string }) => (
  <svg className={`${className} ${filled ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={`${className} text-emerald-500`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LocationIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={`${className} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const ChatIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

const ClockIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HomeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChevronRightSmallIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

/* ─── PROPERTY DETAIL MODAL ─────────────────────────────────── */
function PropertyDetailModal({ property, onClose }: { property: PortfolioItem; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  const goToImage = (index: number) => setCurrentImageIndex(index);

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
      <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-105">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-56 sm:h-80 bg-gray-900">
          <img
            src={property.images[currentImageIndex] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop"}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute bottom-4 left-4">
            <p className="text-3xl font-bold text-white drop-shadow-lg">{property.price}</p>
          </div>

          {property.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110">
                <ChevronLeftIcon />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110">
                <ChevronRightIcon />
              </button>
            </>
          )}

          <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>

        {property.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-gray-100 p-3">
            {property.images.map((img, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${index === currentImageIndex ? "ring-2 ring-amber-500 ring-offset-2" : "opacity-60 hover:opacity-100"}`}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=150&fit=crop"; }} />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
          <p className="mt-1 flex items-center gap-2 text-gray-500">
            <LocationIcon className="h-4 w-4" />
            {property.location}
          </p>
          
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: property.bedrooms, label: "Bedrooms" },
              { value: property.bathrooms, label: "Bathrooms" },
              { value: property.area.replace(" sq ft", ""), label: "Sq Ft" },
              { value: new Date(property.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }), label: "Completed" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            </div>
            ))}
          </div>

          <button onClick={onClose} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PORTFOLIO CARD ──────────────────────────────────────── */
function PortfolioCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  const statusColors = {
    sold: "bg-emerald-500 text-white",
    rented: "bg-blue-500 text-white",
    available: "bg-amber-500 text-white",
  };
  const typeLabels = { sale: "Sale", rental: "Rental", "off-plan": "Off-Plan" };

  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-gray-300" onClick={onClick}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"} 
          alt={item.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-800">{typeLabels[item.type]}</span>
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusColors[item.status]}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xl font-bold text-white">{item.price}</p>
        </div>
        {item.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {item.images.length}
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          <LocationIcon className="h-4 w-4" />
          {item.location}
        </p>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {item.bedrooms} Beds
    </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            {item.bathrooms} Baths
          </span>
          <span className="ml-auto font-medium text-gray-900">{item.area}</span>
        </div>
      </div>
    </div>
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
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{review.author}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <VerifiedIcon className="h-3 w-3" />
                  Verified
                </span>
              )}
        </div>
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
  
  const [claimForm, setClaimForm] = useState({ transactionType: "purchase", location: "", proofUrl: "" });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "", claimId: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchSimsar = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          // Parse JSON arrays if they come as strings
          if (typeof data.specialties === 'string') {
            try { data.specialties = JSON.parse(data.specialties); } catch { data.specialties = []; }
          }
          if (typeof data.areasOfOperation === 'string') {
            try { data.areasOfOperation = JSON.parse(data.areasOfOperation); } catch { data.areasOfOperation = []; }
          }
          setSimsar(data);
        } else {
          setSimsar(null);
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

  // Calculate stats
  const salesCount = portfolio.filter(p => p.type === "sale").length;
  const rentalsCount = portfolio.filter(p => p.type === "rental").length;
  const verifiedTransactions = simsar?.reviews.filter(r => r.verified).length || 0;

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${simsar.id}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ proofLinks: { transactionType: claimForm.transactionType, location: claimForm.location, proofUrl: claimForm.proofUrl } }),
      });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${simsar.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ claimId: reviewForm.claimId, rating: reviewForm.rating, text: reviewForm.text }),
      });
      if (res.ok) {
        setReviewSuccess(true);
        setReviewForm({ rating: 5, text: "", claimId: "" });
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${params.id}`);
        if (refreshRes.ok) setSimsar(await refreshRes.json());
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
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!simsar) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="rounded-full bg-gray-100 p-6">
          <UserIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Profile Not Found</h1>
        <p className="mt-2 text-gray-600">The broker you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/directory" className="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">
          Browse Directory
          </Link>
      </div>
    );
  }

  // Format experience display
  const experienceDisplay = simsar.experienceYears 
    ? (simsar.experienceYears >= 10 ? `${simsar.experienceYears}+` : `${simsar.experienceYears}`)
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
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
                <button onClick={logout} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Sign In</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Header Card - PropertyFinder Style */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              {/* Tier Badge */}
              {simsar.tierHint && (
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                    simsar.tierHint === "Platinum" ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white" :
                    simsar.tierHint === "Gold" ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white" :
                    simsar.tierHint === "Silver" ? "bg-gradient-to-r from-gray-400 to-gray-300 text-gray-800" :
                    "bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                  }`}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                    {simsar.tierHint} Agent
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-5 sm:flex-row">
                {/* Profile Photo */}
                <div className="relative flex-shrink-0">
                <img
                  src={simsar.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"}
                  alt={simsar.name}
                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl object-cover border border-gray-200"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"; }}
                />
                {simsar.verificationStatus === "VERIFIED" && (
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow">
                      <VerifiedIcon className="h-5 w-5" />
                  </div>
                )}
              </div>

                {/* Profile Info */}
              <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{simsar.name}</h1>
                      
                      {/* Rating */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <StarIcon filled className="h-5 w-5" />
                          <span className="text-lg font-bold text-gray-900">{simsar.rating.toFixed(1)}</span>
                  </div>
                        <span className="text-gray-500">({simsar.reviewCount} ratings)</span>
                  </div>
                </div>
              </div>

                  {/* Info Pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                    {simsar.languages.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {simsar.languages.join(", ")}
                      </span>
                    )}
                    {experienceDisplay && (
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {experienceDisplay} Years Experience
                      </span>
                    )}
                  </div>

                  {/* Response Time */}
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>Usually responds within 5 minutes</span>
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-5 flex flex-wrap gap-3">
                {simsar.whatsappNumber && (
                  <a
                    href={`https://wa.me/${simsar.whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-white transition-all hover:bg-emerald-600"
                  >
                        <WhatsAppIcon className="h-5 w-5" />
                    WhatsApp
                  </a>
                )}
                <button
                      onClick={() => setActiveSection("portfolio")}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                      <HomeIcon className="h-5 w-5" />
                      View Properties
                </button>
                  </div>
              </div>
            </div>
          </div>

            {/* Agency Card (if part of agency) */}
            {simsar.simsarType === "AGENCY_BROKER" && simsar.agency && (
              <Link
                href={`/agency/${simsar.agency.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Brokerage</span>
                  {simsar.agency.logoUrl ? (
                    <img src={simsar.agency.logoUrl} alt={simsar.agency.name} className="h-8 w-8 rounded-lg object-cover" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"; }} />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-white">
                      {simsar.agency.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-gray-900">{simsar.agency.name}</span>
                </div>
                <ChevronRightSmallIcon className="h-5 w-5 text-gray-400" />
              </Link>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{salesCount}</p>
                <p className="text-sm text-gray-500">Properties for Sale</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{rentalsCount}</p>
                <p className="text-sm text-gray-500">Properties for Rent</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{verifiedTransactions}</p>
                <p className="text-sm text-gray-500">Verified Transactions</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4">
                <nav className="flex gap-6">
              {[
                { key: "about", label: "About" },
                    { key: "portfolio", label: "Portfolio", count: portfolio.length },
                    { key: "reviews", label: "Reviews", count: simsar.reviewCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key as typeof activeSection)}
                      className={`relative py-4 text-sm font-medium transition-colors ${
                    activeSection === tab.key
                          ? "text-amber-600"
                          : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                      {tab.count !== undefined && (
                        <span className="ml-1.5 text-gray-400">({tab.count})</span>
                      )}
                      {activeSection === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                      )}
                </button>
              ))}
            </nav>
          </div>

              <div className="p-5">
              {activeSection === "about" && (
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <h3 className="font-semibold text-gray-900">About</h3>
                      <p className="mt-2 text-gray-600 leading-relaxed">{simsar.bio || "No bio available yet."}</p>
                    </div>

                    {/* Specialties */}
                    {simsar.specialties && simsar.specialties.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900">Specialties</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {simsar.specialties.map((specialty) => (
                            <span key={specialty} className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 border border-amber-100">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Areas of Operation */}
                    {simsar.areasOfOperation && simsar.areasOfOperation.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900">Areas of Operation</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {simsar.areasOfOperation.map((area) => (
                            <span key={area} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-100">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                  {simsar.languages.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900">Languages</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                        {simsar.languages.map((lang) => (
                            <span key={lang} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                              {lang}
                            </span>
                        ))}
                      </div>
                      </div>
                  )}
                  </div>
              )}

              {activeSection === "portfolio" && (
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                      <h3 className="font-semibold text-gray-900">Past Transactions</h3>
                    <div className="flex gap-2">
                        {(["all", "sale", "rental", "off-plan"] as const).map((f) => (
                        <button
                          key={f}
                            onClick={() => setPortfolioFilter(f)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                            portfolioFilter === f ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                            {f === "all" ? "All" : f === "off-plan" ? "Off-Plan" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                    {filteredPortfolio.map((item) => (
                      <PortfolioCard key={item.id} item={item} onClick={() => setSelectedProperty(item)} />
                    ))}
                  </div>
                  </div>
              )}

              {activeSection === "reviews" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Client Reviews</h3>
                  {simsar.reviews.length > 0 ? (
                      <div className="space-y-4">
                      {simsar.reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  ) : (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
                        <StarIcon filled={false} className="mx-auto h-10 w-10 text-gray-300" />
                        <h4 className="mt-3 font-semibold text-gray-900">No reviews yet</h4>
                        <p className="mt-1 text-sm text-gray-500">Be the first to leave a review!</p>
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
                <h3 className="font-semibold text-gray-900">Contact {simsar.name.split(" ")[0]}</h3>
                <div className="mt-4 space-y-3">
                  {simsar.whatsappNumber && (
                    <a
                      href={`https://wa.me/${simsar.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white transition-all hover:bg-emerald-600"
                    >
                    <WhatsAppIcon className="h-5 w-5" />
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => {
                    if (!isAuthenticated) { router.push(`/login?redirect=/simsar/${params.id}`); return; }
                      if (simsar.verificationStatus !== "VERIFIED") return;
                      setConversationId(undefined);
                      setShowChatModal(true);
                    }}
                    disabled={simsar.verificationStatus !== "VERIFIED"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  <EmailIcon className="h-5 w-5" />
                  Send Message
                  </button>
                  <button
                    onClick={handleWorkWithSimsar}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-all hover:bg-amber-600"
                  >
                  Submit Transaction
                  </button>
                </div>
              </div>

            {/* Details Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Experience</dt>
                  <dd className="font-medium text-gray-900">{experienceDisplay ? `${experienceDisplay} years` : "N/A"}</dd>
            </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">RERA ID</dt>
                  <dd className="font-medium text-gray-900">{simsar.reraId || "N/A"}</dd>
          </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reviews</dt>
                  <dd className="font-medium text-gray-900">{simsar.reviewCount}</dd>
        </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-900">{simsar.simsarType === "AGENCY_BROKER" ? "Agency Broker" : "Independent"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">MySimsar Score</dt>
                  <dd className="font-bold text-amber-600">{simsar.score}</dd>
                </div>
              </dl>
            </div>

            {/* Agency Card in Sidebar */}
            {simsar.simsarType === "AGENCY_BROKER" && simsar.agency && (
              <Link
                href={`/agency/${simsar.agency.id}`}
                className="block rounded-xl border border-purple-200 bg-purple-50 p-5 transition-all hover:border-purple-300"
              >
                <div className="flex items-center gap-3">
                  {simsar.agency.logoUrl ? (
                    <img src={simsar.agency.logoUrl} alt={simsar.agency.name} className="h-12 w-12 rounded-lg object-cover" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"; }} />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 text-lg font-bold text-white">
                      {simsar.agency.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-purple-600">Part of Agency</p>
                    <p className="font-semibold text-gray-900">{simsar.agency.name}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-purple-700">View all brokers →</p>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedProperty && <PropertyDetailModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}

      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowClaimModal(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {claimSuccess ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <VerifiedIcon className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">Claim Submitted!</h2>
                <p className="mt-2 text-gray-600">Your transaction claim is under review.</p>
                <button onClick={() => { setShowClaimModal(false); setClaimSuccess(false); }} className="mt-6 rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-white hover:bg-amber-600">
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900">Submit Transaction Claim</h2>
                <p className="mt-1 text-sm text-gray-600">Verify your transaction to leave a review for {simsar.name}.</p>
                {claimError && <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{claimError}</div>}
                <form onSubmit={handleClaimSubmit} className="mt-5 space-y-4">
              <div>
                    <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">Transaction Type *</label>
                    <select id="transactionType" value={claimForm.transactionType} onChange={(e) => setClaimForm({ ...claimForm, transactionType: e.target.value })} className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      <option value="purchase">Property Purchase</option>
                      <option value="rental">Property Rental</option>
                      <option value="investment">Investment</option>
                      <option value="off-plan">Off-plan Purchase</option>
                </select>
              </div>
              <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Property Location *</label>
                    <input id="location" type="text" required value={claimForm.location} onChange={(e) => setClaimForm({ ...claimForm, location: e.target.value })} placeholder="e.g., Dubai Marina, Tower X" className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
                  <div>
                    <label htmlFor="proofUrl" className="block text-sm font-medium text-gray-700">Proof Document URL</label>
                    <input id="proofUrl" type="url" value={claimForm.proofUrl} onChange={(e) => setClaimForm({ ...claimForm, proofUrl: e.target.value })} placeholder="Link to contract or receipt" className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                    <p className="mt-1 text-xs text-gray-500">Upload to Google Drive/Dropbox and paste link</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowClaimModal(false)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={claimSubmitting} className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                      {claimSubmitting ? "Submitting..." : "Submit"}
                    </button>
              </div>
            </form>
              </>
            )}
          </div>
        </div>
      )}

      {showReviewModal && simsar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowReviewModal(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {reviewSuccess ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <VerifiedIcon className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">Review Posted!</h2>
                <p className="mt-2 text-gray-600">Thank you for sharing your experience.</p>
                <button onClick={() => { setShowReviewModal(false); setReviewSuccess(false); }} className="mt-6 rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-white hover:bg-amber-600">Done</button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                <p className="mt-1 text-sm text-gray-600">Share your experience with {simsar.name}</p>
                {reviewError && <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{reviewError}</div>}
                <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Rating</label>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="p-1 transition-transform hover:scale-110">
                          <svg className={`h-7 w-7 ${star <= reviewForm.rating ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">Your Review</label>
                    <textarea id="reviewText" required rows={4} minLength={10} value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} placeholder="Tell others about your experience..." className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={reviewSubmitting || reviewForm.text.length < 10} className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                      {reviewSubmitting ? "Posting..." : "Post Review"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {showChatModal && <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} simsarId={simsar?.id} existingConversationId={conversationId} />}
    </div>
  );
}
