"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Property {
  id: string;
  referenceNumber: string;
  type: string;
  propertyType: string;
  title: string;
  description?: string;
  location: string;
  building?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price: string;
  priceNumeric: number;
  paymentPlan?: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  areaNumeric: number;
  furnishing?: string;
  completionYear?: number;
  permitNumber?: string;
  amenities: string[];
  features: string[];
  images: string[];
  videoUrl?: string;
  floorPlanUrl?: string;
  status: string;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  broker: {
    id: string;
    name: string;
    photoUrl?: string;
    whatsappNumber?: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
    agency?: {
      id: string;
      name: string;
      logoUrl?: string;
      verificationStatus: string;
      phone?: string;
      email?: string;
    };
  };
}

interface SimilarProperty {
  id: string;
  referenceNumber: string;
  type: string;
  propertyType: string;
  title: string;
  location: string;
  price: string;
  priceNumeric: number;
  bedrooms: number;
  bathrooms: number;
  area: string;
  images: string[];
  status: string;
  broker: {
    id: string;
    name: string;
    photoUrl?: string;
    verified: boolean;
  };
}

interface OtherBroker {
  id: string;
  name: string;
  photoUrl?: string;
  whatsappNumber?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  propertiesInArea: number;
  agency?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

const AMENITY_ICONS: Record<string, string> = {
  "Pool": "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  "Gym": "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  "Parking": "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "Security": "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "Concierge": "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "Beach Access": "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  "BBQ": "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  "Central AC": "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
};

function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
          {/* Main Image */}
          <div
            className="col-span-4 md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <img
              src={images[currentIndex]}
              alt="Property"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/800x600/e2e8f0/64748b?text=Property";
              }}
            />
          </div>
          {/* Thumbnails */}
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="hidden md:block relative aspect-[4/3] cursor-pointer"
              onClick={() => {
                setCurrentIndex(idx + 1);
                setShowModal(true);
              }}
            >
              <img
                src={img}
                alt={`Property ${idx + 2}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/400x300/e2e8f0/64748b?text=Property";
                }}
              />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                  +{images.length - 5} more
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/20 rounded-full"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={images[currentIndex]}
            alt="Property"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/1200x800/e2e8f0/64748b?text=Property";
            }}
          />
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/20 rounded-full"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
          {/* Thumbnail Strip */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 ${
                  idx === currentIndex ? "border-white" : "border-transparent opacity-60"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SimilarPropertyCard({ property }: { property: SimilarProperty }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/property/${property.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative aspect-[4/3]">
        <img
          src={property.images[0] || "https://placehold.co/400x300/e2e8f0/64748b?text=Property"}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x300/e2e8f0/64748b?text=Property";
          }}
        />
        <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
          property.type === "sale" ? "bg-emerald-500 text-white" :
          property.type === "rental" ? "bg-blue-500 text-white" :
          "bg-amber-500 text-white"
        }`}>
          {property.type === "sale" ? "For Sale" : property.type === "rental" ? "For Rent" : "Off-Plan"}
        </span>
      </div>
      <div className="p-3">
        <div className="font-bold text-gray-900 mb-1">{property.price}</div>
        <div className="text-sm text-gray-600 mb-2 line-clamp-1">{property.title}</div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bed`}</span>
          <span>{property.bathrooms} Bath</span>
          <span>{property.area}</span>
        </div>
      </div>
    </div>
  );
}

function BrokerCard({ broker, property }: { broker: Property["broker"]; property: Property }) {
  const whatsappUrl = broker.whatsappNumber
    ? `https://wa.me/${broker.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi, I'm interested in ${property.title} (Ref: ${property.referenceNumber})`
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={broker.photoUrl || "https://placehold.co/64x64/e2e8f0/64748b?text=A"}
          alt={broker.name}
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/64x64/e2e8f0/64748b?text=A";
          }}
        />
        <div>
          <Link href={`/simsar/${broker.id}`} className="font-semibold text-gray-900 hover:text-emerald-600 flex items-center gap-1">
            {broker.name}
            {broker.verified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {broker.rating.toFixed(1)}
            </span>
            <span>({broker.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {broker.agency && (
        <Link
          href={`/agency/${broker.agency.id}`}
          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-4 hover:bg-gray-100"
        >
          <img
            src={broker.agency.logoUrl || "https://placehold.co/40x40/e2e8f0/64748b?text=A"}
            alt={broker.agency.name}
            className="w-10 h-10 rounded object-cover"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{broker.agency.name}</div>
            <div className="text-xs text-gray-500">Real Estate Agency</div>
          </div>
        </Link>
      )}

      <div className="space-y-2">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        )}
        <a
          href={`tel:${broker.whatsappNumber || broker.agency?.phone || ""}`}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call
        </a>
        <Link
          href={`/simsar/${broker.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          View Profile
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
        Reference: {property.referenceNumber}
      </div>
    </div>
  );
}

function OtherBrokerCard({ broker }: { broker: OtherBroker }) {
  return (
    <Link
      href={`/simsar/${broker.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <img
          src={broker.photoUrl || "https://placehold.co/48x48/e2e8f0/64748b?text=A"}
          alt={broker.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/48x48/e2e8f0/64748b?text=A";
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 flex items-center gap-1 truncate">
            {broker.name}
            {broker.verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {broker.rating.toFixed(1)}
            </span>
            <span>{broker.propertiesInArea} properties in area</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PageHeader({ isAuthenticated, logout, mobileMenuOpen, setMobileMenuOpen }: { 
  isAuthenticated: boolean; 
  logout: () => void; 
  mobileMenuOpen: boolean; 
  setMobileMenuOpen: (open: boolean) => void;
}) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-lg font-bold text-white shadow-sm">M</div>
            <span className="text-xl font-bold text-gray-900">MySimsar</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/properties" className="text-sm font-medium text-emerald-600">Properties</Link>
            <Link href="/directory" className="text-sm font-medium text-gray-600 hover:text-gray-900">Find Brokers</Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
                <button onClick={logout} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
                <Link href="/register" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Get Started</Link>
              </>
            )}
          </nav>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Home</Link>
              <Link href="/properties" className="px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg">Properties</Link>
              <Link href="/directory" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Find Brokers</Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                  <button onClick={logout} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg text-left">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Sign In</Link>
                  <Link href="/register" className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([]);
  const [otherBrokers, setOtherBrokers] = useState<OtherBroker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch property details
        const propertyRes = await fetch(`${API}/properties/${propertyId}`);
        if (!propertyRes.ok) {
          if (propertyRes.status === 404) {
            setError("Property not found");
            return;
          }
          throw new Error("Failed to fetch property");
        }
        const propertyData = await propertyRes.json();
        setProperty(propertyData);

        // Fetch similar properties and other brokers in parallel
        const [similarRes, brokersRes] = await Promise.all([
          fetch(`${API}/properties/${propertyId}/similar`),
          fetch(`${API}/properties/${propertyId}/other-brokers`),
        ]);

        if (similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilarProperties(similarData);
        }

        if (brokersRes.ok) {
          const brokersData = await brokersRes.json();
          setOtherBrokers(brokersData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader isAuthenticated={isAuthenticated} logout={logout} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="aspect-[16/9] bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-10 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader isAuthenticated={isAuthenticated} logout={logout} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Property not found"}
            </h1>
            <p className="text-gray-500 mb-4">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push("/properties")}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader isAuthenticated={isAuthenticated} logout={logout} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/properties" className="text-gray-500 hover:text-gray-700">Properties</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/properties?location=${property.location}`} className="text-gray-500 hover:text-gray-700">
              {property.location}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 truncate max-w-xs">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Image Gallery */}
        <ImageGallery images={property.images} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price & Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  property.type === "sale" ? "bg-emerald-100 text-emerald-700" :
                  property.type === "rental" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {property.type === "sale" ? "For Sale" : property.type === "rental" ? "For Rent" : "Off-Plan"}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
                  {property.propertyType}
                </span>
                {property.featured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.price}
                {property.type === "rental" && <span className="text-lg font-normal text-gray-500">/year</span>}
              </h1>
              <h2 className="text-xl text-gray-700">{property.title}</h2>
              <div className="flex items-center gap-1 text-gray-500 mt-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {property.location}
                  {property.building && ` • ${property.building}`}
                  {property.address && ` • ${property.address}`}
                </span>
              </div>
            </div>

            {/* Quick CTA Buttons */}
            <div className="flex flex-wrap gap-3 lg:hidden">
              {property.broker.whatsappNumber && (
                <a
                  href={`https://wa.me/${property.broker.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi, I'm interested in ${property.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
              <a
                href={`tel:${property.broker.whatsappNumber}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div className="text-xl font-bold text-gray-900">
                    {property.bedrooms === 0 ? "Studio" : property.bedrooms}
                  </div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <div className="text-xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <div className="text-xl font-bold text-gray-900">{property.area}</div>
                  <div className="text-sm text-gray-500">Size</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="text-xl font-bold text-gray-900 capitalize">{property.propertyType}</div>
                  <div className="text-sm text-gray-500">Type</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                {property.furnishing && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Furnishing</span>
                    <span className="font-medium">{property.furnishing}</span>
                  </div>
                )}
                {property.completionYear && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Completion Year</span>
                    <span className="font-medium">{property.completionYear}</span>
                  </div>
                )}
                {property.permitNumber && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Permit Number</span>
                    <span className="font-medium">{property.permitNumber}</span>
                  </div>
                )}
                {property.paymentPlan && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Payment Plan</span>
                    <span className="font-medium">{property.paymentPlan}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-medium">{property.referenceNumber}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Views</span>
                  <span className="font-medium">{property.viewCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={AMENITY_ICONS[amenity] || "M5 13l4 4L19 7"} />
                      </svg>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {property.features.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Plan */}
            {property.floorPlanUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Floor Plan</h3>
                <img
                  src={property.floorPlanUrl}
                  alt="Floor Plan"
                  className="w-full rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Video */}
            {property.videoUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Tour</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={property.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Location Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                  <a
                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <img
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${property.latitude},${property.longitude}&zoom=15&size=800x400&markers=color:red%7C${property.latitude},${property.longitude}&key=YOUR_API_KEY`}
                      alt="Location Map"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/800x400/e2e8f0/64748b?text=View+on+Google+Maps";
                      }}
                    />
                  </a>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {property.address || property.location}
                </p>
              </div>
            )}

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Similar Properties</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarProperties.map((sp) => (
                    <SimilarPropertyCard key={sp.id} property={sp} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Brokers */}
            {otherBrokers.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Other Brokers in {property.location}
                </h3>
                <p className="text-gray-500 mb-4">
                  {otherBrokers.length} other agent{otherBrokers.length > 1 ? "s" : ""} with properties in this area
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherBrokers.map((broker) => (
                    <OtherBrokerCard key={broker.id} broker={broker} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Broker Card */}
          <div className="hidden lg:block">
            <BrokerCard broker={property.broker} property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}

