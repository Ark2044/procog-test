"use client";

import { useEffect, useState } from "react";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/Auth";
import { validateEmail } from "@/lib/validation";

export default function Login() {
  const { login, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Removed unused 'message' state

  useEffect(() => {
    // Check for message parameter in URL
    const queryParams = new URLSearchParams(window.location.search);
    const messageParam = queryParams.get("message");
    if (messageParam) {
      toast(messageParam);
    }

    // Redirect based on user role if already logged in
    if (user) {
      if (user.prefs?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(`/dashboard/${user.$id}`);
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    // Check if fields are filled
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    // Validate email format using our validation helper
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(
        emailValidation.error || "Please enter a valid email address"
      );
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
        // The redirect will be handled by the useEffect when user state updates
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 pt-16">
      <div className="w-full max-w-md py-8">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 transition-transform hover:scale-[1.02]">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Welcome Back
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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
                  className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none transition-colors text-sm sm:text-base py-1"
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
                  className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none transition-colors text-sm sm:text-base py-1"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 sm:py-3 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white font-semibold hover:opacity-90 transition-all focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 text-sm sm:text-base"
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-t-4 border-gray-200 rounded-full"
                  style={{ borderTopColor: "#ffffff" }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="text-center mt-5 sm:mt-6">
            <p className="text-gray-600 text-sm mb-2">
              Don&apos;t have an account? Please contact your system administrator.
            </p>
            <p className="text-gray-500 text-xs">
              Self-registration has been disabled for security reasons.
            </p>
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 rounded-2xl pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
