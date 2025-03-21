"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/Auth";

export default function Login() {
  const { login, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect based on user role if already logged in
    if (user) {
      if (user.prefs?.role === "admin") {
        router.push("/admin/users");
      } else {
        router.push(`/dashboard/${user.$id}`);
      }
    }
  }, [user, router]);

  // Simple email regex for validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password length (min 8 characters)
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = await login(email, password);
      if (!loginResponse.success) {
        toast.error(loginResponse.error?.message || "Login failed");
        setIsLoading(false);
      } else {
        toast.success("Login successful!");
        const currentUser = useAuthStore.getState().user;
        // Redirect based on role after successful login
        if (currentUser?.prefs?.role === "admin") {
          router.push("/admin/users");
        } else {
          router.push(`/dashboard/${currentUser?.$id}`);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md px-6">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 transition-transform hover:scale-105">
          <h2 className="text-4xl font-bold text-center mb-4">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="flex items-center border-b border-gray-300 pb-2">
                <FaEnvelope className="text-gray-500 mr-3" />
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="Email address"
                  defaultValue={isLoading ? "user@example.com" : ""}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center border-b border-gray-300 pb-2">
                <FaLock className="text-gray-500 mr-3" />
                <input
                  type="password"
                  name="password"
                  required
                  disabled={isLoading}
                  placeholder="Password"
                  defaultValue={isLoading ? "••••••••" : ""}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white font-semibold hover:opacity-90 transition-all focus:outline-none focus-visible:ring focus-visible:ring-indigo-500"
            >
              {isLoading ? (
                <motion.div
                  className="w-6 h-6 border-4 border-t-4 border-gray-200 rounded-full"
                  style={{ borderTopColor: "#ffffff" }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="text-center mt-6">
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 transition"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 rounded-2xl pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
