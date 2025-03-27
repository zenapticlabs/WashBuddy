"use client";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import logo from "@/assets/logo.png";
import car from "@/assets/car.png";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, Loader2, MailIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/molecule/InputOTP";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { signInWithOtp, verifyOtp, signInWithGoogle, user } = useAuth();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  useEffect(() => {
    const isOTPComplete = otp.every((digit) => digit !== "");
    if (isOTPComplete) {
      handleVerifyOTP();
    }
  }, [otp]);

  useEffect(() => {
    // Redirect if user is already logged in
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSendOTP = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setEmailError(null);
    try {
      const { error } = await signInWithOtp(email);

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }
      toast.success("OTP sent successfully");
      setStep(3);
    } catch (error) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await verifyOtp(email, otp.join(""));

      if (error) {
        setError(error.message);
        toast.error("An unexpected error occurred");
        return;
      }
      toast.success("OTP verified successfully");
      window.location.href = "/";
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        toast.error(error.message);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const firstPage = () => {
    return (
      <>
        <div className="flex items-center gap-2">
          <Image src={logo} alt="logo" width={42} height={42} color="#ff0000" />
          <span className="hidden lg:block text-headline-4 font-bold pl-1">
            WashBuddy
          </span>
        </div>
        <div className="text-headline-3 text-neutral-900 text-neutral-900">
          Sign in or create an account
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
        <div className="flex flex-col gap-4">
          <Button className="w-full" onClick={() => setStep(2)}>
            <MailIcon className="w-4 h-4" />
            Continue with Email
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-full bg-neutral-100"></div>
            <span className="text-body-2 text-[#2E2E2E]">Or</span>
            <div className="h-[1px] w-full bg-neutral-100"></div>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-neutral-100"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Image
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              width={18}
              height={18}
            />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full border-neutral-100 flex items-center gap-2"
          >
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Apple_logo_grey.svg"
              alt="Apple logo"
              width={18}
              height={18}
            />
            Continue with Apple
          </Button>
          <Button variant="outline" className="w-full border-neutral-100">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
              alt="Facebook logo"
              width={18}
              height={18}
            />
            Continue with Facebook
          </Button>
        </div>
        <div className="text-body-2">
          By signing up you accept our{" "}
          <Link href="/terms" className="text-blue-500 underline">
            terms of use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-500 underline">
            privacy policy
          </Link>
          .
        </div>
        <div className="text-body-2 text-neutral-900">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 underline">
            Sign up
          </Link>
        </div>
      </>
    );
  };
  const secondPage = () => {
    return (
      <div className="flex flex-col gap-4">
        <div
          onClick={() => setStep(1)}
          className="w-fit border-neutral-100 flex items-center gap-2 cursor-pointer flex items-center"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </div>
        <div className="text-headline-3 text-neutral-900 text-neutral-900">
          What is your email address?
        </div>
        <div className="flex flex-col gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="p-2.5"
          />
          {emailError && (
            <span className="text-sm text-red-500">{emailError}</span>
          )}
        </div>
        <Button className="w-full" onClick={handleSendOTP} disabled={loading}>
          {loading ? "Loading..." : "Continue"}
        </Button>
      </div>
    );
  };
  const thirdPage = () => {
    return (
      <div className="flex flex-col gap-4">
        <div
          onClick={() => setStep(2)}
          className="w-fit border-neutral-100 flex items-center gap-2 cursor-pointer flex items-center"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </div>
        <div className="text-headline-3 text-neutral-900 text-neutral-900">
          Please verify your email address
        </div>
        <div className="text-body-2 text-neutral-900">
          We just sent a 6-digit verification code to your email. Please enter
          the code within 10 minutes.
        </div>

        <InputOTP value={otp} onChange={setOtp} />

        <div className="text-body-2 text-neutral-900 flex justify-center items-center gap-2">
          Can't find the email?
          <span
            className="text-blue-500 cursor-pointer font-bold"
            onClick={handleSendOTP}
          >
            Send a new code
          </span>
        </div>
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 top-0 rounded-lg flex justify-center items-center bg-black/10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    );
  };
  const renderContent = () => {
    switch (step) {
      case 1:
        return firstPage();
      case 2:
        return secondPage();
      case 3:
        return thirdPage();
      default:
        return null;
    }
  };
  return (
    <div className="w-full bg-[#00000066] flex justify-center md:py-20 min-h-screen">
      <Toaster position="top-center" />
      <div className="w-full md:w-[480px] h-screen md:h-fit bg-white md:rounded-lg p-6 flex flex-col gap-6 relative">
        {renderContent()}
      </div>
    </div>
  );
}
