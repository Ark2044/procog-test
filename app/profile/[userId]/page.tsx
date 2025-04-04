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
} from "react-icons/fa";
import toast from "react-hot-toast";
import { validateProfile } from "@/lib/validation";

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

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateError("");

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

    const result = await updateUserProfile({
      reputation,
      role,
      department,
    });

    if (!result.success) {
      setUpdateError(result.error?.message || "Failed to update profile");
      toast.error(result.error?.message || "Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-md">
          <p className="text-gray-800">Loading your profile...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-md">
          <p className="text-red-500">Error loading profile: {error.message}</p>
          <button
            onClick={() => verifySession()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex justify-center items-start sm:items-center py-8 px-4">
      <div className="w-full max-w-md bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Your Profile
        </h1>
        {updateError && (
          <p className="text-red-500 text-center mb-4">{updateError}</p>
        )}
        <form className="space-y-4 sm:space-y-6" onSubmit={handleUpdate}>
          <div>
            <label
              className="flex items-center text-gray-700 mb-2 text-sm sm:text-base"
              htmlFor="name"
            >
              <FaUser className="mr-2" /> Name
            </label>
            <input
              className="block w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-700 mb-2 text-sm sm:text-base"
              htmlFor="email"
            >
              <FaEnvelope className="mr-2" /> Email
            </label>
            <input
              className="block w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-700 mb-2 text-sm sm:text-base"
              htmlFor="reputation"
            >
              <FaStar className="mr-2" /> Reputation
            </label>
            <input
              className="block w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-500 cursor-not-allowed text-sm sm:text-base"
              type="number"
              id="reputation"
              value={reputation}
              readOnly
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-700 mb-2 text-sm sm:text-base"
              htmlFor="role"
            >
              <FaUserTag className="mr-2" /> Role
            </label>
            <input
              className="block w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-500 cursor-not-allowed text-sm sm:text-base"
              type="text"
              id="role"
              value={role}
              readOnly
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-700 mb-2 text-sm sm:text-base"
              htmlFor="department"
            >
              <FaBuilding className="mr-2" /> Department
            </label>
            <input
              className="block w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-500 cursor-not-allowed text-sm sm:text-base"
              type="text"
              id="department"
              value={department}
              readOnly
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm sm:text-base"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
