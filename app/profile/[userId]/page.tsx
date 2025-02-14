"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaStar, FaBuilding, FaUserTag } from "react-icons/fa";

const Profile = () => {
  const router = useRouter();
  const { user, loading, error, updateUserProfile, verifySession } = useAuthStore();
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

    const result = await updateUserProfile({
      reputation,
      role,
      department
    });
    
    if (!result.success) {
      setUpdateError(result.error?.message || "Failed to update profile");
    } else {
      alert("Profile updated successfully!");
    }
  };

  if (loading)
    return <p className="text-white text-center">Loading your profile...</p>;
  if (error)
    return (
      <p className="text-red-500 text-center">
        Error loading profile: {error.message}
      </p>
    );

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center pt-16">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
        {updateError && (
          <p className="text-red-500 text-center">{updateError}</p>
        )}
        <form className="space-y-6" onSubmit={handleUpdate}>
          <div>
            <label
              className="flex items-center text-gray-300 mb-2"
              htmlFor="name"
            >
              <FaUser className="mr-2" /> Name
            </label>
            <input
              className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-300 mb-2"
              htmlFor="email"
            >
              <FaEnvelope className="mr-2" /> Email
            </label>
            <input
              className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-300 mb-2"
              htmlFor="reputation"
            >
              <FaStar className="mr-2" /> Reputation
            </label>
            <input
              className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-400 cursor-not-allowed"
              type="number"
              id="reputation"
              value={reputation}
              readOnly
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-300 mb-2"
              htmlFor="role"
            >
              <FaUserTag className="mr-2" /> Role
            </label>
            <input
              className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-400 cursor-not-allowed"
              type="text"
              id="role"
              value={role}
              readOnly
            />
          </div>
          <div>
            <label
              className="flex items-center text-gray-300 mb-2"
              htmlFor="department"
            >
              <FaBuilding className="mr-2" /> Department
            </label>
            <input
              className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-400 cursor-not-allowed"
              type="text"
              id="department"
              value={department}
              readOnly
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
