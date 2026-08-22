import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSellerDashboardData } from '@/lib/seller/queries';
import { SellerDashboardView } from '@/components/seller/SellerDashboardView';
import { SellerAuthCard } from '@/components/seller/SellerAuthCard';

export const revalidate = 0; // Fresh database state on each request

export default async function SellerDashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return (
      <div id="main" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SellerAuthCard
          title="Seller Portal Access"
          subtitle="Sign in to your Kenyan electronics seller store to view your active inventory, submit KYC verification, and list items."
        />
      </div>
    );
  }

  const dashboardData = await getSellerDashboardData(authData.user.id);

  return <SellerDashboardView initialData={dashboardData} />;
}
