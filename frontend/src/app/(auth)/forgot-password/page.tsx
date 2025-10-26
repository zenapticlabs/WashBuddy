"use client";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import logo from "@/assets/logo.png";
import car from "@/assets/car.png";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, Loader2, MailIcon } from "lucide-react";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";

function ForgotPasswordContent() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const analytics = useAnalytics();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setEmailError(null);
    
    try {
      // Use Supabase client directly for password reset
      const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs");
      const supabase = createClientComponentClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        analytics.track('password_reset_failed', { email, error: error.message });
        setEmailError(error.message);
        toast.error(error.message);
        return;
      }
      
      analytics.track('password_reset_sent', { email });
      setEmailSent(true);
      toast.success("Password reset email sent successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      analytics.track('password_reset_error', { email, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEmailSubmit();
    }
  };

  const firstPage = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Forgot Password?</h2>
          <p className="text-neutral-600">
            No worries! Enter your email address and we'll send you a link to reset your password.
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

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="p-2.5"
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            {emailError && (
              <span className="text-sm text-red-500">{emailError}</span>
            )}
          </div>
          
          <Button
            className="w-full"
            onClick={handleEmailSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm text-neutral-500 text-center">
            Remember your password?
          </div>
          <Button
            variant="outline"
            className="w-full border-blue-500 text-black hover:bg-blue-50"
            onClick={() => router.push('/login')}
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  };

  const successPage = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <MailIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">Check Your Email</h2>
          <p className="text-neutral-600">
            We've sent a password reset link to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-neutral-500 text-center">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setEmailSent(false);
                setEmailError(null);
              }}
              className="text-blue-500 underline"
            >
              try again
            </button>
          </p>
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


        {emailSent ? successPage() : firstPage()}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
