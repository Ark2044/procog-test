"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import {
  FaUserCog,
  FaBuilding,
  FaEnvelope,
  FaSearch,
  FaSync,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { validateAdminUpdate } from "@/lib/validation";

interface User {
  $id: string;
  name: string;
  email: string;
  prefs: {
    role: string;
    department: string;
    reputation: number;
  };
}

const AdminUsersPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.prefs?.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/listUsers");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
      toast.success("Users refreshed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      toast.error(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter((usr) => {
        return (
          (usr.name && usr.name.toLowerCase().includes(lowercasedQuery)) ||
          (usr.email && usr.email.toLowerCase().includes(lowercasedQuery)) ||
          (usr.prefs?.department &&
            usr.prefs.department.toLowerCase().includes(lowercasedQuery)) ||
          (usr.prefs?.role &&
            usr.prefs.role.toLowerCase().includes(lowercasedQuery))
        );
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleUpdate = async (
    userId: string,
    field: "role" | "department",
    value: string
  ) => {
    try {
      const validation = validateAdminUpdate({
        userId,
        [field]: value
      });

      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setUpdatingUser(userId);
      const response = await fetch("/api/admin/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          [field]: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.$id === userId ? { ...u, prefs: { ...u.prefs, [field]: value } } : u
        )
      );
      toast.success("User updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex justify-center items-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col justify-center items-center pt-16">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            User Management
          </h1>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-gray-800 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 border border-gray-200"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={fetchUsers}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center transition-colors disabled:opacity-50"
            >
              <FaSync className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <p className="text-gray-600">No users found matching your search</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((usr) => (
                    <tr
                      key={usr.$id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-lg">
                              {usr.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-800">
                              {usr.name}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <FaEnvelope className="mr-1 text-xs" />
                              {usr.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            className="bg-white text-gray-800 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer"
                            value={usr.prefs.role}
                            onChange={(e) =>
                              handleUpdate(usr.$id, "role", e.target.value)
                            }
                            disabled={updatingUser === usr.$id}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <FaUserCog />
                          </div>
                          {updatingUser === usr.$id && (
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            className="bg-white text-gray-800 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer"
                            value={usr.prefs.department}
                            onChange={(e) =>
                              handleUpdate(
                                usr.$id,
                                "department",
                                e.target.value
                              )
                            }
                            disabled={updatingUser === usr.$id}
                          >
                            <option value="general">General</option>
                            <option value="engineering">Engineering</option>
                            <option value="sales">Sales</option>
                            <option value="marketing">Marketing</option>
                            <option value="hr">HR</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <FaBuilding />
                          </div>
                          {updatingUser === usr.$id && (
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
