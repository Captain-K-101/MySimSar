"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface Broker {
  id: string;
  name: string;
  photoUrl: string | null;
  experienceYears: number | null;
  verificationStatus: string;
  rating: number;
  reviewCount: number;
}

interface JoinRequest {
  id: string;
  message: string | null;
  createdAt: string;
  simsar: {
    id: string;
    name: string;
    photoUrl: string | null;
    experienceYears: number | null;
    verificationStatus: string;
  };
}

interface Invite {
  id: string;
  email: string;
  status: string;
  invitedAt: string;
  expiresAt: string;
}

interface RecruitmentOffer {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  simsar: {
    id: string;
    name: string;
    photoUrl: string | null;
    experienceYears: number | null;
    verificationStatus: string;
    companyName: string | null;
  };
}

interface CreatedBrokerCredentials {
  email: string;
  temporaryPassword: string;
  brokerName: string;
  mustChangePassword: boolean;
  converted?: boolean;
  message?: string;
}

interface Agency {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  reraLicenseNumber: string | null;
  reraLicenseUrl: string | null;
  tradeLicenseUrl: string | null;
  officeAddress: string | null;
  officePhotosUrl: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  verificationStatus: string;
  verificationNotes: string | null;
  brokerCount: number;
  pendingInvites: number;
  pendingRequests: number;
  pendingOffers: number;
  brokers: Broker[];
  invites: Invite[];
  joinRequests: JoinRequest[];
  recruitmentOffers: RecruitmentOffer[];
}

/* ─── ICONS ───────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

const CopyIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

/* ─── AGENCY SETTINGS TAB ───────────────────────────────────── */
function AgencySettingsTab({ agency, onAgencyUpdate }: { agency: Agency; onAgencyUpdate: (agency: Partial<Agency>) => void }) {
  const [formData, setFormData] = useState({
    name: agency.name || "",
    bio: agency.bio || "",
    logoUrl: agency.logoUrl || "",
    bannerUrl: agency.bannerUrl || "",
    reraLicenseNumber: agency.reraLicenseNumber || "",
    reraLicenseUrl: agency.reraLicenseUrl || "",
    tradeLicenseUrl: agency.tradeLicenseUrl || "",
    officeAddress: agency.officeAddress || "",
    website: agency.website || "",
    email: agency.email || "",
    phone: agency.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${agency.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setSaveSuccess(true);
        onAgencyUpdate(formData);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save changes");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitVerification = async () => {
    // Validate required fields
    if (!formData.logoUrl || !formData.reraLicenseNumber || !formData.reraLicenseUrl || !formData.tradeLicenseUrl) {
      setError("Please fill in all required fields: Logo URL, RERA License Number, RERA License URL, and Trade License URL");
      return;
    }

    setIsSubmittingVerification(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      // First save the data
      const saveRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${agency.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            verificationStatus: "UNDER_REVIEW",
          }),
        }
      );

      if (saveRes.ok) {
        setVerificationSuccess(true);
        onAgencyUpdate({ ...formData, verificationStatus: "UNDER_REVIEW" });
      } else {
        const data = await saveRes.json();
        setError(data.error || "Failed to submit verification");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const canSubmitVerification = formData.logoUrl && formData.reraLicenseNumber && formData.reraLicenseUrl && formData.tradeLicenseUrl;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Agency Settings</h2>
        <p className="mt-1 text-gray-600">Manage your agency profile and verification</p>
      </div>

      {/* Verification Status */}
      <div className={`rounded-xl border p-6 ${
        agency.verificationStatus === "VERIFIED" 
          ? "border-emerald-200 bg-emerald-50/50"
          : agency.verificationStatus === "REJECTED"
          ? "border-red-200 bg-red-50/50"
          : agency.verificationStatus === "UNDER_REVIEW"
          ? "border-blue-200 bg-blue-50/50"
          : "border-gray-200 bg-white"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Verification Status</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                agency.verificationStatus === "VERIFIED" 
                  ? "bg-emerald-100 text-emerald-700"
                  : agency.verificationStatus === "UNDER_REVIEW"
                  ? "bg-blue-100 text-blue-700"
                  : agency.verificationStatus === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {agency.verificationStatus === "VERIFIED" && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {agency.verificationStatus === "VERIFIED" && "Verified"}
                {agency.verificationStatus === "UNDER_REVIEW" && "Under Review"}
                {agency.verificationStatus === "PENDING" && "Not Verified"}
                {agency.verificationStatus === "REJECTED" && "Rejected"}
              </span>
            </div>
            {agency.verificationStatus === "VERIFIED" && (
              <p className="mt-2 text-sm text-emerald-700">Your agency is verified and trusted by clients.</p>
            )}
            {agency.verificationStatus === "UNDER_REVIEW" && (
              <p className="mt-2 text-sm text-blue-700">Our team is reviewing your documents. This typically takes 24-48 hours.</p>
            )}
            {agency.verificationStatus === "REJECTED" && agency.verificationNotes && (
              <p className="mt-2 text-sm text-red-700">{agency.verificationNotes}</p>
            )}
            {agency.verificationStatus === "PENDING" && (
              <p className="mt-2 text-sm text-gray-600">Complete your agency profile and submit documents for verification.</p>
            )}
          </div>
        </div>
      </div>

      {verificationSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
          Verification request submitted! Our team will review your documents within 24-48 hours.
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
          Changes saved successfully!
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Basic Information</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Agency Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio / Description</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Tell clients about your agency..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Banner URL</label>
              <input
                type="url"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Contact Information</h3>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Office Address</label>
            <input
              type="text"
              value={formData.officeAddress}
              onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="123 Business Bay, Dubai, UAE"
            />
          </div>
        </div>
      </div>

      {/* Verification Documents */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Verification Documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Provide URLs to your verification documents. You can upload documents to services like Google Drive, Dropbox, or Imgur.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RERA License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reraLicenseNumber}
              onChange={(e) => setFormData({ ...formData, reraLicenseNumber: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="ORN-XXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RERA License Document URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.reraLicenseUrl}
              onChange={(e) => setFormData({ ...formData, reraLicenseUrl: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="https://drive.google.com/file/..."
            />
            <p className="mt-1 text-xs text-gray-500">Your official RERA organization license</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trade License Document URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.tradeLicenseUrl}
              onChange={(e) => setFormData({ ...formData, tradeLicenseUrl: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="https://drive.google.com/file/..."
            />
            <p className="mt-1 text-xs text-gray-500">Your UAE trade license document</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        {agency.verificationStatus !== "VERIFIED" && agency.verificationStatus !== "UNDER_REVIEW" && (
          <button
            onClick={handleSubmitVerification}
            disabled={!canSubmitVerification || isSubmittingVerification}
            className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingVerification ? "Submitting..." : "Submit for Verification"}
          </button>
        )}
      </div>

      {!canSubmitVerification && agency.verificationStatus === "PENDING" && (
        <p className="text-sm text-amber-600">
          * Fill in all required fields (Logo URL, RERA License Number, RERA License URL, Trade License URL) to submit for verification.
        </p>
      )}
    </div>
  );
}

export default function AgencyDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"brokers" | "invites" | "requests" | "offers" | "settings">("brokers");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddBrokerModal, setShowAddBrokerModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedBrokerCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newBroker, setNewBroker] = useState({ name: "", email: "", bio: "", experienceYears: "", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard/agency");
      return;
    }

    if (isAuthenticated) {
      fetchAgency();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAgency = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/my/agency`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setAgency(data);
        } else {
          // User doesn't own an agency, redirect to regular dashboard
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Failed to fetch agency:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${agency?.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invite");
      }

      setSuccess("Invite sent successfully!");
      setShowInviteModal(false);
      setInviteEmail("");
      fetchAgency();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    }
  };

  const handleAddBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${agency?.id}/brokers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newBroker,
          experienceYears: newBroker.experienceYears ? parseInt(newBroker.experienceYears) : undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create broker");
      }

      setShowAddBrokerModal(false);
      setNewBroker({ name: "", email: "", bio: "", experienceYears: "", message: "" });

      // Check if this was converted to a recruitment offer
      if (result.converted) {
        if (result.autoApproved) {
          setSuccess(`${result.message} - ${result.broker?.name || 'Broker'} is now part of your agency!`);
        } else {
          setSuccess(`${result.message}`);
        }
      } else {
        // Show credentials modal for newly created broker
        setCreatedCredentials({
          email: result.credentials.email,
          temporaryPassword: result.credentials.temporaryPassword,
          brokerName: result.broker.name,
          mustChangePassword: result.credentials.mustChangePassword,
        });
        setShowCredentialsModal(true);
      }
      
      fetchAgency();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create broker");
    }
  };

  const handleWithdrawOffer = async (offerId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${agency?.id}/recruit/${offerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Recruitment offer withdrawn");
      fetchAgency();
    } catch (error) {
      console.error("Failed to withdraw offer:", error);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const copyAllCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.temporaryPassword}`;
    await copyToClipboard(text, "all");
  };

  const handleJoinRequestDecision = async (requestId: string, approved: boolean) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/agencies/${agency?.id}/join-requests/${requestId}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approved }),
      });
      fetchAgency();
    } catch (error) {
      console.error("Failed to process request:", error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No Agency Found</h1>
          <p className="mt-2 text-gray-600">You don&apos;t have an agency yet.</p>
          <Link href="/register?role=broker" className="mt-4 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600">
            Create Agency
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
            <Image src="/images/logo.png" alt="MySimsar" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold text-gray-900">MySimsar</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/directory" className="text-sm font-medium text-gray-600 hover:text-gray-900">Directory</Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">My Profile</Link>
            <button onClick={logout} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">Sign Out</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-emerald-700">
            {success}
            <button onClick={() => setSuccess("")} className="ml-4 font-medium underline">Dismiss</button>
          </div>
        )}

        {/* Agency Header */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Banner */}
          <div className="relative h-32 bg-gradient-to-r from-purple-600 to-purple-400">
            {agency.bannerUrl && (
              <img src={agency.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="relative px-6 pb-6">
            <div className="-mt-12 flex items-end gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg">
                {agency.logoUrl ? (
                  <img src={agency.logoUrl} alt={agency.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-purple-400 text-3xl font-bold text-white">
                    {agency.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="mb-2 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
                  {agency.verificationStatus === "VERIFIED" && <VerifiedIcon />}
                </div>
                <p className="text-gray-500">{agency.brokerCount} brokers · {agency.pendingRequests} pending requests</p>
              </div>
              <Link
                href={`/agency/${agency.id}`}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                View Public Profile →
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-100 px-4 sm:px-6">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto -mb-px">
              {[
                { key: "brokers", label: `Brokers (${agency.brokerCount})` },
                { key: "offers", label: `Recruitment (${agency.pendingOffers || 0})` },
                { key: "requests", label: `Join Requests (${agency.pendingRequests})` },
                { key: "invites", label: `Invites (${agency.pendingInvites})` },
                { key: "settings", label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === tab.key
                      ? "border-purple-500 text-purple-600"
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
          {activeTab === "brokers" && (
            <div>
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Agency Brokers</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Invite Existing Broker
                  </button>
                  <button
                    onClick={() => setShowAddBrokerModal(true)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <PlusIcon />
                    Create New Broker
                  </button>
                </div>
              </div>

              {agency.brokers && agency.brokers.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {agency.brokers.map((broker) => (
                    <div key={broker.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <img
                          src={broker.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                          alt={broker.name}
                          className="h-14 w-14 rounded-xl object-cover"
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
                            <span className="ml-1 text-sm text-gray-500">({broker.reviewCount})</span>
                          </div>
                          {broker.experienceYears && (
                            <p className="mt-1 text-sm text-gray-500">{broker.experienceYears} years exp.</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/simsar/${broker.id}`}
                          className="flex-1 rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <UsersIcon />
                  <p className="mt-4 text-gray-500">No brokers in your agency yet.</p>
                  <button
                    onClick={() => setShowAddBrokerModal(true)}
                    className="mt-4 rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Add Your First Broker
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "invites" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Pending Invites</h2>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                >
                  <PlusIcon />
                  Send Invite
                </button>
              </div>

              {agency.invites && agency.invites.length > 0 ? (
                <div className="space-y-4">
                  {agency.invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div>
                        <p className="font-medium text-gray-900">{invite.email}</p>
                        <p className="text-sm text-gray-500">
                          Sent {new Date(invite.invitedAt).toLocaleDateString()} · 
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                        invite.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                        invite.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {invite.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No pending invites.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-gray-900">Join Requests</h2>
              <p className="mb-4 text-sm text-gray-500">Brokers who have requested to join your agency</p>

              {agency.joinRequests && agency.joinRequests.length > 0 ? (
                <div className="space-y-4">
                  {agency.joinRequests.map((request) => (
                    <div key={request.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <img
                          src={request.simsar.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                          alt={request.simsar.name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{request.simsar.name}</h3>
                            {request.simsar.verificationStatus === "VERIFIED" && <VerifiedIcon />}
                          </div>
                          {request.simsar.experienceYears && (
                            <p className="text-sm text-gray-500">{request.simsar.experienceYears} years experience</p>
                          )}
                          {request.message && (
                            <p className="mt-2 text-sm text-gray-600 italic">&quot;{request.message}&quot;</p>
                          )}
                          <p className="mt-2 text-xs text-gray-400">
                            Requested {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleJoinRequestDecision(request.id, false)}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleJoinRequestDecision(request.id, true)}
                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No pending join requests.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "offers" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recruitment Offers</h2>
                  <p className="mt-1 text-sm text-gray-500">Offers you&apos;ve sent to individual brokers</p>
                </div>
                <Link
                  href="/directory?filter=individual"
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                >
                  <PlusIcon />
                  Find Brokers to Recruit
                </Link>
              </div>

              {agency.recruitmentOffers && agency.recruitmentOffers.length > 0 ? (
                <div className="space-y-4">
                  {agency.recruitmentOffers.map((offer) => (
                    <div key={offer.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <img
                          src={offer.simsar.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                          alt={offer.simsar.name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{offer.simsar.name}</h3>
                            {offer.simsar.verificationStatus === "VERIFIED" && <VerifiedIcon />}
                          </div>
                          {offer.simsar.companyName && (
                            <p className="text-sm text-gray-500">{offer.simsar.companyName}</p>
                          )}
                          {offer.simsar.experienceYears && (
                            <p className="text-sm text-gray-500">{offer.simsar.experienceYears} years experience</p>
                          )}
                          {offer.message && (
                            <p className="mt-2 text-sm text-gray-600 italic">&quot;{offer.message}&quot;</p>
                          )}
                          <p className="mt-2 text-xs text-gray-400">
                            Sent {new Date(offer.createdAt).toLocaleDateString()} · 
                            Expires {new Date(offer.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                            offer.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                            offer.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                            offer.status === "DECLINED" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {offer.status}
                          </span>
                          {offer.status === "PENDING" && (
                            <button
                              onClick={() => handleWithdrawOffer(offer.id)}
                              className="text-sm text-gray-500 hover:text-red-600"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No recruitment offers sent yet.</p>
                  <Link
                    href="/directory?filter=individual"
                    className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Browse Directory to Recruit
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <AgencySettingsTab agency={agency} onAgencyUpdate={(updated) => setAgency({ ...agency, ...updated })} />
          )}
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900">Invite Broker</h2>
            <p className="mt-2 text-gray-600">Send an invite to an existing broker to join your agency.</p>
            <form onSubmit={handleInviteBroker} className="mt-6 space-y-4">
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="broker@example.com"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowInviteModal(false); setError(""); }} className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Broker Modal */}
      {showAddBrokerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">Add Broker to Agency</h2>
            <p className="mt-2 text-gray-600">
              Enter broker details. If the email belongs to an existing broker, a recruitment offer will be sent instead.
            </p>
            <form onSubmit={handleAddBroker} className="mt-6 space-y-4">
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newBroker.name}
                  onChange={(e) => setNewBroker({ ...newBroker, name: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Ahmed Al Maktoum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newBroker.email}
                  onChange={(e) => setNewBroker({ ...newBroker, email: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="ahmed@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  If this email is already registered as a broker, they&apos;ll receive a recruitment offer
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={newBroker.experienceYears}
                  onChange={(e) => setNewBroker({ ...newBroker, experienceYears: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  rows={2}
                  value={newBroker.bio}
                  onChange={(e) => setNewBroker({ ...newBroker, bio: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Brief introduction..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recruitment Message (optional)</label>
                <textarea
                  rows={2}
                  value={newBroker.message}
                  onChange={(e) => setNewBroker({ ...newBroker, message: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="We'd love to have you on our team..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only used if the broker already exists and receives a recruitment offer
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddBrokerModal(false); setError(""); }} className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700">Add Broker</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Broker Account Created</h2>
              <button 
                onClick={() => { setShowCredentialsModal(false); setCreatedCredentials(null); }}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="mt-4 rounded-lg bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <p className="font-medium text-emerald-700">
                  Account created for {createdCredentials.brokerName}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                    <p className="mt-1 font-mono text-lg text-gray-900">{createdCredentials.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.email, "email")}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    {copiedField === "email" ? <CheckIcon /> : <CopyIcon />}
                    {copiedField === "email" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Temporary Password</p>
                    <p className="mt-1 font-mono text-lg text-gray-900">{createdCredentials.temporaryPassword}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.temporaryPassword, "password")}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    {copiedField === "password" ? <CheckIcon /> : <CopyIcon />}
                    {copiedField === "password" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={copyAllCredentials}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-600 hover:bg-gray-50"
              >
                {copiedField === "all" ? <CheckIcon /> : <CopyIcon />}
                {copiedField === "all" ? "Copied!" : "Copy All"}
              </button>
              <button
                onClick={() => {
                  setSuccess("Email functionality coming soon!");
                  setShowCredentialsModal(false);
                  setCreatedCredentials(null);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700"
              >
                <MailIcon />
                Send via Email
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                <strong>Important:</strong> The broker must change their password on first login. 
                Share these credentials securely.
              </p>
            </div>

            <button
              onClick={() => { setShowCredentialsModal(false); setCreatedCredentials(null); }}
              className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-600 hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

