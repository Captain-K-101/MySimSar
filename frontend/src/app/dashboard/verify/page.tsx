"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth, getToken } from "@/lib/auth";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Personal Info
  name: string;
  photoUrl: string;
  whatsappNumber: string;
  bio: string;
  // Step 2: Professional Info
  reraId: string;
  licenseNumber: string;
  experienceYears: string;
  specialties: string[];
  areasOfOperation: string[];
  languages: string[];
  // Step 3: Documents
  reraCertificateUrl: string;
  licenseDocUrl: string;
  emiratesId: string;
  emiratesIdUrl: string;
}

interface VerificationStatus {
  status: string;
  notes: string | null;
  history: Array<{
    id: string;
    status: string;
    submittedAt: string;
    decidedAt: string | null;
    adminNotes: string | null;
  }>;
}

const SPECIALTIES = [
  "Off-plan Properties",
  "Luxury Properties",
  "Commercial Real Estate",
  "Residential Rentals",
  "Villa Sales",
  "Apartment Sales",
  "Investment Properties",
  "Property Management",
];

const AREAS = [
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "JVC (Jumeirah Village Circle)",
  "Business Bay",
  "JBR (Jumeirah Beach Residence)",
  "DIFC",
  "Dubai Hills",
  "Arabian Ranches",
  "Emaar Beachfront",
  "Abu Dhabi",
  "Sharjah",
];

const LANGUAGES = [
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Tagalog",
  "Russian",
  "French",
  "Mandarin",
  "Spanish",
  "Portuguese",
];

export default function VerifyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    photoUrl: "",
    whatsappNumber: "",
    bio: "",
    reraId: "",
    licenseNumber: "",
    experienceYears: "",
    specialties: [],
    areasOfOperation: [],
    languages: [],
    reraCertificateUrl: "",
    licenseDocUrl: "",
    emiratesId: "",
    emiratesIdUrl: "",
  });

  // Redirect if not authenticated or not a broker
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "BROKER")) {
      router.replace("/login?redirect=/dashboard/verify");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Fetch existing profile and verification status
  useEffect(() => {
    if (!user?.simsarId) return;

    const fetchData = async () => {
      try {
        const token = getToken();
        
        // Fetch profile
        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/me/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setFormData({
            name: profile.name || "",
            photoUrl: profile.photoUrl || "",
            whatsappNumber: profile.whatsappNumber || "",
            bio: profile.bio || "",
            reraId: profile.reraId || "",
            licenseNumber: profile.licenseNumber || "",
            experienceYears: profile.experienceYears?.toString() || "",
            specialties: profile.specialties || [],
            areasOfOperation: profile.areasOfOperation || [],
            languages: profile.languages || [],
            reraCertificateUrl: profile.reraCertificateUrl || "",
            licenseDocUrl: profile.licenseDocUrl || "",
            emiratesId: profile.emiratesId || "",
            emiratesIdUrl: profile.emiratesIdUrl || "",
          });
        }

        // Fetch verification status
        const statusRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}/verification-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (statusRes.ok) {
          const status = await statusRes.json();
          setVerificationStatus(status);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchData();
  }, [user?.simsarId]);

  const handleSubmit = async () => {
    if (!user?.simsarId) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/simsars/${user.simsarId}/verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            experienceYears: parseInt(formData.experienceYears) || 0,
          }),
        }
      );

      if (res.ok) {
        setSuccess(true);
        setVerificationStatus({
          status: "UNDER_REVIEW",
          notes: null,
          history: [],
        });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit verification");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (stepNum: Step): boolean => {
    switch (stepNum) {
      case 1:
        return !!(formData.name && formData.photoUrl && formData.whatsappNumber);
      case 2:
        return !!(formData.reraId && formData.licenseNumber && formData.experienceYears);
      case 3:
        return !!(formData.reraCertificateUrl && formData.licenseDocUrl);
      default:
        return true;
    }
  };

  const toggleArrayItem = (field: keyof FormData, item: string) => {
    const current = formData[field] as string[];
    if (current.includes(item)) {
      setFormData({ ...formData, [field]: current.filter((i) => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...current, item] });
    }
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show verification status if already submitted
  if (verificationStatus?.status === "UNDER_REVIEW" || verificationStatus?.status === "VERIFIED") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="MySimsar" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold text-gray-900">MySimsar</span>
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            {verificationStatus.status === "VERIFIED" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">You&apos;re Verified!</h1>
                <p className="mt-2 text-gray-600">
                  Congratulations! Your profile has been verified. You are now listed in the public directory.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">Verification Under Review</h1>
                <p className="mt-2 text-gray-600">
                  Your verification request is being reviewed by our team. This typically takes 24-48 hours.
                </p>
              </>
            )}

            {verificationStatus.history.length > 0 && (
              <div className="mt-8 text-left">
                <h2 className="font-semibold text-gray-900">Verification History</h2>
                <div className="mt-4 space-y-3">
                  {verificationStatus.history.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === "VERIFIED" ? "bg-emerald-100 text-emerald-700" :
                          item.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          item.status === "NEED_MORE_DOCS" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {item.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {item.adminNotes && (
                        <p className="mt-2 text-sm text-gray-600">{item.adminNotes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/dashboard"
              className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Show rejection status with option to resubmit
  if (verificationStatus?.status === "REJECTED" || verificationStatus?.status === "NEED_MORE_DOCS") {
    // Allow resubmission - fall through to form
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="MySimsar" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold text-gray-900">MySimsar</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Verification Submitted!</h1>
            <p className="mt-2 text-gray-600">
              Your verification request has been submitted successfully. Our team will review your documents within 24-48 hours.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              You&apos;ll receive a notification once your profile has been verified.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="MySimsar" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold text-gray-900">MySimsar</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Rejection notice */}
        {(verificationStatus?.status === "REJECTED" || verificationStatus?.status === "NEED_MORE_DOCS") && (
          <div className={`mb-6 rounded-lg p-4 ${
            verificationStatus.status === "REJECTED" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"
          }`}>
            <h3 className={`font-semibold ${verificationStatus.status === "REJECTED" ? "text-red-800" : "text-amber-800"}`}>
              {verificationStatus.status === "REJECTED" ? "Verification Rejected" : "Additional Documents Required"}
            </h3>
            {verificationStatus.notes && (
              <p className={`mt-1 text-sm ${verificationStatus.status === "REJECTED" ? "text-red-700" : "text-amber-700"}`}>
                {verificationStatus.notes}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-600">
              Please update your information and resubmit for verification.
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex flex-1 items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  step >= s ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`h-1 flex-1 mx-2 ${step > s ? "bg-amber-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Personal</span>
            <span>Professional</span>
            <span>Documents</span>
            <span>Review</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                <p className="mt-1 text-sm text-gray-600">Tell us about yourself</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Photo URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="https://example.com/photo.jpg"
                />
                {formData.photoUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.photoUrl}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Tip: Use a professional headshot. You can upload to services like Imgur or Cloudinary.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Tell clients about your experience and expertise..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
                <p className="mt-1 text-sm text-gray-600">Your credentials and experience</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    RERA ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reraId}
                    onChange={(e) => setFormData({ ...formData, reraId: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="BRN-XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="DXB-XXXX-XXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specialties</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleArrayItem("specialties", specialty)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        formData.specialties.includes(specialty)
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Areas of Operation</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArrayItem("areasOfOperation", area)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        formData.areasOfOperation.includes(area)
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Languages</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArrayItem("languages", lang)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        formData.languages.includes(lang)
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Document URLs</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Provide URLs to your verification documents. You can upload documents to services like Google Drive, Dropbox, or Imgur and paste the sharing links here.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  RERA Certificate URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.reraCertificateUrl}
                  onChange={(e) => setFormData({ ...formData, reraCertificateUrl: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="https://drive.google.com/file/..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your official RERA registration certificate
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Broker License Document URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.licenseDocUrl}
                  onChange={(e) => setFormData({ ...formData, licenseDocUrl: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="https://drive.google.com/file/..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your real estate broker license document
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Emirates ID Number
                </label>
                <input
                  type="text"
                  value={formData.emiratesId}
                  onChange={(e) => setFormData({ ...formData, emiratesId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="784-XXXX-XXXXXXX-X"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Emirates ID Document URL
                </label>
                <input
                  type="url"
                  value={formData.emiratesIdUrl}
                  onChange={(e) => setFormData({ ...formData, emiratesIdUrl: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="https://drive.google.com/file/..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Front and back of your Emirates ID (optional but recommended)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Review Your Information</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Please review your details before submitting for verification
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">Personal Information</h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Name</dt>
                      <dd className="text-gray-900">{formData.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">WhatsApp</dt>
                      <dd className="text-gray-900">{formData.whatsappNumber}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">Professional Information</h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">RERA ID</dt>
                      <dd className="text-gray-900">{formData.reraId}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">License Number</dt>
                      <dd className="text-gray-900">{formData.licenseNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Experience</dt>
                      <dd className="text-gray-900">{formData.experienceYears} years</dd>
                    </div>
                    {formData.specialties.length > 0 && (
                      <div>
                        <dt className="text-gray-500">Specialties</dt>
                        <dd className="mt-1 flex flex-wrap gap-1">
                          {formData.specialties.map((s) => (
                            <span key={s} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                              {s}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">Documents</h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500">RERA Certificate</dt>
                      <dd className="text-emerald-600">✓ Provided</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500">License Document</dt>
                      <dd className="text-emerald-600">✓ Provided</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500">Emirates ID</dt>
                      <dd className={formData.emiratesIdUrl ? "text-emerald-600" : "text-gray-400"}>
                        {formData.emiratesIdUrl ? "✓ Provided" : "Not provided"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                <strong>Note:</strong> By submitting, you confirm that all information provided is accurate and the documents are authentic. False information may result in account suspension.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as Step)}
                className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as Step)}
                disabled={!validateStep(step)}
                className="rounded-lg bg-amber-500 px-6 py-2.5 font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit for Verification"
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

