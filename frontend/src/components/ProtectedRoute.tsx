"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "./ui/button";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Please login to add your local carwash",
        description: "Login to add your local carwash and earn 25 points",
        variant: "destructive",
        action: <Button variant="destructive" className="border border-white" onClick={() => router.push("/login")}>Login</Button>
      })
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
      </div>
    ); // Or your loading component
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
