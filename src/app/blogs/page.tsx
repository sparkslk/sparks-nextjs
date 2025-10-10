"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function BlogsRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session?.user) {
      router.push("/login");
      return;
    }

    const userRole = (session.user as { role?: string }).role;
    
    if (userRole === 'THERAPIST') {
      router.replace("/therapist/blogs");
    } else {
      // Parents and other users go to parent blogs
      router.replace("/parent/blogs");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <LoadingSpinner message="Loading..." />;
  }

  return null; // Will redirect before showing anything
}