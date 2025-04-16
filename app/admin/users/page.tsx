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
  FaPlus,
  FaTrash,
  FaTimes,
  FaCheck,
  FaUsers,
  FaSitemap,
  FaExclamationTriangle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { validateAdminUpdate, validateNewDepartment } from "@/lib/validation";

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

type TabType = "users" | "departments";

const AdminUsersPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [addingDepartment, setAddingDepartment] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<string | null>(
    null
  );

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

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const res = await fetch("/api/admin/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data.departments);
    } catch (err) {
      setDepartmentError(
        err instanceof Error ? err.message : "Failed to fetch departments"
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch departments"
      );
    } finally {
      setDepartmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
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
        [field]: value,
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

  const handleAddDepartment = async () => {
    try {
      // Validate department name
      const validation = validateNewDepartment(newDepartment);
      if (!validation.isValid) {
        toast.error(validation.error || "Invalid department name");
        return;
      }

      setAddingDepartment(true);
      const response = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: newDepartment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add department");
      }

      const data = await response.json();
      setDepartments(data.departments);
      setNewDepartment("");
      setShowAddDepartment(false);
      toast.success(`Department "${newDepartment}" added successfully`);
    } catch (err) {
      setDepartmentError(
        err instanceof Error ? err.message : "Failed to add department"
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to add department"
      );
    } finally {
      setAddingDepartment(false);
    }
  };

  const handleDeleteDepartment = async (department: string) => {
    try {
      setDeletingDepartment(department);

      // Check if department is in use
      const usersInDepartment = users.filter(
        (u) => u.prefs?.department === department
      );
      if (usersInDepartment.length > 0) {
        toast.error(
          `Cannot delete department "${department}" as it's being used by ${usersInDepartment.length} user(s)`
        );
        return;
      }

      const response = await fetch(
        `/api/admin/departments?department=${encodeURIComponent(department)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete department");
      }

      const data = await response.json();
      setDepartments(data.departments);
      toast.success(`Department "${department}" deleted successfully`);
    } catch (err) {
      setDepartmentError(
        err instanceof Error ? err.message : "Failed to delete department"
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to delete department"
      );
    } finally {
      setDeletingDepartment(null);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "users") {
      return renderUsersTab();
    } else {
      return renderDepartmentsTab();
    }
  };

  const renderUsersTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
          <div className="flex flex-col items-center text-red-500 mb-4">
            <FaExclamationTriangle className="text-4xl mb-2" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                No users found matching your search
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm sm:text-lg">
                              {usr.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-800">
                              {usr.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 flex items-center">
                              <FaEnvelope className="mr-1 text-xs hidden sm:inline" />
                              <span className="truncate max-w-[120px] sm:max-w-none">
                                {usr.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            className="bg-white text-gray-800 rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer"
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
                            <FaUserCog className="text-xs sm:text-sm" />
                          </div>
                          {updatingUser === usr.$id && (
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            className="bg-white text-gray-800 rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer"
                            value={usr.prefs.department || ""}
                            onChange={(e) =>
                              handleUpdate(
                                usr.$id,
                                "department",
                                e.target.value === "" ? "" : e.target.value
                              )
                            }
                            disabled={updatingUser === usr.$id}
                          >
                            <option value="">None</option>
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <FaBuilding className="text-xs sm:text-sm" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderDepartmentsTab = () => {
    if (departmentsLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (departmentError) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
          <div className="flex flex-col items-center text-red-500 mb-4">
            <FaExclamationTriangle className="text-4xl mb-2" />
            <p>{departmentError}</p>
          </div>
          <button
            onClick={fetchDepartments}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Calculate which departments are in use
    const departmentsInUse = new Set(
      users.map((user) => user.prefs?.department).filter(Boolean)
    );

    return (
      <div>
        {/* Add Department UI */}
        {showAddDepartment ? (
          <div className="bg-white rounded-lg shadow p-4 mb-6 border border-blue-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Add New Department
            </h2>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="text"
                placeholder="Department name"
                className="flex-grow bg-white text-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                disabled={addingDepartment}
              />
              <button
                onClick={handleAddDepartment}
                disabled={addingDepartment || !newDepartment.trim()}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {addingDepartment ? (
                  <FaSync className="animate-spin mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddDepartment(false);
                  setNewDepartment("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-4 py-2 flex items-center justify-center transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Department names must be 2-50 characters and can contain letters,
              numbers, spaces, hyphens, and apostrophes.
            </p>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-800">
              Department Management
            </h2>
            <button
              onClick={() => setShowAddDepartment(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Department
            </button>
          </div>
        )}

        {/* Departments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => {
                  const isDefault = DEFAULT_DEPARTMENTS.includes(
                    dept as string
                  );
                  const usersCount = users.filter(
                    (u) => u.prefs?.department === dept
                  ).length;
                  const isInUse = departmentsInUse.has(dept);

                  return (
                    <tr
                      key={dept}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          {dept}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full
                          ${
                            isDefault
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isDefault ? "Default" : "Custom"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {usersCount} {usersCount === 1 ? "user" : "users"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isDefault ? (
                          <span className="text-gray-400 cursor-not-allowed px-3 py-1">
                            Cannot Delete
                          </span>
                        ) : isInUse ? (
                          <span className="text-gray-400 cursor-not-allowed px-3 py-1">
                            In Use
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteDepartment(dept)}
                            disabled={deletingDepartment === dept}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded transition-colors"
                          >
                            {deletingDepartment === dept ? (
                              <FaSync className="animate-spin inline mr-1" />
                            ) : (
                              <FaTrash className="inline mr-1" />
                            )}
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Since we're using constants from within the component to check if a department is default,
  // define DEFAULT_DEPARTMENTS here as well
  const DEFAULT_DEPARTMENTS = [
    "general",
    "engineering",
    "sales",
    "marketing",
    "hr",
    "it",
    "finance",
    "operations",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin header with title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-700">
            Admin Dashboard
          </h1>

          {activeTab === "users" && (
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white text-gray-800 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 border border-gray-200 shadow-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={fetchUsers}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 flex items-center justify-center transition-colors disabled:opacity-50 w-full sm:w-auto shadow-sm"
              >
                <FaSync
                  className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("users")}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === "users"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-center">
                  <FaUsers className="mr-2" />
                  User Management
                </div>
              </button>
              <button
                onClick={() => setActiveTab("departments")}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === "departments"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-center">
                  <FaSitemap className="mr-2" />
                  Departments
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminUsersPage;
