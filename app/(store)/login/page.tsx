'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Phone, ArrowRight, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [authMethod, setAuthMethod] = React.useState<'email' | 'phone'>('email');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [name, setName] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="main" className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:py-16">
      <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white p-6 shadow-card sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-50 text-copper-600">
            <ShieldCheck size={24} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-heading">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            {mode === 'login' ? 'Sign in to access your saved orders, wishlist, and seller messages.' : 'Sign up to manage your orders and seller profile.'}
          </p>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center text-xs text-emerald-800">
            <p className="font-bold">Authentication Action Simulated</p>
            <p className="mt-1 text-emerald-700">
              Supabase Auth migration is ready. Connect a live Supabase project environment to sign in with live JWT sessions.
            </p>
            <Button className="mt-4 w-full" onClick={() => setSubmitted(false)}>
              Back to Form
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`py-2 rounded-lg transition-all ${authMethod === 'email' ? 'bg-white text-heading shadow-sm' : 'text-neutral-500'}`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`py-2 rounded-lg transition-all ${authMethod === 'phone' ? 'bg-white text-heading shadow-sm' : 'text-neutral-500'}`}
              >
                Phone OTP
              </button>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Full Name</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Wanjiku"
                  className="mt-1 h-11 text-sm"
                />
              </div>
            )}

            {authMethod === 'email' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Email Address</label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. buyer@example.com"
                    className="mt-1 h-11 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Password</label>
                  <Input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 h-11 text-sm"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Kenyan Phone Number</label>
                <Input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="mt-1 h-11 text-sm"
                />
              </div>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={16} className="ml-1.5" />
            </Button>

            <div className="pt-2 text-center text-xs text-neutral-500">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => setMode('signup')} className="font-semibold text-copper-600 hover:underline">
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('login')} className="font-semibold text-copper-600 hover:underline">
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
