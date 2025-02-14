"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useAuthStore } from "@/store/Auth";

export default function Login() {
  const { login, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Redirect based on user role
    if (user) {
      if (user.prefs?.role === "admin") {
        router.push("/admin/users");
      } else {
        router.push(`/dashboard/${user.$id}`);
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const loginResponse = await login(email.toString(), password.toString());

      if (!loginResponse.success) {
        setError(loginResponse.error?.message || "Login failed");
      } else {
        const currentUser = useAuthStore.getState().user;
        // Redirect based on role after successful login
        if (currentUser?.prefs?.role === "admin") {
          router.push("/admin/users");
        } else {
          router.push(`/dashboard/${currentUser?.$id}`);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 8px solid rgba(255, 255, 255, 0.1);
            border-left-color: #ffffff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 pt-16 sm:mt-0">
      <div className="w-full max-w-md px-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <h2 className="text-4xl font-bold text-center mb-4">Welcome Back</h2>
          <p className="text-center text-gray-400 mb-8">
            Sign in to your account
          </p>

          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="flex items-center border-b border-gray-700 pb-2">
                <FaEnvelope className="text-gray-500 mr-3" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email address"
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center border-b border-gray-700 pb-2">
                <FaLock className="text-gray-500 mr-3" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Password"
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white font-semibold hover:opacity-90 transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
