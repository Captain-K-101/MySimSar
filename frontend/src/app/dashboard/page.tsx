"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, getToken } from "@/lib/auth";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
interface PortfolioItem {
  id: string;
  type: "sale" | "rental" | "off-plan";
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  images: string[]; // Multiple images support
  status: "sold" | "rented" | "available";
  date: string;
  description?: string;
}

interface SimsarProfile {
  id: string;
  name: string;
  photoUrl: string;
  companyName: string;
  bio: string;
  reraId: string;
  experienceYears: number;
  languages: string[];
  whatsappNumber: string;
  verificationStatus: string;
  tier: string;
  score: number;
}

interface ConversationPreview {
  id: string;
  lastMessageAt: string;
  lastMessage?: {
    text: string;
    senderId: string;
    senderRole: string;
    createdAt: string;
  } | null;
  simsar?: {
    id: string;
    name?: string | null;
    photoUrl?: string | null;
    verificationStatus?: string;
  };
  user?: {
    id: string;
    email?: string;
    name?: string | null;
    photoUrl?: string | null;
  };
}

/* ─────────────────────────────────────────────────────────────
   MOCK DATA (Would come from API)
───────────────────────────────────────────────────────────────── */
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
    ],
    status: "sold",
    date: "2024-11-15",
    description: "Stunning 3-bedroom penthouse with panoramic views of Dubai Marina. Features floor-to-ceiling windows, premium finishes, private terrace, and access to world-class amenities including infinity pool, gym, and 24/7 concierge service.",
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
    ],
    status: "sold",
    date: "2024-10-20",
    description: "Modern 2-bedroom apartment in the heart of Downtown Dubai with direct Burj Khalifa views. High-end finishes, smart home features, and premium building amenities.",
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
    ],
    status: "rented",
    date: "2024-09-01",
    description: "Magnificent 5-bedroom villa on Palm Jumeirah with private beach access, infinity pool, and stunning sea views. Fully furnished with designer interiors.",
  },
  {
    id: "4",
    type: "off-plan",
    title: "Creek Harbour Tower",
    location: "Dubai Creek Harbour",
    price: "AED 1,200,000",
    bedrooms: 1,
    bathrooms: 2,
    area: "950 sq ft",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    ],
    status: "sold",
    date: "2024-08-10",
    description: "Premium 1-bedroom apartment in the upcoming Creek Harbour development. Expected completion Q4 2025. Attractive payment plan available.",
  },
];

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────── */
const DashboardIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const PortfolioIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ReviewsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const OffersIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BedIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const VerifiedIcon = () => (
  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   OFFERS TAB COMPONENT (for individual brokers)
───────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   SETTINGS TAB COMPONENT
───────────────────────────────────────────────────────────────── */
interface SettingsTabProps {
  user: { id: string; email: string; role: string; simsarId?: string } | null;
  simsarProfile: SimsarProfile | null;
  isBroker: boolean;
  onProfileUpdate: (profile: SimsarProfile) => void;
}

function SettingsTab({ user, simsarProfile, isBroker, onProfileUpdate }: SettingsTabProps) {
  const [profileForm, setProfileForm] = useState({
    name: simsarProfile?.name || "",
    bio: simsarProfile?.bio || "",
    photoUrl: simsarProfile?.photoUrl || "",
    companyName: simsarProfile?.companyName || "",
    experienceYears: simsarProfile?.experienceYears?.toString() || "",
    whatsappNumber: simsarProfile?.whatsappNumber || "",
    reraId: simsarProfile?.reraId || "",
    languages: (simsarProfile?.languages || []).join(", "),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Update form when profile loads
  useEffect(() => {
    if (simsarProfile) {
      setProfileForm({
        name: simsarProfile.name || "",
        bio: simsarProfile.bio || "",
        photoUrl: simsarProfile.photoUrl || "",
        companyName: simsarProfile.companyName || "",
        experienceYears: simsarProfile.experienceYears?.toString() || "",
        whatsappNumber: simsarProfile.whatsappNumber || "",
        reraId: simsarProfile.reraId || "",
        languages: (simsarProfile.languages || []).join(", "),
      });
    }
  }, [simsarProfile]);

  const handleSaveProfile = async () => {
    if (!user?.simsarId) return;
    
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const languagesArray = profileForm.languages
        .split(",")
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profileForm.name || undefined,
            bio: profileForm.bio || undefined,
            photoUrl: profileForm.photoUrl || undefined,
            companyName: profileForm.companyName || undefined,
            experienceYears: profileForm.experienceYears ? parseInt(profileForm.experienceYears) : undefined,
            whatsappNumber: profileForm.whatsappNumber || undefined,
            reraId: profileForm.reraId || undefined,
            languages: languagesArray.length > 0 ? languagesArray : undefined,
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Update parent state
        onProfileUpdate({
          ...simsarProfile,
          ...updated,
          languages: languagesArray,
        } as SimsarProfile);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save profile");
      }
    } catch (error) {
      setSaveError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-gray-600">Manage your profile and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
            Profile saved successfully!
          </div>
        )}
        {saveError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            {saveError}
          </div>
        )}

        {/* Account Info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
            </div>
            <div>
              <a
                href="/change-password"
                className="text-sm font-medium text-amber-600 hover:text-amber-500"
              >
                Change Password →
              </a>
            </div>
          </div>
        </div>

        {/* Broker Profile Section */}
        {isBroker && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Broker Profile</h2>
            <p className="mt-1 text-sm text-gray-500">This information appears on your public profile</p>
            
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Display Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    id="companyName"
                    type="text"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Your Realty LLC"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Tell clients about yourself and your expertise..."
                />
              </div>

              <div>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">Profile Photo URL</label>
                <input
                  id="photoUrl"
                  type="url"
                  value={profileForm.photoUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="https://example.com/photo.jpg"
                />
                {profileForm.photoUrl && (
                  <div className="mt-2">
                    <img 
                      src={profileForm.photoUrl} 
                      alt="Profile preview" 
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    id="experienceYears"
                    type="number"
                    min="0"
                    max="50"
                    value={profileForm.experienceYears}
                    onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label htmlFor="reraId" className="block text-sm font-medium text-gray-700">RERA ID</label>
                  <input
                    id="reraId"
                    type="text"
                    value={profileForm.reraId}
                    onChange={(e) => setProfileForm({ ...profileForm, reraId: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="RERA-BRN-XXXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input
                  id="whatsappNumber"
                  type="tel"
                  value={profileForm.whatsappNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, whatsappNumber: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div>
                <label htmlFor="languages" className="block text-sm font-medium text-gray-700">Languages</label>
                <input
                  id="languages"
                  type="text"
                  value={profileForm.languages}
                  onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="English, Arabic, French (comma-separated)"
                />
                <p className="mt-1 text-xs text-gray-400">Separate multiple languages with commas</p>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="mt-6 flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        )}

        {/* Verification Status */}
        {isBroker && simsarProfile && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
            <div className="mt-4 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                simsarProfile.verificationStatus === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-700"
                  : simsarProfile.verificationStatus === "PENDING"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {simsarProfile.verificationStatus}
              </span>
              {simsarProfile.verificationStatus !== "VERIFIED" && (
                <p className="text-sm text-gray-500">
                  Complete your profile and submit documents for verification
                </p>
              )}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          <p className="mt-2 text-sm text-red-700">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

interface OffersTabProps {
  recruitmentOffers: Array<{
    id: string;
    message: string | null;
    status: string;
    createdAt: string;
    expiresAt: string;
    agency: { id: string; name: string; logoUrl: string | null; bio: string | null; verificationStatus: string };
  }>;
  joinRequests: Array<{
    id: string;
    message: string | null;
    status: string;
    createdAt: string;
    agency: { id: string; name: string; logoUrl: string | null; bio: string | null; verificationStatus: string };
  }>;
  isLoading: boolean;
  onRefresh: () => void;
}

function OffersTab({ recruitmentOffers, joinRequests, isLoading, onRefresh }: OffersTabProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const pendingOffers = recruitmentOffers.filter(o => o.status === "PENDING");
  const pendingRequests = joinRequests.filter(r => r.status === "PENDING");

  const handleOfferResponse = async (offerId: string, accept: boolean) => {
    setActionLoading(offerId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/offers/${offerId}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ accept }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (accept) {
        setSuccess(`You've joined ${data.agencyName}! Redirecting...`);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setSuccess("Offer declined");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdrawRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/me/requests/${requestId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Request withdrawn");
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Offers & Requests</h1>
        <p className="mt-1 text-gray-600">Manage agency recruitment offers and your join requests</p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700">
          {success}
          <button onClick={() => setSuccess("")} className="ml-4 font-medium underline">Dismiss</button>
        </div>
      )}

      {/* Recruitment Offers */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Recruitment Offers ({pendingOffers.length})
        </h2>
        
        {pendingOffers.length > 0 ? (
          <div className="space-y-4">
            {pendingOffers.map((offer) => (
              <div key={offer.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  {offer.agency.logoUrl ? (
                    <img 
                      src={offer.agency.logoUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"} 
                      alt={offer.agency.name} 
                      className="h-14 w-14 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-xl font-bold text-white">
                      {offer.agency.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{offer.agency.name}</h3>
                      {offer.agency.verificationStatus === "VERIFIED" && (
                        <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {offer.agency.bio && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{offer.agency.bio}</p>}
                    {offer.message && <p className="mt-2 text-sm text-gray-600 italic">&quot;{offer.message}&quot;</p>}
                    <p className="mt-2 text-xs text-gray-400">
                      Received {new Date(offer.createdAt).toLocaleDateString()} · 
                      Expires {new Date(offer.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOfferResponse(offer.id, false)}
                      disabled={actionLoading === offer.id}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleOfferResponse(offer.id, true)}
                      disabled={actionLoading === offer.id}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {actionLoading === offer.id ? "..." : "Accept"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-500">No pending recruitment offers</p>
            <p className="mt-2 text-sm text-gray-400">When agencies want to recruit you, their offers will appear here</p>
          </div>
        )}
      </div>

      {/* Join Requests */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          My Join Requests ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  {request.agency.logoUrl ? (
                    <img 
                      src={request.agency.logoUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"} 
                      alt={request.agency.name} 
                      className="h-14 w-14 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-xl font-bold text-white">
                      {request.agency.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{request.agency.name}</h3>
                    {request.message && <p className="mt-1 text-sm text-gray-600 italic">&quot;{request.message}&quot;</p>}
                    <p className="mt-2 text-xs text-gray-400">
                      Requested {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                      Pending
                    </span>
                    <button
                      onClick={() => handleWithdrawRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-500">No pending join requests</p>
            <Link href="/directory?filter=agencies" className="mt-2 inline-block text-sm text-amber-600 hover:text-amber-700">
              Browse agencies to join →
            </Link>
          </div>
        )}
      </div>

      {/* History (past offers/requests) */}
      {(recruitmentOffers.filter(o => o.status !== "PENDING").length > 0 || 
        joinRequests.filter(r => r.status !== "PENDING").length > 0) && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">History</h2>
          <div className="space-y-2">
            {recruitmentOffers.filter(o => o.status !== "PENDING").map((offer) => (
              <div key={offer.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Offer from {offer.agency.name}</span>
                </div>
                <span className={`text-sm font-medium ${
                  offer.status === "ACCEPTED" ? "text-emerald-600" :
                  offer.status === "DECLINED" ? "text-red-600" : "text-gray-500"
                }`}>
                  {offer.status}
                </span>
              </div>
            ))}
            {joinRequests.filter(r => r.status !== "PENDING").map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Request to {request.agency.name}</span>
                </div>
                <span className={`text-sm font-medium ${
                  request.status === "APPROVED" ? "text-emerald-600" :
                  request.status === "REJECTED" ? "text-red-600" : "text-gray-500"
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────────── */
function StatCard({ title, value, subtitle, icon, trend }: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.positive ? "text-emerald-600" : "text-red-600"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PortfolioCard({ item, onView, onEdit }: { 
  item: PortfolioItem; 
  onView: () => void;
  onEdit: () => void;
}) {
  const statusColors = {
    sold: "bg-emerald-100 text-emerald-700",
    rented: "bg-blue-100 text-blue-700",
    available: "bg-amber-100 text-amber-700",
  };

  const typeLabels = {
    sale: "For Sale",
    rental: "For Rent",
    "off-plan": "Off-Plan",
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg cursor-pointer"
      onClick={onView}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Photo count badge */}
        {item.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            +{item.images.length - 1} photos
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {typeLabels[item.type]}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[item.status]}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <p className="text-xl font-bold text-white">{item.price}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <LocationIcon />
          {item.location}
        </p>

        {/* Details */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BedIcon />
              {item.bedrooms} Beds
            </span>
            <span>{item.bathrooms} Baths</span>
            <span>{item.area}</span>
          </div>
        </div>

        {/* Date */}
        <p className="mt-3 text-xs text-gray-400">
          Completed: {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
      >
        <EditIcon />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIEW PROPERTY MODAL
───────────────────────────────────────────────────────────────── */
function ViewPropertyModal({ 
  item, 
  isOpen, 
  onClose, 
  onEdit,
  onDelete 
}: { 
  item: PortfolioItem | null; 
  isOpen: boolean; 
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item?.id]);

  if (!isOpen || !item) return null;

  const statusColors = {
    sold: "bg-emerald-100 text-emerald-700",
    rented: "bg-blue-100 text-blue-700",
    available: "bg-amber-100 text-amber-700",
  };

  const typeLabels = {
    sale: "For Sale",
    rental: "For Rent",
    "off-plan": "Off-Plan",
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close property details"
          className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <CloseIcon />
        </button>

        {/* Image Carousel */}
        <div className="relative h-72 bg-gray-900">
        <img
          src={item.images[currentImageIndex] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop"}
          alt={`${item.title} - Image ${currentImageIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop";
          }}
        />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Navigation Arrows */}
          {item.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {currentImageIndex + 1} / {item.images.length}
          </div>
          
          {/* Badges */}
          <div className="absolute left-6 bottom-16 flex gap-2">
            <span className="rounded-full bg-slate-900/80 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {typeLabels[item.type]}
            </span>
            <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${statusColors[item.status]}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>

          {/* Price */}
          <div className="absolute bottom-4 left-6">
            <p className="text-3xl font-bold text-white">{item.price}</p>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {item.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-gray-100 p-3">
            {item.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`View image ${index + 1}`}
                className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
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

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
          <p className="mt-2 flex items-center gap-2 text-gray-500">
            <LocationIcon />
            {item.location}
          </p>

          {/* Key Details */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{item.bedrooms}</p>
              <p className="text-sm text-gray-500">Bedrooms</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{item.bathrooms}</p>
              <p className="text-sm text-gray-500">Bathrooms</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{item.area.replace(' sq ft', '')}</p>
              <p className="text-sm text-gray-500">Sq Ft</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-800"
            >
              <EditIcon />
              Edit Property
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <TrashIcon />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADD/EDIT PROPERTY MODAL
───────────────────────────────────────────────────────────────── */
function PropertyFormModal({ 
  isOpen, 
  onClose, 
  onSave,
  editItem
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (item: PortfolioItem) => void;
  editItem?: PortfolioItem | null;
}) {
  const [formData, setFormData] = useState<Omit<PortfolioItem, 'id' | 'date'>>({
    type: "sale",
    title: "",
    location: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    area: "",
    images: [""],
    status: "sold",
    description: "",
  });
  const [formError, setFormError] = useState("");

  // Update form when editing
  useEffect(() => {
    if (editItem) {
      setFormData({
        type: editItem.type,
        title: editItem.title,
        location: editItem.location,
        price: editItem.price,
        bedrooms: editItem.bedrooms,
        bathrooms: editItem.bathrooms,
        area: editItem.area,
        images: editItem.images.length > 0 ? editItem.images : [""],
        status: editItem.status,
        description: editItem.description || "",
      });
    } else {
      setFormData({
        type: "sale",
        title: "",
        location: "",
        price: "",
        bedrooms: 1,
        bathrooms: 1,
        area: "",
        images: [""],
        status: "sold",
        description: "",
      });
    }
  }, [editItem, isOpen]);

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
    }
  };

  const updateImageUrl = (index: number, url: string) => {
    const newImages = [...formData.images];
    newImages[index] = url;
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    // Validation
    if (!formData.title.trim()) {
      setFormError("Property title is required");
      return;
    }
    if (!formData.location.trim()) {
      setFormError("Location is required");
      return;
    }
    if (!formData.price.trim()) {
      setFormError("Price is required");
      return;
    }
    
    // Filter out empty image URLs
    const filteredImages = formData.images.filter(url => url.trim() !== "");
    if (filteredImages.length === 0) {
      setFormError("Please add at least one image URL");
      return;
    }
    
    onSave({
      ...formData,
      images: filteredImages,
      id: editItem?.id || Date.now().toString(),
      date: editItem?.date || new Date().toISOString(),
    });
    setFormError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <CloseIcon />
        </button>

        <h2 className="text-xl font-bold text-gray-900">
          {editItem ? "Edit Property" : "Add Property to Portfolio"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {editItem ? "Update the property details" : "Showcase your successful deals"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {formError}
            </div>
          )}
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <div className="mt-2 flex gap-3">
              {[
                { value: "sale", label: "Sale" },
                { value: "rental", label: "Rental" },
                { value: "off-plan", label: "Off-Plan" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: option.value as typeof formData.type })}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formData.type === option.value
                      ? "bg-slate-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Title */}
          <div>
            <label htmlFor="property-title" className="block text-sm font-medium text-gray-700">Property Title *</label>
            <input
              id="property-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Luxury 3BR Apartment - Marina View"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Location & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="property-location" className="block text-sm font-medium text-gray-700">Location *</label>
              <input
                id="property-location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Dubai Marina"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="property-price" className="block text-sm font-medium text-gray-700">Price *</label>
              <input
                id="property-price"
                type="text"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., AED 2,500,000"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Beds, Baths, Area */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Area</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g., 1,500 sq ft"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Image URL */}
          {/* Multiple Images */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Property Images</label>
              <span className="text-xs text-gray-400">{formData.images.filter(u => u.trim()).length} image(s)</span>
            </div>
            <div className="mt-2 space-y-2">
              {formData.images.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder={`Image ${index + 1} URL (https://...)`}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="rounded-lg border border-gray-200 p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-amber-400 hover:text-amber-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Image
            </button>
            {/* Image Preview */}
            {formData.images.some(u => u.trim()) && (
              <div className="mt-3 flex gap-2 overflow-x-auto py-2">
                {formData.images.filter(u => u.trim()).map((url, index) => (
                  <div key={index} className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/96x64?text=Invalid')} />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[10px] text-white">{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the property features, highlights, and what made this deal special..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="mt-2 flex gap-3">
              {[
                { value: "sold", label: "Sold" },
                { value: "rented", label: "Rented" },
                { value: "available", label: "Available" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: option.value as typeof formData.status })}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formData.status === option.value
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-amber-500 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-600"
            >
              {editItem ? "Save Changes" : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DELETE CONFIRMATION MODAL
───────────────────────────────────────────────────────────────── */
function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  itemTitle
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onConfirm: () => void;
  itemTitle: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <TrashIcon />
        </div>
        <h2 className="mt-4 text-center text-xl font-bold text-gray-900">Delete Property</h2>
        <p className="mt-2 text-center text-gray-600">
          Are you sure you want to delete <span className="font-semibold">&quot;{itemTitle}&quot;</span>? 
          This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────────── */
interface RecruitmentOffer {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  agency: {
    id: string;
    name: string;
    logoUrl: string | null;
    bio: string | null;
    verificationStatus: string;
  };
}

interface JoinRequest {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  agency: {
    id: string;
    name: string;
    logoUrl: string | null;
    bio: string | null;
    verificationStatus: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "reviews" | "offers" | "settings">("overview");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [simsarProfile, setSimsarProfile] = useState<SimsarProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  
  // Filter state
  const [portfolioFilter, setPortfolioFilter] = useState<"all" | "sale" | "rental" | "off-plan">("all");
  
  // Offers & Requests state (for individual brokers)
  const [recruitmentOffers, setRecruitmentOffers] = useState<RecruitmentOffer[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch simsar profile and portfolio if broker
  useEffect(() => {
    if (user?.role === "BROKER" && user?.simsarId) {
      // Fetch profile
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          if (res.status === 401) {
            return null;
          }
          throw new Error("Failed to load profile");
        })
        .then((data) => {
          if (data) setSimsarProfile(data);
        })
        .catch((error) => {
          console.error("Failed to fetch simsar profile:", error);
        });

      // Fetch portfolio
      setPortfolioLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}/portfolio`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return [];
        })
        .then((data) => {
          setPortfolio(data || []);
        })
        .catch(() => {
          setPortfolio([]);
        })
        .finally(() => {
          setPortfolioLoading(false);
        });
    }
  }, [user]);

  // Fetch offers and requests for individual brokers
  useEffect(() => {
    const fetchOffersAndRequests = async () => {
      // Only fetch for individual brokers (not agency brokers or agency owners)
      if (user?.role !== "BROKER" || user?.isAgencyOwner || user?.simsarType === "AGENCY_BROKER") {
        return;
      }

      setOffersLoading(true);
      const token = localStorage.getItem("token");
      
      try {
        // Fetch recruitment offers
        // Fetch recruitment offers
        const offersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/me/offers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (offersRes.ok) {
          setRecruitmentOffers(await offersRes.json());
        } else if (offersRes.status === 401) {
          // Handled by global interceptor
          return;
        }

        // Fetch join requests
        const requestsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/me/requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (requestsRes.ok) {
          setJoinRequests(await requestsRes.json());
        } else if (requestsRes.status === 401) {
          // Handled by global interceptor
          return;
        }
      } catch (error) {
        console.error("Failed to fetch offers/requests:", error);
      } finally {
        setOffersLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOffersAndRequests();
    }
  }, [user, isAuthenticated]);

  // Filter portfolio items
  const filteredPortfolio = portfolioFilter === "all" 
    ? portfolio 
    : portfolio.filter(item => item.type === portfolioFilter);

  // Handlers
  const handleViewProperty = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditProperty = (item: PortfolioItem) => {
    setEditItem(item);
    setIsViewModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleDeleteProperty = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleSaveProperty = async (item: PortfolioItem) => {
    if (!user?.simsarId) return;
    
    const token = localStorage.getItem("token");
    const isUpdate = editItem !== null;
    
    try {
      const endpoint = isUpdate 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}/portfolio/${item.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}/portfolio`;
      
      const res = await fetch(endpoint, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: item.type,
          title: item.title,
          location: item.location,
          price: item.price,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          area: item.area,
          images: item.images,
          status: item.status,
          description: item.description,
        }),
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (isUpdate) {
          setPortfolio(prev => prev.map(p => p.id === savedItem.id ? savedItem : p));
        } else {
          setPortfolio(prev => [savedItem, ...prev]);
        }
      } else {
        // Fall back to local update if API fails
        if (isUpdate) {
          setPortfolio(prev => prev.map(p => p.id === item.id ? item : p));
        } else {
          setPortfolio(prev => [item, ...prev]);
        }
      }
    } catch {
      // Fall back to local update on network error
      if (isUpdate) {
        setPortfolio(prev => prev.map(p => p.id === item.id ? item : p));
      } else {
        setPortfolio(prev => [item, ...prev]);
      }
    }
    setEditItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || !user?.simsarId) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}/portfolio/${selectedItem.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setPortfolio(prev => prev.filter(p => p.id !== selectedItem.id));
      }
    } catch {
      // Still remove locally even if API fails
      setPortfolio(prev => prev.filter(p => p.id !== selectedItem.id));
    }
    
    setSelectedItem(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setIsFormModalOpen(true);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isBroker = user?.role === "BROKER";
  const isAdmin = user?.role === "ADMIN";
  const isAgencyOwner = user?.isAgencyOwner;
  const isIndividualBroker = isBroker && !isAgencyOwner && user?.simsarType !== "AGENCY_BROKER";
  const pendingOffersCount = recruitmentOffers.filter(o => o.status === "PENDING").length;
  const pendingRequestsCount = joinRequests.filter(r => r.status === "PENDING").length;

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <DashboardIcon /> },
    ...(isBroker ? [{ id: "portfolio", label: "My Portfolio", icon: <PortfolioIcon /> }] : []),
    ...(isIndividualBroker ? [{
      id: "offers",
      label: `Offers & Requests${pendingOffersCount + pendingRequestsCount > 0 ? ` (${pendingOffersCount + pendingRequestsCount})` : ""}`,
      icon: <OffersIcon />
    }] : []),
    { id: "reviews", label: isBroker ? "My Reviews" : "My Reviews", icon: <ReviewsIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/directory" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-lg font-bold text-white shadow-sm">
                M
              </div>
              <span className="text-xl font-bold text-gray-900">MySimsar</span>
            </Link>
          </div>

          <nav className="flex items-center gap-2 md:gap-4">
            <Link href="/directory" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900">
              Find Simsars
            </Link>
            {isBroker && simsarProfile && (
              <Link 
                href={`/simsar/${user?.simsarId}`} 
                className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                View My Profile
              </Link>
            )}
            <button
              onClick={logout}
              className="rounded-lg bg-gray-100 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white p-4 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          {/* User Info */}
          <div className="mb-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 p-4 text-white">
            <div className="flex items-center gap-3">
              {isBroker && simsarProfile?.photoUrl ? (
                <img
                  src={simsarProfile.photoUrl}
                  alt={simsarProfile.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-lg font-bold">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {simsarProfile?.name || user?.name || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-slate-300">
                  {isAdmin ? "Admin" : isBroker ? "Simsar" : "User"}
                </p>
              </div>
            </div>
            {isBroker && simsarProfile && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2">
                <span className="text-xs">MySimsar Score</span>
                <span className="font-bold">{simsarProfile.score}/100</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as typeof activeTab);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Agency Dashboard Link */}
          {isAgencyOwner && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <Link
                href="/dashboard/agency"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Agency Dashboard
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          {isBroker && (
            <div className={`${isAgencyOwner ? 'mt-3' : 'mt-6 border-t border-gray-100 pt-6'}`}>
              <button
                onClick={handleAddNew}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-600"
              >
                <PlusIcon />
                Add Property
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {simsarProfile?.name || user?.name || user?.email?.split("@")[0]}!
                </h1>
                <p className="mt-1 text-gray-600">
                  {isBroker 
                    ? "Here's an overview of your performance and activity"
                    : "Here's your account overview"}
                </p>
              </div>

              {/* Stats Grid */}
              {isBroker ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Profile Views"
                    value="1,247"
                    subtitle="This month"
                    icon={<DashboardIcon />}
                    trend={{ value: "12%", positive: true }}
                  />
                  <StatCard
                    title="Total Reviews"
                    value={simsarProfile?.tier === "Platinum" ? "127" : "45"}
                    subtitle="4.9 avg rating"
                    icon={<ReviewsIcon />}
                  />
                  <StatCard
                    title="Properties Sold"
                    value={portfolio.filter(p => p.status === "sold").length.toString()}
                    subtitle="This year"
                    icon={<PortfolioIcon />}
                  />
                  <StatCard
                    title="MySimsar Score"
                    value={`${simsarProfile?.score || 0}`}
                    subtitle={simsarProfile?.tier || "Bronze"}
                    icon={<VerifiedIcon />}
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    title="Saved Simsars"
                    value="5"
                    icon={<PortfolioIcon />}
                  />
                  <StatCard
                    title="Reviews Written"
                    value="3"
                    icon={<ReviewsIcon />}
                  />
                  <StatCard
                    title="Transaction Claims"
                    value="2"
                    subtitle="1 pending"
                    icon={<DashboardIcon />}
                  />
                </div>
              )}

              {/* Verification Status for Brokers */}
              {isBroker && simsarProfile && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
                  <div className="mt-4 flex items-center gap-4">
                    <div className={`rounded-full px-4 py-2 text-sm font-medium ${
                      simsarProfile.verificationStatus === "VERIFIED" 
                        ? "bg-emerald-100 text-emerald-700"
                        : simsarProfile.verificationStatus === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {simsarProfile.verificationStatus === "VERIFIED" ? (
                        <span className="flex items-center gap-2">
                          <VerifiedIcon /> Verified
                        </span>
                      ) : (
                        simsarProfile.verificationStatus
                      )}
                    </div>
                    {simsarProfile.verificationStatus !== "VERIFIED" && (
                      <button className="text-sm font-medium text-amber-600 hover:text-amber-700">
                        Complete Verification →
                      </button>
                    )}
                  </div>
                  
                  {simsarProfile.reraId && (
                    <p className="mt-4 text-sm text-gray-500">
                      RERA ID: <span className="font-mono font-medium text-gray-700">{simsarProfile.reraId}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Recent Activity */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <div className="mt-4 space-y-4">
                  {[
                    { action: "Profile viewed", time: "2 hours ago", user: "Anonymous" },
                    { action: "New review received", time: "1 day ago", user: "James T." },
                    { action: "Property inquiry", time: "2 days ago", user: "Sarah M." },
                    { action: "WhatsApp contact", time: "3 days ago", user: "Anonymous" },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.user}</p>
                      </div>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab (Brokers Only) */}
          {activeTab === "portfolio" && isBroker && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
                  <p className="mt-1 text-gray-600">Showcase your successful transactions to build trust</p>
                </div>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 sm:px-5 py-2.5 font-medium text-white transition-colors hover:bg-amber-600 w-full sm:w-auto"
                >
                  <PlusIcon />
                  Add Property
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { value: "all", label: "All" },
                  { value: "sale", label: "Sales" },
                  { value: "rental", label: "Rentals" },
                  { value: "off-plan", label: "Off-Plan" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setPortfolioFilter(filter.value as typeof portfolioFilter)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      portfolioFilter === filter.value
                        ? "bg-slate-900 text-white"
                        : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                    }`}
                  >
                    {filter.label}
                    {filter.value === "all" && ` (${portfolio.length})`}
                    {filter.value !== "all" && ` (${portfolio.filter(p => p.type === filter.value).length})`}
                  </button>
                ))}
              </div>

              {/* Portfolio Grid */}
              {portfolioLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading portfolio...</p>
                  </div>
                </div>
              ) : filteredPortfolio.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPortfolio.map((item) => (
                    <PortfolioCard 
                      key={item.id} 
                      item={item} 
                      onView={() => handleViewProperty(item)}
                      onEdit={() => handleEditProperty(item)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <PortfolioIcon />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {portfolioFilter === "all" ? "No properties yet" : `No ${portfolioFilter} properties`}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {portfolioFilter === "all" 
                      ? "Start adding your successful deals to showcase your expertise"
                      : "Add some properties to see them here"}
                  </p>
                  <button
                    onClick={handleAddNew}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-amber-600"
                  >
                    <PlusIcon />
                    Add Your First Property
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isBroker ? "My Reviews" : "Reviews I've Written"}
                </h1>
                <p className="mt-1 text-gray-600">
                  {isBroker 
                    ? "See what clients are saying about your service"
                    : "Manage your reviews and transaction claims"}
                </p>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {[
                  {
                    author: "James Thompson",
                    rating: 5,
                    text: "Sarah was incredibly helpful throughout our apartment search. Her knowledge of the market and attention to our needs was exceptional.",
                    date: "2024-11-20",
                    verified: true,
                  },
                  {
                    author: "Emily Chen",
                    rating: 5,
                    text: "Professional, knowledgeable, and always available. Made our first property investment in Dubai a smooth experience.",
                    date: "2024-10-15",
                    verified: true,
                  },
                ].map((review, idx) => (
                  <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700">
                          {review.author[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{review.author}</p>
                            {review.verified && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-5 w-5 ${star <= review.rating ? "text-amber-400" : "text-gray-200"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offers & Requests Tab (Individual Brokers) */}
          {activeTab === "offers" && isIndividualBroker && (
            <OffersTab
              recruitmentOffers={recruitmentOffers}
              joinRequests={joinRequests}
              isLoading={offersLoading}
              onRefresh={async () => {
                setOffersLoading(true);
                const token = localStorage.getItem("token");
                try {
                  const [offersRes, requestsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/me/offers`, {
                      headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/me/requests`, {
                      headers: { Authorization: `Bearer ${token}` },
                    }),
                  ]);
                  if (offersRes.ok) setRecruitmentOffers(await offersRes.json());
                  if (requestsRes.ok) setJoinRequests(await requestsRes.json());
                } catch (e) {
                  console.error(e);
                } finally {
                  setOffersLoading(false);
                }
              }}
            />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <SettingsTab 
              user={user} 
              simsarProfile={simsarProfile} 
              isBroker={isBroker}
              onProfileUpdate={(updated) => setSimsarProfile(updated)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ViewPropertyModal
        item={selectedItem}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedItem(null);
        }}
        onEdit={() => selectedItem && handleEditProperty(selectedItem)}
        onDelete={() => selectedItem && handleDeleteProperty(selectedItem)}
      />

      <PropertyFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSaveProperty}
        editItem={editItem}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        itemTitle={selectedItem?.title || ""}
      />
    </div>
  );
}
