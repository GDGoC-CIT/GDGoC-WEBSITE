'use client';

import React, { useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Sparkles, LayoutGrid, Calendar } from 'lucide-react';

function SignInContent() {
  const { loginWithGoogleToken } = useAuth();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get('error');

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '467176174065-4qj0m0992s9hrdaqtr3vauq58iapp0mp.apps.googleusercontent.com',
            callback: (response: any) => {
              loginWithGoogleToken(response.credential);
            }
          });
          
          (window as any).google.accounts.id.renderButton(
            document.getElementById("google-signin-container"),
            { 
              theme: "filled_blue", 
              size: "large", 
              width: "320", 
              shape: "pill",
              text: "signin_with"
            }
          );
        } catch (err) {
          console.error("Failed to render Google button:", err);
        }
      }
    };

    const timer = setTimeout(initializeGoogleSignIn, 800);
    return () => clearTimeout(timer);
  }, [loginWithGoogleToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Brand Top Banner */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="flex-1 bg-gdg-blue" />
        <div className="flex-1 bg-gdg-red" />
        <div className="flex-1 bg-gdg-yellow" />
        <div className="flex-1 bg-gdg-green" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* GDG wordmark logo */}
        <div className="inline-flex items-center text-3xl font-extrabold tracking-tight font-display text-gray-900 mb-6">
          <span className="text-gdg-blue">G</span>
          <span className="text-gdg-red">D</span>
          <span className="text-gdg-yellow">G</span>
          <span className="text-gray-650 font-semibold ml-2">on Campus</span>
          <span className="text-gdg-green font-bold ml-1.5">CIT</span>
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 font-display">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w">
          Google Developer Groups &bull; Coimbatore Institute of Technology
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-sm sm:rounded-2xl border border-gray-150 sm:px-10 space-y-6">
          
          {/* Error Message display */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start space-x-3 text-gdg-red text-xs">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Access Denied</p>
                <p className="mt-0.5 leading-relaxed">Only verified board coordinators or administrators can access admin panels. Sign in with your pre-approved email.</p>
              </div>
            </div>
          )}

          {/* Real Google OAuth Button Container */}
          <div className="flex flex-col items-center space-y-5 p-6 bg-blue-50/25 border border-blue-100 rounded-2xl">
            <span className="text-xs font-bold text-gdg-blue uppercase tracking-wider text-center flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-gdg-yellow animate-pulse" />
              Sign In with Google
            </span>
            
            <div id="google-signin-container" className="w-full flex justify-center min-h-[44px]" />
            
            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              Login requires a pre-approved email domain. Pre-approved admins include Coimbatore Institute of Technology chapter leads and board members.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Preparing sign-in console...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
