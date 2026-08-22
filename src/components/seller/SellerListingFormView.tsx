'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  Save,
  Send,
  Loader2,
  Sparkles,
  ShieldAlert,
  Info,
  Tag,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/catalogue';
import {
  saveListingDraftAction,
  submitListingForReviewAction,
  uploadListingPhotoAction,
} from '@/lib/seller/actions';
import type { SellerListingItem, UsedListingCondition } from '@/lib/seller/types';

interface SellerListingFormViewProps {
  initialListing?: SellerListingItem | null;
  sellerVerified: boolean;
  kycStatus: string;
}

export function SellerListingFormView({
  initialListing,
  sellerVerified,
  kycStatus,
}: SellerListingFormViewProps) {
  const router = useRouter();

  const [listingId, setListingId] = React.useState<string | undefined>(initialListing?.id);
  const [title, setTitle] = React.useState(initialListing?.title || '');
  const [selectedCategory, setSelectedCategory] = React.useState(
    initialListing?.categoryId || CATEGORIES[0]?.id || 'C01'
  );
  const [selectedSubcategory, setSelectedSubcategory] = React.useState('');
  const [brandName, setBrandName] = React.useState(initialListing?.brandName || '');
  const [modelName, setModelName] = React.useState('');
  const [condition, setCondition] = React.useState<UsedListingCondition>(
    initialListing?.condition || 'good'
  );
  const [priceKes, setPriceKes] = React.useState(
    initialListing?.priceKes ? String(initialListing.priceKes) : ''
  );
  const [negotiable, setNegotiable] = React.useState(Boolean(initialListing?.negotiable));
  const [location, setLocation] = React.useState(initialListing?.location || 'Nairobi CBD');
  const [county, setCounty] = React.useState(initialListing?.county || 'Nairobi');
  const [description, setDescription] = React.useState(initialListing?.description || '');

  // Photo management
  const [photos, setPhotos] = React.useState<string[]>(initialListing?.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);

  // Status & Feedback
  const [savingDraft, setSavingDraft] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = React.useState(false);

  const categoryObj = CATEGORIES.find(
    (c) => c.id === selectedCategory || c.slug === selectedCategory
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file) return;

    if (photos.length >= 8) {
      setErrorMsg('Maximum 8 photos per listing allowed');
      return;
    }

    setUploadingPhoto(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadListingPhotoAction(formData);
      if (!res.success || !res.data?.url) {
        setErrorMsg(res.message || 'Photo upload failed');
      } else {
        setPhotos((prev) => [...prev, res.data.url]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a product title before saving a draft');
      return;
    }

    setSavingDraft(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await saveListingDraftAction({
        listingId,
        title,
        description,
        priceKes: Number(priceKes) || 0,
        negotiable,
        condition,
        categorySlugOrId: categoryObj?.slug || selectedCategory,
        subcategoryId: selectedSubcategory || undefined,
        brandName,
        modelName,
        location,
        county,
        photos,
        step: 1,
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        if (res.listingId) setListingId(res.listingId);
        setSuccessMsg('Draft saved successfully! You can resume anytime.');
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitForReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Product title is required');
      return;
    }

    const price = Number(priceKes);
    if (isNaN(price) || price <= 0) {
      setErrorMsg('Please enter a valid asking price in KSh');
      return;
    }

    if (photos.length === 0) {
      setErrorMsg('Please upload at least one photo of the actual device');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await submitListingForReviewAction(listingId || '', {
        listingId,
        title,
        description,
        priceKes: price,
        negotiable,
        condition,
        categorySlugOrId: categoryObj?.slug || selectedCategory,
        subcategoryId: selectedSubcategory || undefined,
        brandName,
        modelName,
        location,
        county,
        photos,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setSubmitting(false);
        return;
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div id="main" className="mx-auto w-full max-w-2xl px-4 py-12 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-sm">
          <CheckCircle2 size={42} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-heading">Listing Submitted for Review!</h2>
          <p className="mt-2 text-xs text-neutral-600 max-w-md mx-auto">
            Your listing <span className="font-semibold text-heading">&quot;{title}&quot;</span> has been sent to our moderation queue.
            Once approved by marketplace moderators, it will be immediately published to the storefront!
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <Link href="/seller">
            <Button size="lg" className="bg-copper-600 hover:bg-copper-700 text-white text-xs font-semibold">
              Return to Seller Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setSubmittedSuccess(false);
              setListingId(undefined);
              setTitle('');
              setPriceKes('');
              setPhotos([]);
              setDescription('');
            }}
            className="text-xs"
          >
            Create Another Listing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="main" className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/seller"
          className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700"
        >
          <ArrowLeft size={14} /> Back to Seller Portal
        </Link>
        {listingId && (
          <span className="text-[11px] font-mono text-neutral-400">ID: {listingId.substring(0, 8)}...</span>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
          {initialListing?.id ? 'Edit Marketplace Listing' : 'Create New Marketplace Listing'}
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          List your smartphones, laptops, audio gear, and electronics for verified marketplace buyers in Kenya.
        </p>
      </div>

      {/* Rejection Moderator Banner */}
      {initialListing?.status === 'rejected_with_reason' && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 space-y-2">
          <div className="flex items-start gap-3">
            <ShieldAlert size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Moderator Correction Request</h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Feedback: <span className="font-semibold">{initialListing.latestModerationNote || 'Please update pricing or photos to meet marketplace standards.'}</span>
              </p>
              <p className="text-[11px] text-rose-600 mt-1">
                Make the required adjustments below and click &quot;Submit for Moderation&quot; to re-evaluate.
              </p>
            </div>
          </div>
        </div>
      )}

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

      <form onSubmit={handleSubmitForReview} className="space-y-6">
        {/* Section 1: Item Details */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card space-y-4">
          <h2 className="font-display text-base font-bold text-heading flex items-center gap-2">
            <Store size={18} className="text-copper-600" /> 1. Product Title & Classification
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-700">Product Title *</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apple iPhone 13 Pro Max 256GB Sierra Blue"
              className="mt-1 h-11 text-xs"
            />
            <span className="mt-1 block text-[11px] text-neutral-400">
              Include brand, model, storage capacity or key spec for fast search discovery.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Category *</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800 focus:border-copper-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800 focus:border-copper-400 focus:outline-none"
              >
                <option value="">General / All Subcategories</option>
                {categoryObj?.subcategories?.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Brand Name</label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Apple, Samsung, Sony, HP"
                className="mt-1 h-11 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Model / Serial Reference</label>
              <Input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. A2643 or Core i7 16GB"
                className="mt-1 h-11 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Condition */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card space-y-4">
          <h2 className="font-display text-base font-bold text-heading flex items-center gap-2">
            <Tag size={18} className="text-copper-600" /> 2. Condition, Pricing & Location
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Device Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as UsedListingCondition)}
                className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800 focus:border-copper-400 focus:outline-none"
              >
                <option value="new">Brand New (Sealed in Box)</option>
                <option value="open_box">Open Box (Like New, with Box)</option>
                <option value="like_new">Used - Like New (No Scratches)</option>
                <option value="good">Used - Good (Minor Normal Wear)</option>
                <option value="fair">Used - Fair (Visible Cosmetic Wear)</option>
                <option value="refurbished">Certified Refurbished</option>
                <option value="display">Ex-Display Unit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Asking Price (KSh) *</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-neutral-400">
                  KSh
                </span>
                <Input
                  required
                  type="number"
                  min="100"
                  step="50"
                  value={priceKes}
                  onChange={(e) => setPriceKes(e.target.value)}
                  placeholder="24500"
                  className="h-11 pl-12 text-xs font-bold text-copper-700"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="negotiableCheck"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-copper-600 focus:ring-copper-500"
            />
            <label htmlFor="negotiableCheck" className="text-xs text-neutral-700 font-medium">
              Price is negotiable for serious WhatsApp cash buyers
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
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
              <label className="block text-xs font-semibold text-neutral-700">Pickup Area / Building</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. CBD / Luthuli Ave / Westlands"
                className="mt-1 h-11 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700">
              Detailed Description & Specifications
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention battery health percentage, included chargers, box, receipt availability, warranty status, and any blemishes..."
              className="mt-1 w-full rounded-2xl border border-neutral-200 p-3 text-xs text-neutral-800 focus:border-copper-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Product Photos */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-heading flex items-center gap-2">
              <Upload size={18} className="text-copper-600" /> 3. Product Photos ({photos.length}/8)
            </h2>
            <span className="text-[11px] text-neutral-400">First image will be the primary cover photo</span>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((url, idx) => (
              <div
                key={url}
                className="group relative h-32 rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden"
              >
                <Image
                  src={url}
                  alt={`Listing photo ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="150px"
                  referrerPolicy="no-referrer"
                />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 rounded-md bg-copper-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    Cover Photo
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {photos.length < 8 && (
              <label
                className={`flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-copper-400 bg-neutral-50/50 cursor-pointer transition-all ${
                  uploadingPhoto ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {uploadingPhoto ? (
                  <div className="text-center p-3">
                    <Loader2 size={20} className="mx-auto animate-spin text-copper-600" />
                    <span className="mt-1 block text-[10px] text-neutral-500 font-medium">Uploading to storage...</span>
                  </div>
                ) : (
                  <div className="text-center p-3">
                    <Plus size={20} className="mx-auto text-neutral-400" />
                    <span className="mt-1 block text-[11px] font-semibold text-neutral-700">Add Photo</span>
                    <span className="text-[10px] text-neutral-400">JPEG/PNG up to 8MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingPhoto}
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={savingDraft || submitting}
            onClick={handleSaveDraft}
            className="w-full sm:w-auto h-12 text-xs font-semibold border-neutral-300"
          >
            {savingDraft ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> Saving Draft...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save size={14} /> Save Draft
              </span>
            )}
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={savingDraft || submitting || uploadingPhoto}
            className="w-full sm:w-auto h-12 text-xs font-semibold bg-copper-600 hover:bg-copper-700 text-white shadow-sm"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Submitting for Moderation...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send size={14} /> Submit for Moderation Review
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
