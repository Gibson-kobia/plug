import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSellerDashboardData } from '@/lib/seller/queries';
import { SellerKycFormView } from '@/components/seller/SellerKycFormView';
import { SellerAuthCard } from '@/components/seller/SellerAuthCard';

export const revalidate = 0;

export default async function SellerKYCPage() {
  const supabase = createServerSupabaseClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return (
      <div id="main" className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <SellerAuthCard
          title="Seller Verification Login"
          subtitle="Sign in with your seller credentials to submit or review your National ID / Huduma KYC verification."
        />
      </div>
    );
  }

  const data = await getSellerDashboardData(authData.user.id);

  return <SellerKycFormView profile={data.profile} kyc={data.kyc} />;
}
