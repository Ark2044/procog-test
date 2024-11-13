"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/Auth"; // Adjust this path if necessary
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaStar } from "react-icons/fa"; // Import Font Awesome icons

const Profile = () => {
  const router = useRouter();
  const { user, loading, error, updateUserProfile, verifySession } =
    useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [reputation] = useState(user?.prefs?.reputation || 0); // Make reputation read-only
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

    const result = await updateUserProfile({ reputation });
    if (!result.success) {
      setUpdateError(result.error?.message || "Failed to update profile");
    } else {
      // Handle a successful update (e.g., show a success message)
      alert("Profile updated successfully!");
    }
  };

  if (loading) return <p>Loading your profile...</p>;
  if (error) return <p>Error loading profile: {error.message}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      {updateError && <p className="text-red-500">{updateError}</p>}
      <form
        className="bg-white shadow-md rounded-lg p-6"
        onSubmit={handleUpdate}
      >
        <div className="mb-4">
          <label
            className="flex items-center text-gray-700" // Using flex for labels
            htmlFor="name"
          >
            <FaUser className="mr-2" /> Name
          </label>
          <input
            className="mt-1 block w-full border rounded-md p-2"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="flex items-center text-gray-700" // Using flex for labels
            htmlFor="email"
          >
            <FaEnvelope className="mr-2" /> Email
          </label>
          <input
            className="mt-1 block w-full border rounded-md p-2"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="flex items-center text-gray-700" // Using flex for labels
            htmlFor="reputation"
          >
            <FaStar className="mr-2" /> Reputation
          </label>
          <input
            className="mt-1 block w-full border rounded-md p-2 bg-gray-100 cursor-not-allowed"
            type="number"
            id="reputation"
            value={reputation}
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
  );
};

export default Profile;
