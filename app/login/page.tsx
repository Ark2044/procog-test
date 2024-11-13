"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation"; // Updated import

export default function Login() {
  const { login, user } = useAuthStore(); // Access user from the store
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (user) {
      router.push(`/dashboard/${user.$id}`);
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

    const loginResponse = await login(email.toString(), password.toString());

    if (!loginResponse.success) {
      setError(loginResponse.error?.message || "Login failed");
    } else {
      const user = useAuthStore.getState().user; // Access user from the store
      console.log("User after login:", user);
      router.push(`/dashboard/${user?.$id}`); // Correctly using user ID
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/30 py-16 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your account
        </p>
        {error && (
          <p className="mt-8 text-center text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md block w-full px-4 py-2 border border-transparent placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                placeholder="Email address"
              />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaLock className="text-gray-400 mr-2" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md block w-full px-4 py-2 border border-transparent placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                placeholder="Password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
              disabled={isLoading}
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
