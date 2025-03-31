"use client";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import logo from "@/assets/logo.png";
import car from "@/assets/car.png";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, Loader2, MailIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/molecule/InputOTP";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

const formConfig = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    required: true,
    placeholder: "Enter your first name",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    required: true,
    placeholder: "Enter your last name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "Enter your email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Enter your password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    required: true,
    placeholder: "Confirm your password",
  },
];

// Define the base type first to avoid circular reference
type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Define validation schema using zod
const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Separate component that uses searchParams
function SignupContent() {
  const { signUpWithOtp, verifyOtp, signInWithOtp, signInWithGoogle, user } =
    useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use React state alongside URL parameters
  const [currentStep, setCurrentStep] = useState(parseInt(searchParams?.get('step') || '1'));
  const [currentEmail, setCurrentEmail] = useState(searchParams?.get('email') || '');
  
  // Update state from URL when searchParams change
  useEffect(() => {
    const stepParam = searchParams?.get('step');
    const emailParam = searchParams?.get('email');
    
    if (stepParam) {
      setCurrentStep(parseInt(stepParam));
    }
    
    if (emailParam) {
      setCurrentEmail(emailParam);
    }
  }, [searchParams]);
  
  // Function to update URL params and state
  const goToStep = useCallback((newStep: number, newEmail?: string) => {
    // Update React state
    setCurrentStep(newStep);
    if (newEmail) setCurrentEmail(newEmail);
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set('step', newStep.toString());
    if (newEmail) params.set('email', newEmail);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, []);
  
  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const isOTPComplete = otp.every((digit) => digit !== "");
    if (isOTPComplete) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const { error } = await verifyOtp(currentEmail, otp.join(""));

      if (error) {
        toast.error("An unexpected error occurred");
        return;
      }
      toast.success("OTP verified successfully");
      window.location.href = "/";
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithOtp(currentEmail);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Verification code sent successfully");
    } catch (error) {
      toast.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      // Update email in URL instead of setState
      const { error } = await signUpWithOtp(
        data.email,
        data.password,
        data.firstName,
        data.lastName
      );
      if (error) {
        toast.error("Failed to create account");
        return;
      }

      goToStep(3, data.email);
      toast.success("Account created! Please verify your email.");
    } catch (error) {
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
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
          Create an account
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
          <Button onClick={() => goToStep(2)} className="w-full">
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
            onClick={handleGoogleSignUp}
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
        <div className="text-body-2 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Log in
          </Link>
        </div>
      </>
    );
  };

  const secondPage = () => {
    return (
      <div className="flex flex-col gap-4">
        <div
          onClick={() => goToStep(1)}
          className="w-fit border-neutral-100 flex items-center gap-2 cursor-pointer flex items-center"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </div>
        <div className="text-headline-3 text-neutral-900">
          Sign up with email
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {formConfig.map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <label className="text-body-2 text-neutral-700">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <Input
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.name as keyof SignupFormValues)}
                className={
                  errors[field.name as keyof SignupFormValues]
                    ? "border-red-500 p-2.5"
                    : "p-2.5"
                }
              />
              {errors[field.name as keyof SignupFormValues] && (
                <p className="text-red-500 text-sm">
                  {errors[field.name as keyof SignupFormValues]?.message}
                </p>
              )}
            </div>
          ))}

          <Button className="w-full mt-2" disabled={loading} type="submit">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Account
          </Button>
        </form>

        <div className="text-body-2 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Log in
          </Link>
        </div>
      </div>
    );
  };

  const thirdPage = () => {
    return (
      <div className="flex flex-col gap-4">
        <div
          onClick={() => goToStep(2)}
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
    switch (currentStep) {
      case 1:
        return firstPage();
      case 2:
        return secondPage();
      case 3:
        return thirdPage();
      default:
        return firstPage();
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

// Loading fallback component
function SignupLoading() {
  return (
    <div className="w-full bg-[#00000066] flex justify-center md:py-20 min-h-screen">
      <div className="w-full md:w-[480px] h-screen md:h-fit bg-white md:rounded-lg p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupContent />
    </Suspense>
  );
}
