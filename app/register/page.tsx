"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";

export default function Register() {
  const { createAccount, login, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
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
    const firstName = formData.get("firstname");
    const lastName = formData.get("lastname");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill out all the fields");
      return;
    }

    setIsLoading(true);
    setError("");

    const response = await createAccount(
      `${firstName} ${lastName}`,
      email.toString(),
      password.toString()
    );

    if (response.error) {
      setError(response.error.message);
    } else {
      const loginResponse = await login(email.toString(), password.toString());
      if (!loginResponse.success) {
        setError(loginResponse.error?.message || "Login failed");
      } else {
        const user = useAuthStore.getState().user;
        router.push(`/dashboard/${user?.$id}`);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 pt-16 sm:mt-0">
      <div className="w-full max-w-md px-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8 sm:p-10 md:p-12 lg:p-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Create your account
          </h2>
          {error && (
            <p className="mt-8 text-center text-sm text-red-500">{error}</p>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label htmlFor="firstname" className="sr-only">
                Firstname
              </label>
              <div className="flex items-center border-b border-gray-700 pb-2">
                <FaUser className="text-gray-500 mr-3" />
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Firstname"
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="lastname" className="sr-only">
                Lastname
              </label>
              <div className="flex items-center border-b border-gray-700 pb-2">
                <FaUser className="text-gray-500 mr-3" />
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  required
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Lastname"
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="flex items-center border-b border-gray-700 pb-2">
                <FaEnvelope className="text-gray-500 mr-3" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="flex items-center border-b border-gray-700 pb-2">
                <FaLock className="text-gray-500 mr-3" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Password"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white font-semibold hover:opacity-90 transition-all sm:text-lg md:text-xl lg:py-4 disabled:opacity-50"
                disabled={isLoading}
              >
                Create account
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
