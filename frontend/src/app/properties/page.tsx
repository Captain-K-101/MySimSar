"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Property {
  id: string;
  referenceNumber: string;
  type: string;
  propertyType: string;
  title: string;
  location: string;
  building?: string;
  price: string;
  priceNumeric: number;
  bedrooms: number;
  bathrooms: number;
  area: string;
  areaNumeric: number;
  furnishing?: string;
  images: string[];
  status: string;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  broker: {
    id: string;
    name: string;
    photoUrl?: string;
    whatsappNumber?: string;
    verified: boolean;
    agency?: {
      id: string;
      name: string;
      logoUrl?: string;
    };
  };
}

interface PropertiesResponse {
  properties: Property[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const PROPERTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "penthouse", label: "Penthouse" },
  { value: "studio", label: "Studio" },
  { value: "land", label: "Land" },
  { value: "office", label: "Office" },
];

const LISTING_TYPES = [
  { value: "", label: "All" },
  { value: "sale", label: "For Sale" },
  { value: "rental", label: "For Rent" },
  { value: "off-plan", label: "Off-Plan" },
];

const BEDROOM_OPTIONS = [
  { value: "", label: "Any" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5+" },
];

const PRICE_RANGES = [
  { value: "", label: "Any Price" },
  { value: "0-500000", label: "Under 500K" },
  { value: "500000-1000000", label: "500K - 1M" },
  { value: "1000000-2000000", label: "1M - 2M" },
  { value: "2000000-5000000", label: "2M - 5M" },
  { value: "5000000-10000000", label: "5M - 10M" },
  { value: "10000000-", label: "10M+" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "area_desc", label: "Largest First" },
];

const FURNISHING_OPTIONS = [
  { value: "", label: "Any" },
  { value: "Furnished", label: "Furnished" },
  { value: "Unfurnished", label: "Unfurnished" },
  { value: "Semi-Furnished", label: "Semi-Furnished" },
];

const POPULAR_LOCATIONS = [
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "JVC",
  "Business Bay",
  "JBR",
  "Arabian Ranches",
  "DIFC",
  "Dubai Hills",
  "Jumeirah",
];

function PropertyCard({ property }: { property: Property }) {
  const router = useRouter();
  const mainImage = property.images[0] || "/placeholder-property.jpg";

  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={() => router.push(`/property/${property.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x300/e2e8f0/64748b?text=Property";
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            property.type === "sale" ? "bg-emerald-500 text-white" :
            property.type === "rental" ? "bg-blue-500 text-white" :
            "bg-amber-500 text-white"
          }`}>
            {property.type === "sale" ? "For Sale" : property.type === "rental" ? "For Rent" : "Off-Plan"}
          </span>
          {property.featured && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500 text-white">
              Featured
            </span>
          )}
        </div>
        {/* Image count */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {property.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="text-xl font-bold text-gray-900 mb-1">
          {property.price}
          {property.type === "rental" && <span className="text-sm font-normal text-gray-500">/year</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-1 mb-2">
          {property.title}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bed`}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            {property.bathrooms} Bath
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {property.area}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
          {property.building && <span className="text-gray-400">• {property.building}</span>}
        </div>

        {/* Broker */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            href={`/simsar/${property.broker.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <img
              src={property.broker.photoUrl || "https://placehold.co/32x32/e2e8f0/64748b?text=A"}
              alt={property.broker.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/32x32/e2e8f0/64748b?text=A";
              }}
            />
            <div>
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                {property.broker.name}
                {property.broker.verified && (
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </p>
              {property.broker.agency && (
                <p className="text-xs text-gray-400">{property.broker.agency.name}</p>
              )}
            </div>
          </Link>
          <span className="text-xs text-gray-400">
            Ref: {property.referenceNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [type, setType] = useState(searchParams.get("type") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const LIMIT = 12;

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (propertyType) params.set("propertyType", propertyType);
    if (location) params.set("location", location);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (furnishing) params.set("furnishing", furnishing);
    if (sort) params.set("sort", sort);
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    return params.toString();
  }, [type, propertyType, location, bedrooms, priceRange, furnishing, sort]);

  const fetchProperties = useCallback(async (newOffset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString();
      const url = `${API}/properties?${queryString}&limit=${LIMIT}&offset=${newOffset}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch properties");
      
      const data: PropertiesResponse = await res.json();
      
      if (newOffset === 0) {
        setProperties(data.properties);
      } else {
        setProperties(prev => [...prev, ...data.properties]);
      }
      
      setTotal(data.total);
      setHasMore(data.hasMore);
      setOffset(newOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (propertyType) params.set("propertyType", propertyType);
    if (location) params.set("location", location);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (priceRange) params.set("price", priceRange);
    if (furnishing) params.set("furnishing", furnishing);
    if (sort && sort !== "newest") params.set("sort", sort);
    
    const newUrl = params.toString() ? `/properties?${params.toString()}` : "/properties";
    router.replace(newUrl, { scroll: false });
    
    fetchProperties(0);
  }, [type, propertyType, location, bedrooms, priceRange, furnishing, sort, router, fetchProperties]);

  const clearAllFilters = () => {
    setType("");
    setPropertyType("");
    setLocation("");
    setBedrooms("");
    setPriceRange("");
    setFurnishing("");
    setSort("newest");
  };

  const hasActiveFilters = type || propertyType || location || bedrooms || priceRange || furnishing;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top row with title and sort */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Properties {type === "sale" ? "for Sale" : type === "rental" ? "for Rent" : type === "off-plan" ? "(Off-Plan)" : ""} in Dubai
              </h1>
              <p className="text-sm text-gray-500">
                {loading ? "Loading..." : `${total.toLocaleString()} properties found`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter row */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Type tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {LISTING_TYPES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      type === opt.value
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Property Type */}
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PROPERTY_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Location */}
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-48 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  list="locations"
                />
                <datalist id="locations">
                  {POPULAR_LOCATIONS.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

              {/* Bedrooms */}
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Beds</option>
                {BEDROOM_OPTIONS.filter(o => o.value).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label} {opt.value !== "0" ? "Bed" : ""}</option>
                ))}
              </select>

              {/* Price */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PRICE_RANGES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Furnishing */}
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Furnishing</option>
                {FURNISHING_OPTIONS.filter(o => o.value).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Clear all */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Popular locations */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-500">Popular:</span>
              {POPULAR_LOCATIONS.slice(0, 6).map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    location === loc
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button
              onClick={() => fetchProperties(0)}
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && properties.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchProperties(offset + LIMIT)}
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Loading..." : `Load More (${properties.length} of ${total})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400">{total.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Properties Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">500+</div>
              <div className="text-sm text-gray-400">Verified Agents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">50+</div>
              <div className="text-sm text-gray-400">Premium Agencies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">24/7</div>
              <div className="text-sm text-gray-400">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}

