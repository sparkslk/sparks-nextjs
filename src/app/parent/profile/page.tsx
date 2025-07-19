"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User as UserIcon } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  guardianRole?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isPrimary?: boolean | null;
  canMakeDecisions?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  contactNo?: string | null;
}

export default function ParentProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/parent/profile");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          image: data.image,
          role: data.role,
          guardianRole: data.guardianRole,
          isActive: data.isActive,
          isVerified: data.isVerified,
          contactNo: data.contactNo,
        });
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-64">User not found.</div>;
  }

  return (
    <div className="min-h-[60vh]  py-12 px-4 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-10">
        <div className="flex items-center gap-6 mb-8">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={96}
              height={96}
              className="rounded-full object-cover border-4 border-[#8159A8]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#8159A8]">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold text-[#8159A8] mb-1">{user.name}</h2>
            <p className="text-gray-600 text-lg">{user.email}</p>
            <p className="text-gray-500 text-sm mt-1">Role: {user.role.replace("_", " ")}</p>
          </div>
        </div>
        <div className="mb-8 space-y-4 divide-y divide-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center py-2">
            <span className="w-32 font-semibold text-gray-700">Name</span>
            <span className="text-gray-900 mt-1 sm:mt-0">{user.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center py-2">
            <span className="w-32 font-semibold text-gray-700">Email</span>
            <span className="text-gray-900 mt-1 sm:mt-0">{user.email}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center py-2">
            <span className="w-32 font-semibold text-gray-700">Role</span>
            <span className="text-gray-900 mt-1 sm:mt-0">{user.role.replace("_", " ")}</span>
          </div>
          {user.contactNo && (
            <div className="flex flex-col sm:flex-row sm:items-center py-2">
              <span className="w-32 font-semibold text-gray-700">Contact No</span>
              <span className="text-gray-900 mt-1 sm:mt-0">{user.contactNo}</span>
            </div>
          )}
          {user.isActive !== undefined && (
            <div className="flex flex-col sm:flex-row sm:items-center py-2">
              <span className="w-32 font-semibold text-gray-700">Active</span>
              <span className="text-gray-900 mt-1 sm:mt-0">{user.isActive ? "Yes" : "No"}</span>
            </div>
          )}
          {user.isVerified !== undefined && (
            <div className="flex flex-col sm:flex-row sm:items-center py-2">
              <span className="w-32 font-semibold text-gray-700">Verified</span>
              <span className="text-gray-900 mt-1 sm:mt-0">{user.isVerified ? "Yes" : "No"}</span>
            </div>
          )}
        </div>
        <Button className="w-full mt-2" onClick={() => router.push("/parent/profile/edit")}>Edit Profile</Button>
        <Button variant="outline" className="w-full mt-2" onClick={() => router.push("/parent/profile/change-password")}>Change Password</Button>
      </div>
    </div>
  );
}
