"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useAuthStore } from "@/store/Auth";
import { validateEmail, validateName, validateAuth } from "@/lib/validation";

export default function Register() {
  const { createAccount, login, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
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
    const firstName = formData.get("firstname")?.toString().trim() || "";
    const lastName = formData.get("lastname")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    // First validate names
    const nameValidation = validateName(`${firstName} ${lastName}`);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error || "Invalid name format");
      return;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || "Invalid email format");
      return;
    }

    // Complete auth validation
    const authValidation = validateAuth({
      name: `${firstName} ${lastName}`,
      email,
      password,
    });

    if (!authValidation.isValid) {
      toast.error(authValidation.error || "Invalid authentication data");
      return;
    }

    setIsLoading(true);

    const response = await createAccount(
      `${firstName} ${lastName}`,
      email,
      password
    );

    if (response.error) {
      toast.error(response.error.message);
      setIsLoading(false);
    } else {
      const loginResponse = await login(email, password);
      if (!loginResponse.success) {
        toast.error(loginResponse.error?.message || "Login failed");
        setIsLoading(false);
      } else {
        toast.success("Account created successfully!");
        const currentUser = useAuthStore.getState().user;
        router.push(`/dashboard/${currentUser?.$id}`);
      }
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 pt-16">
        <div className="w-full max-w-md py-8">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 transition-transform hover:scale-[1.02]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
              Create your account
            </h2>
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <label htmlFor="firstname" className="sr-only">
                  Firstname
                </label>
                <div className="flex items-center border-b border-gray-300 pb-2">
                  <FaUser className="text-gray-500 mr-3" />
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="Firstname"
                    defaultValue={isLoading ? "John" : ""}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none transition-colors text-sm sm:text-base py-1"
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="lastname" className="sr-only">
                  Lastname
                </label>
                <div className="flex items-center border-b border-gray-300 pb-2">
                  <FaUser className="text-gray-500 mr-3" />
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="Lastname"
                    defaultValue={isLoading ? "Doe" : ""}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none transition-colors text-sm sm:text-base py-1"
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <div className="flex items-center border-b border-gray-300 pb-2">
                  <FaEnvelope className="text-gray-500 mr-3" />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    placeholder="Email address"
                    defaultValue={isLoading ? "user@example.com" : ""}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none transition-colors text-sm sm:text-base py-1"
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="flex items-center border-b border-gray-300 pb-2">
                  <FaLock className="text-gray-500 mr-3" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    placeholder="Password"
                    defaultValue={isLoading ? "••••••••" : ""}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none transition-colors text-sm sm:text-base py-1"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 sm:py-3 md:py-4 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white font-semibold hover:opacity-90 transition-all text-sm sm:text-base md:text-lg disabled:opacity-50 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500"
                >
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-t-4 border-gray-200 rounded-full"
                      style={{ borderTopColor: "#ffffff" }}
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 1,
                      }}
                    />
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>
            <div className="text-center mt-4 sm:mt-6">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 transition text-sm sm:text-base"
              >
                Already have an account? Sign in
              </Link>
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 rounded-2xl pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
