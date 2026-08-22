'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, UserCheck, AlertCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { setupDemoSellerSession } from '@/lib/seller/auth-actions';

interface SellerAuthCardProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function SellerAuthCard({
  onSuccess,
  title = 'Seller Portal Access',
  subtitle = 'Sign in or register your seller account to manage your listings and KYC verification.',
}: SellerAuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        setSuccessMsg('Signed in successfully! Loading seller dashboard...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          router.refresh();
        }, 600);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || '+254700000000',
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          setSuccessMsg('Account created and signed in! Redirecting to KYC...');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            router.refresh();
          }, 600);
        } else {
          setSuccessMsg('Account created! Please check your email to confirm registration, or sign in.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (preset: 'verified' | 'pending' | 'new') => {
    setDemoLoading(preset);
    setErrorMsg(null);
    try {
      const res = await setupDemoSellerSession(preset);
      if (!res.success) {
        setErrorMsg(res.message);
        setDemoLoading(null);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: res.email,
        password: res.password,
      });

      if (signInErr) {
        setErrorMsg(`Sign in failed: ${signInErr.message}`);
        setDemoLoading(null);
        return;
      }

      setSuccessMsg(`Switched to ${preset.toUpperCase()} Seller profile. Loading...`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        router.refresh();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo seller login failed');
      setDemoLoading(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-card">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-copper-50 text-copper-700">
          <Shield size={28} />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-heading sm:text-2xl">{title}</h2>
        <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700">
          <UserCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Test Demo Sellers */}
      <div className="mt-5 rounded-2xl border border-dashed border-copper-200 bg-copper-50/40 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-copper-900">
            <Sparkles size={14} className="text-copper-600" /> 1-Click Test Seller Accounts:
          </span>
          <Badge variant="outline" className="text-[10px] bg-white border-copper-200 text-copper-700">
            Audit Mode
          </Badge>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={Boolean(demoLoading)}
            onClick={() => handleQuickDemo('verified')}
            className="h-9 text-[11px] font-semibold border-copper-300 bg-white hover:bg-copper-50 hover:text-copper-900"
          >
            {demoLoading === 'verified' ? <Loader2 size={12} className="animate-spin" /> : 'Verified Seller'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={Boolean(demoLoading)}
            onClick={() => handleQuickDemo('pending')}
            className="h-9 text-[11px] font-semibold border-amber-300 bg-white hover:bg-amber-50 hover:text-amber-900"
          >
            {demoLoading === 'pending' ? <Loader2 size={12} className="animate-spin" /> : 'Pending KYC'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={Boolean(demoLoading)}
            onClick={() => handleQuickDemo('new')}
            className="h-9 text-[11px] font-semibold border-neutral-300 bg-white hover:bg-neutral-50 hover:text-neutral-900"
          >
            {demoLoading === 'new' ? <Loader2 size={12} className="animate-spin" /> : 'New Seller'}
          </Button>
        </div>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-neutral-200" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">or sign in with email</span>
        <div className="h-[1px] flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleAuth} className="space-y-3.5">
        {mode === 'signup' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Full Name / Store Name *</label>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kenya Electronics Store"
                className="mt-1 h-10 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Kenyan WhatsApp Number</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                className="mt-1 h-10 text-xs"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-700">Email Address *</label>
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seller@example.com"
            className="mt-1 h-10 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700">Password *</label>
          <Input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 h-10 text-xs"
          />
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full mt-2 h-11 text-xs font-semibold">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Authenticating with Supabase...
            </span>
          ) : mode === 'signin' ? (
            <span className="flex items-center gap-1.5">
              Sign In to Seller Dashboard <ArrowRight size={14} />
            </span>
          ) : (
            'Create Seller Account'
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="text-xs font-semibold text-copper-600 hover:text-copper-700 underline"
        >
          {mode === 'signin' ? "Don't have a seller account? Register here" : 'Already registered? Sign in instead'}
        </button>
      </div>
    </div>
  );
}
