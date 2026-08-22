'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Store,
  MapPin,
  Phone,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { submitSellerKycAction } from '@/lib/seller/actions';
import type { SellerProfileData, SellerKycDocumentData } from '@/lib/seller/types';

interface SellerKycFormViewProps {
  profile: SellerProfileData | null;
  kyc: SellerKycDocumentData | null;
}

export function SellerKycFormView({ profile, kyc }: SellerKycFormViewProps) {
  const router = useRouter();

  // Form State
  const [businessName, setBusinessName] = React.useState(profile?.displayName || '');
  const [location, setLocation] = React.useState(profile?.location || '');
  const [county, setCounty] = React.useState(profile?.county || 'Nairobi');
  const [phone, setPhone] = React.useState(profile?.whatsappNumber || '');
  const [documentType, setDocumentType] = React.useState<'national_id' | 'passport' | 'huduma_card'>(
    kyc?.documentType || 'national_id'
  );
  const [documentNumber, setDocumentNumber] = React.useState('');

  // File states
  const [frontFile, setFrontFile] = React.useState<File | null>(null);
  const [backFile, setBackFile] = React.useState<File | null>(null);
  const [selfieFile, setSelfieFile] = React.useState<File | null>(null);

  // File previews
  const [frontPreview, setFrontPreview] = React.useState<string>(kyc?.frontImageUrl || '');
  const [backPreview, setBackPreview] = React.useState<string>(kyc?.backImageUrl || '');
  const [selfiePreview, setSelfiePreview] = React.useState<string>(kyc?.selfieWithIdUrl || '');

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [showResubmitForm, setShowResubmitForm] = React.useState(
    !kyc || kyc.status === 'rejected'
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
    previewSetter: (url: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('File size exceeds 8MB. Please upload a smaller photo.');
        return;
      }
      setter(file);
      previewSetter(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('businessName', businessName);
    formData.append('location', location);
    formData.append('county', county);
    formData.append('phone', phone);
    formData.append('documentType', documentType);
    formData.append('documentNumber', documentNumber || 'ID-RECHECK');

    if (frontFile) formData.append('frontImage', frontFile);
    if (backFile) formData.append('backImage', backFile);
    if (selfieFile) formData.append('selfieImage', selfieFile);

    if (kyc?.frontImageUrl && !frontFile) formData.append('existingFrontUrl', kyc.frontImageUrl);
    if (kyc?.backImageUrl && !backFile) formData.append('existingBackUrl', kyc.backImageUrl);
    if (kyc?.selfieWithIdUrl && !selfieFile) formData.append('existingSelfieUrl', kyc.selfieWithIdUrl);

    try {
      const res = await submitSellerKycAction(formData);
      if (!res.success) {
        setErrorMsg(res.message);
        setLoading(false);
        return;
      }

      setSuccessMsg(res.message);
      setShowResubmitForm(false);
      setTimeout(() => {
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const isApproved = profile?.kycStatus === 'approved' || kyc?.status === 'approved';
  const isPending = (profile?.kycStatus === 'pending' || kyc?.status === 'pending') && !showResubmitForm;
  const isRejected = kyc?.status === 'rejected';

  return (
    <div id="main" className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/seller"
          className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700"
        >
          <ArrowLeft size={14} /> Back to Seller Portal
        </Link>
        {isApproved && (
          <Badge variant="verified" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            <CheckCircle2 size={12} className="mr-1" /> Approved Seller
          </Badge>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
          Seller Verification & KYC
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          In compliance with Kenya electronics trade guidelines, all marketplace merchants must verify their identity.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Approved State Banner */}
      {isApproved && !showResubmitForm && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-emerald-900">Your Seller Account is Fully Verified</h2>
            <p className="mt-1 text-xs text-emerald-700 max-w-md mx-auto">
              Your Kenyan National ID / Huduma Card has been verified by marketplace moderators. Your listings display the Verified Seller trust badge.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/seller">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                Go to Seller Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResubmitForm(true)}
              className="text-xs border-emerald-300"
            >
              Update Documents
            </Button>
          </div>
        </div>
      )}

      {/* Pending State Banner */}
      {isPending && !showResubmitForm && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Clock size={36} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-amber-900">KYC Verification Under Review</h2>
            <p className="mt-1 text-xs text-amber-700 max-w-md mx-auto">
              Your documents were submitted on{' '}
              <span className="font-semibold">{new Date(kyc?.submittedAt || Date.now()).toLocaleDateString()}</span>.
              Marketplace moderators review all submissions within 24 hours.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/seller">
              <Button variant="outline" className="text-xs">
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResubmitForm(true)}
              className="text-xs text-amber-800 underline"
            >
              Edit Submitted Information
            </Button>
          </div>
        </div>
      )}

      {/* Rejected Alert Banner */}
      {isRejected && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Verification Rejected by Moderator</h3>
              <p className="mt-1 text-xs text-rose-800">
                Reason:{' '}
                <span className="font-semibold">
                  {kyc?.rejectionReason || 'The uploaded ID was blurry or unreadable. Please submit a clearer photo.'}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-rose-600">
                Please correct the information or upload clearer photos below and resubmit for immediate re-evaluation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KYC Form */}
      {(showResubmitForm || (!isApproved && !isPending)) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Business Profile */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card space-y-4">
            <h2 className="font-display text-base font-bold text-heading flex items-center gap-2">
              <Store size={18} className="text-copper-600" /> 1. Merchant & Shop Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Business / Store Name *</label>
              <Input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Nairobi Gadgets Corner"
                className="mt-1 h-11 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">County *</label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800 focus:border-copper-400 focus:outline-none"
                >
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kisumu">Kisumu</option>
                  <option value="Nakuru">Nakuru</option>
                  <option value="Eldoret">Uasin Gishu (Eldoret)</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Machakos">Machakos</option>
                  <option value="Other">Other County</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">WhatsApp Business Number *</label>
                <Input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678 or +254712345678"
                  className="mt-1 h-11 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Physical Shop / Building Location *
              </label>
              <Input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Luthuli Avenue, Electronic Plaza 2nd Floor Shop 14"
                className="mt-1 h-11 text-xs"
              />
            </div>
          </div>

          {/* Section 2: Identity Documents */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card space-y-4">
            <h2 className="font-display text-base font-bold text-heading flex items-center gap-2">
              <FileText size={18} className="text-copper-600" /> 2. Government Identity Verification
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Document Type *</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800 focus:border-copper-400 focus:outline-none"
                >
                  <option value="national_id">Kenyan National ID Card</option>
                  <option value="huduma_card">Huduma Card / Maisha Namba</option>
                  <option value="passport">Kenyan Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Document / ID Number *</label>
                <Input
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. 12345678 or AK123456"
                  className="mt-1 h-11 text-xs"
                />
              </div>
            </div>

            {/* Document Uploads Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
              {/* Front Photo */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  1. Front of ID *
                </label>
                <label className="relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-copper-400 bg-neutral-50/50 cursor-pointer overflow-hidden transition-all">
                  {frontPreview ? (
                    <Image
                      src={frontPreview}
                      alt="Front ID Preview"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <Upload size={20} className="mx-auto text-neutral-400" />
                      <span className="mt-1 block text-[11px] font-semibold text-neutral-600">Upload Front</span>
                      <span className="text-[10px] text-neutral-400">JPEG/PNG</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setFrontFile, setFrontPreview)}
                  />
                </label>
              </div>

              {/* Back Photo */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  2. Back of ID {documentType === 'passport' ? '(Optional)' : '*'}
                </label>
                <label className="relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-copper-400 bg-neutral-50/50 cursor-pointer overflow-hidden transition-all">
                  {backPreview ? (
                    <Image
                      src={backPreview}
                      alt="Back ID Preview"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <Upload size={20} className="mx-auto text-neutral-400" />
                      <span className="mt-1 block text-[11px] font-semibold text-neutral-600">Upload Back</span>
                      <span className="text-[10px] text-neutral-400">JPEG/PNG</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setBackFile, setBackPreview)}
                  />
                </label>
              </div>

              {/* Selfie with ID */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  3. Selfie Holding ID *
                </label>
                <label className="relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-copper-400 bg-neutral-50/50 cursor-pointer overflow-hidden transition-all">
                  {selfiePreview ? (
                    <Image
                      src={selfiePreview}
                      alt="Selfie Preview"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <Camera size={20} className="mx-auto text-neutral-400" />
                      <span className="mt-1 block text-[11px] font-semibold text-neutral-600">Selfie + ID</span>
                      <span className="text-[10px] text-neutral-400">Liveness check</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setSelfieFile, setSelfiePreview)}
                  />
                </label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full h-12 text-sm font-semibold bg-copper-600 hover:bg-copper-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Uploading & Submitting KYC to Supabase...
              </span>
            ) : (
              'Submit Verification Documents to Moderation'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
