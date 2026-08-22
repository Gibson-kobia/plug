import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSellerDashboardData, getSellerListingForEdit } from '@/lib/seller/queries';
import { SellerListingFormView } from '@/components/seller/SellerListingFormView';
import { SellerAuthCard } from '@/components/seller/SellerAuthCard';

export const revalidate = 0;

interface NewListingPageProps {
  searchParams: Promise<{ editId?: string }>;
}

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const supabase = createServerSupabaseClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return (
      <div id="main" className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <SellerAuthCard
          title="Sign In to Create Listing"
          subtitle="Sign in with your seller account to create or edit your marketplace product listings."
        />
      </div>
    );
  }

  const { editId } = await searchParams;
  let initialListing = null;

  if (editId) {
    initialListing = await getSellerListingForEdit(editId, authData.user.id);
  }

  const sellerData = await getSellerDashboardData(authData.user.id);

  return (
    <SellerListingFormView
      initialListing={initialListing}
      sellerVerified={Boolean(sellerData.profile?.verified)}
      kycStatus={sellerData.stats.kycStatus}
    />
  );
}
