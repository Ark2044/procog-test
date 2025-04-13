"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaEnvelope,
  FaStar,
  FaBuilding,
  FaUserTag,
  FaExclamationCircle,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { validateProfile } from "@/lib/validation";
import Link from "next/link";

const Profile = () => {
  const router = useRouter();
  const { user, loading, error, updateUserProfile, verifySession } =
    useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [reputation] = useState(user?.prefs?.reputation || 0);
  const [role] = useState(user?.prefs?.role || "user");
  const [department] = useState(user?.prefs?.department || "general");
  const [updateError, setUpdateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    // Set initial form values when user data is available
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user, loading, router]);

  // Track form changes
  useEffect(() => {
    if (user) {
      setFormChanged(name !== user.name || email !== user.email);
    }
  }, [name, email, user]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);
    setIsSubmitting(true);

    try {
      const validation = validateProfile({
        name,
        email,
        department,
        role,
      });

      if (!validation.isValid) {
        setUpdateError(validation.error || "Invalid form data");
        toast.error(validation.error || "Invalid form data");
        return;
      }

      // Update only the user preferences that match UserPrefs type
      const result = await updateUserProfile({
        reputation,
        role,
        department,
      });

      if (!result.success) {
        setUpdateError(result.error?.message || "Failed to update profile");
        toast.error(result.error?.message || "Failed to update profile");
      } else {
        setUpdateSuccess(true);
        setFormChanged(false);
        toast.success("Profile updated successfully!");
      }
    } catch {
      setUpdateError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">
            Loading your profile...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This will just take a moment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
          <div className="flex justify-center mb-4 text-red-500">
            <FaExclamationCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-500 mb-4">{error.message}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => verifySession()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline font-medium"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pt-16 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold mr-4">
                {name ? name.charAt(0).toUpperCase() : ""}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{name || "Your Profile"}</h1>
                <p className="text-blue-100">{email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            {updateError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <div className="flex items-center">
                  <FaExclamationCircle className="text-red-500 mr-3" />
                  <p className="text-red-700">{updateError}</p>
                </div>
              </div>
            )}

            {updateSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <p className="text-green-700">
                    Profile updated successfully!
                  </p>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name field */}
                <div className="space-y-2">
                  <label
                    className="flex items-center text-gray-700 font-medium"
                    htmlFor="name"
                  >
                    <FaUser className="mr-2 text-blue-500" />
                    Name
                  </label>
                  <input
                    className="block w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <label
                    className="flex items-center text-gray-700 font-medium"
                    htmlFor="email"
                  >
                    <FaEnvelope className="mr-2 text-blue-500" />
                    Email
                  </label>
                  <input
                    className="block w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Organization Information - Read Only */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Organization Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Reputation field */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center text-gray-700 font-medium"
                      htmlFor="reputation"
                    >
                      <FaStar className="mr-2 text-yellow-500" />
                      Reputation
                    </label>
                    <div className="relative">
                      <input
                        className="block w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-700 cursor-not-allowed"
                        type="text"
                        id="reputation"
                        value={reputation}
                        readOnly
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        Read only
                      </span>
                    </div>
                  </div>

                  {/* Role field */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center text-gray-700 font-medium"
                      htmlFor="role"
                    >
                      <FaUserTag className="mr-2 text-purple-500" />
                      Role
                    </label>
                    <div className="relative">
                      <input
                        className="block w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-700 cursor-not-allowed"
                        type="text"
                        id="role"
                        value={role}
                        readOnly
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        Read only
                      </span>
                    </div>
                  </div>

                  {/* Department field */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center text-gray-700 font-medium"
                      htmlFor="department"
                    >
                      <FaBuilding className="mr-2 text-indigo-500" />
                      Department
                    </label>
                    <div className="relative">
                      <input
                        className="block w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-700 cursor-not-allowed"
                        type="text"
                        id="department"
                        value={department}
                        readOnly
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        Read only
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Contact your administrator to change role or department
                  information.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !formChanged}
                  className={`py-3 px-8 rounded-lg font-medium flex items-center justify-center transition-colors ${
                    formChanged
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
