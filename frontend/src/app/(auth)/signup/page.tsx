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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formConfig = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Enter your first name",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Enter your last name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
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

export default function Page() {
  const { signUpWithOtp, verifyOtp, signInWithOtp } = useAuth();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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
    const isOTPComplete = otp.every((digit) => digit !== "");
    if (isOTPComplete) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const { error } = await verifyOtp(email, otp.join(""));

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
      const { error } = await signInWithOtp(email);
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
      // Store the email for OTP verification
      setEmail(data.email);
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

      setStep(3);

      toast.success("Account created! Please verify your email.");
    } catch (error) {
      toast.error("Failed to create account");
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
          <Button onClick={() => setStep(2)} className="w-full">
            Continue with Email
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
          onClick={() => setStep(1)}
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
              </label>
              <Input
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.name as keyof SignupFormValues)}
                className={
                  errors[field.name as keyof SignupFormValues]
                    ? "border-red-500"
                    : ""
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
    <div className="w-full h-screen bg-[#00000066] flex justify-center pt-20">
      <Toaster position="top-center" />
      <div className="w-[480px] h-fit bg-white rounded-lg p-6 flex flex-col gap-6 relative">
        {renderContent()}
      </div>
    </div>
  );
}
