"use client";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import logo from "@/assets/logo.png";
import car from "@/assets/car.png";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, Loader2, LockIcon } from "lucide-react";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAnalytics } from "@/hooks/useAnalytics";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Define the form type
type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

// Define validation schema using zod - matching signup page
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize React Hook Form - matching signup page pattern
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    // Check for error parameters from Supabase redirect
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.log('Supabase error detected:', { error, errorCode, errorDescription });
      
      if (errorCode === 'otp_expired') {
        setError("The password reset link has expired. Please request a new password reset.");
      } else if (errorCode === 'access_denied') {
        setError("Access denied. The password reset link is invalid or has expired.");
      } else {
        setError(`Password reset error: ${errorDescription || error}`);
      }
      return;
    }
    
    // Check if we have the necessary tokens from the password reset link
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    console.log('Reset password page loaded with params:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    // If we have tokens directly, set the session
    if (accessToken && refreshToken) {
      const supabase = createClientComponentClient();
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          setError("Invalid or expired reset link. Please request a new password reset.");
          console.error('Error setting session:', error);
        }
      });
      return;
    }
    
    // For Supabase password reset flow, check if user has a valid session
    // Supabase automatically sets the session when redirecting from verification
    const supabase = createClientComponentClient();
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Session check result:', { session: !!session, error });
      
      if (error) {
        console.error('Error getting session:', error);
        setError("Invalid or expired reset link. Please request a new password reset.");
        return;
      }
      
      if (!session) {
        setError("Invalid or expired reset link. Please request a new password reset.");
        return;
      }
      
      // If we have a valid session, allow password reset
      // Supabase handles the security of password reset tokens
      console.log('Valid session found for password reset');
    });
  }, [searchParams]);

  const handlePasswordUpdate = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClientComponentClient();
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        analytics.track('password_update_failed', { error: error.message });
        setError(error.message);
        return;
      }
      
      analytics.track('password_updated_successfully');
      setSuccess(true);
      toast.success("Password updated successfully");
      
      // Sign out the user after successful password update
      await supabase.auth.signOut();
      
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      analytics.track('password_update_error', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const firstPage = () => {
    return (
      <form onSubmit={handleSubmit(handlePasswordUpdate)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Reset Your Password</h2>
          <p className="text-neutral-600">
            Enter your new password below. Make sure it's secure and easy to remember.
          </p>
        </div>

        <div className="flex justify-center items-center">
          <Image
            src={car}
            alt="logo"
            width={206}
            height={188}
            color="#ff0000"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
            <div className="mt-3">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Request a new password reset
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Enter your new password"
              className="p-2.5"
              disabled={loading}
            />
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm your new password"
              className="p-2.5"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="text-sm text-red-500">{errors.confirmPassword.message}</span>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>

        <div className="text-sm text-neutral-500 text-center">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-blue-500 underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    );
  };

  const successPage = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <LockIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">Password Updated!</h2>
          <p className="text-neutral-600">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-body-2 text-neutral-900 text-center">
            Ready to sign in?
          </div>
          <Button
            variant="outline"
            className="w-full border-blue-500 text-black hover:bg-blue-50"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center md:py-20">
      <Toaster />
      <div className="w-full md:w-[480px] h-screen md:h-fit bg-white md:rounded-lg shadow-xl p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Image src={logo} alt="logo" width={42} height={42} color="#ff0000" />
          <span className="hidden lg:block text-headline-4 font-bold pl-1">
            WashBuddy
          </span>
        </div>


        {success ? successPage() : firstPage()}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
