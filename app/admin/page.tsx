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
  FaExclamationCircle,
  FaEdit,
  FaUserEdit,
  FaEye,
  FaFilter,
  FaClipboard,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { validateAdminUpdate, validateNewDepartment } from "@/lib/validation";
import Link from "next/link";
import { Risk } from "@/types/Risk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

type TabType = "users" | "departments" | "risks";

const LoadingSpinner = ({ size = "large" }: { size?: "small" | "large" }) => (
  <div className="flex justify-center items-center py-6">
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${
        size === "large" ? "h-10 w-10 sm:h-12 sm:w-12" : "h-6 w-6 sm:h-8 sm:w-8"
      }`}
    ></div>
  </div>
);

const ErrorMessage = ({
  message,
  retryFn,
}: {
  message: string | null;
  retryFn: () => void;
}) => (
  <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
    <div className="flex flex-col items-center text-red-500 mb-4">
      <FaExclamationTriangle className="text-4xl mb-2" />
      <p>{message}</p>
    </div>
    <button
      onClick={retryFn}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
    >
      Try Again
    </button>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="p-8 text-center">
    <p className="text-gray-600">{message}</p>
  </div>
);

const AdminDashboardPage = () => {
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
  // Add new state for risks tab
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const [risksLoading, setRisksLoading] = useState(true);
  const [risksError, setRisksError] = useState<string | null>(null);
  const [riskSearchQuery, setRiskSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUserRisks, setEditingUserRisks] = useState<boolean>(false);
  const [userRisks, setUserRisks] = useState<Risk[]>([]);
  const [userRisksLoading, setUserRisksLoading] = useState(false);
  const [editingUserInfo, setEditingUserInfo] = useState<boolean>(false);
  const [editedUserInfo, setEditedUserInfo] = useState<{
    name: string;
    email: string;
  }>({ name: "", email: "" });
  const [updatingUserInfo, setUpdatingUserInfo] = useState<boolean>(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] =
    useState<boolean>(false);
  const [resetPasswordLoading, setResetPasswordLoading] =
    useState<boolean>(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] =
    useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordCopiedReset, setPasswordCopiedReset] =
    useState<boolean>(false);

  // Add state for Create User dialog
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "user",
    department: "",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Add state for Delete User dialog
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [riskHandlingOption, setRiskHandlingOption] =
    useState<string>("anonymize");
  const [reassignUserId, setReassignUserId] = useState<string>("");
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState("");

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

  // Add the fetch risks functionality
  const fetchRisks = async () => {
    try {
      setRisksLoading(true);
      setRisksError(null);
      const res = await fetch("/api/admin/risk/all");
      if (!res.ok) throw new Error("Failed to fetch risks");
      const data = await res.json();
      setRisks(data.risks);
      setFilteredRisks(data.risks);
      toast.success("Risks refreshed");
    } catch (err) {
      setRisksError(
        err instanceof Error ? err.message : "Failed to fetch risks"
      );
      toast.error(err instanceof Error ? err.message : "Failed to fetch risks");
    } finally {
      setRisksLoading(false);
    }
  };

  // Fetch user's risks
  const fetchUserRisks = async (userId: string) => {
    try {
      setUserRisksLoading(true);
      const res = await fetch(`/api/admin/risk/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user risks");
      const data = await res.json();
      setUserRisks(data.risks);
      return data.risks;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch user risks"
      );
      return [];
    } finally {
      setUserRisksLoading(false);
    }
  };

  // Update risk details
  const handleUpdateRisk = async (
    riskId: string,
    field: string,
    value: string
  ) => {
    try {
      const response = await fetch("/api/risk/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskId,
          [field]: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update risk");
      }

      // Update the risks state to reflect the change
      setRisks((prevRisks) =>
        prevRisks.map((r) => (r.$id === riskId ? { ...r, [field]: value } : r))
      );
      setFilteredRisks((prevRisks) =>
        prevRisks.map((r) => (r.$id === riskId ? { ...r, [field]: value } : r))
      );

      toast.success("Risk updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update risk");
    }
  };

  // View user profile and risks
  const handleViewUserProfile = async (usr: User) => {
    setSelectedUser(usr);
    setUserDialogOpen(true);
    const userRisks = await fetchUserRisks(usr.$id);
    setUserRisks(userRisks);
    setEditedUserInfo({ name: usr.name, email: usr.email });
  };

  // Apply risk filters based on selected criteria
  useEffect(() => {
    if (risks.length > 0) {
      let filtered = [...risks];

      // Apply search filter
      if (riskSearchQuery) {
        const query = riskSearchQuery.toLowerCase();
        filtered = filtered.filter(
          (risk) =>
            risk.title.toLowerCase().includes(query) ||
            risk.content.toLowerCase().includes(query) ||
            risk.authorName.toLowerCase().includes(query)
        );
      }

      // Apply department filter
      if (departmentFilter !== "all") {
        filtered = filtered.filter(
          (risk) => risk.department === departmentFilter
        );
      }

      // Apply impact filter
      if (impactFilter !== "all") {
        filtered = filtered.filter((risk) => risk.impact === impactFilter);
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((risk) => risk.status === statusFilter);
      }

      setFilteredRisks(filtered);
    }
  }, [risks, riskSearchQuery, departmentFilter, impactFilter, statusFilter]);

  // Fetch risks when tab changes to risks
  useEffect(() => {
    if (activeTab === "risks" && risks.length === 0) {
      fetchRisks();
    }
  }, [activeTab, risks.length]);

  // Create a new user
  const handleCreateUser = async () => {
    try {
      setIsCreatingUser(true);
      setCreateUserError("");

      const response = await fetch("/api/admin/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      // Add the new user to the users list
      setUsers((prev) => [...prev, data.user]);
      setFilteredUsers((prev) => [...prev, data.user]);

      // Store the temporary password
      setTempPassword(data.tempPassword);

      // Reset the form
      setNewUserData({
        name: "",
        email: "",
        role: "user",
        department: "",
      });

      toast.success("User created successfully");
    } catch (err) {
      setCreateUserError(
        err instanceof Error ? err.message : "Failed to create user"
      );
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Copy temporary password to clipboard
  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  // Prepare to delete a user
  const handlePrepareDeleteUser = (usr: User) => {
    setUserToDelete(usr);
    setDeleteUserDialogOpen(true);
    setRiskHandlingOption("anonymize");
    setReassignUserId("");
    setDeleteUserError("");
  };

  // Delete a user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeletingUser(true);
      setDeleteUserError("");

      const payload: Record<string, string> = {
        userId: userToDelete.$id,
        riskHandling: riskHandlingOption,
      };

      // Add reassignToUserId if option is "reassign"
      if (riskHandlingOption === "reassign" && reassignUserId) {
        payload.reassignToUserId = reassignUserId;
      }

      const response = await fetch("/api/admin/deleteUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      // Remove the user from the users list
      setUsers((prev) => prev.filter((u) => u.$id !== userToDelete.$id));
      setFilteredUsers((prev) =>
        prev.filter((u) => u.$id !== userToDelete.$id)
      );

      // Close the dialog
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);

      toast.success(
        `User deleted successfully. ${
          data.handledRisks
            ? `${data.handledRisks} risks were ${riskHandlingOption}d.`
            : ""
        }`
      );
    } catch (err) {
      setDeleteUserError(
        err instanceof Error ? err.message : "Failed to delete user"
      );
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleUpdateUserInfo = async () => {
    if (!selectedUser) return;

    try {
      setUpdatingUserInfo(true);
      const response = await fetch("/api/admin/updateUserInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.$id,
          name: editedUserInfo.name,
          email: editedUserInfo.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user info");
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.$id === selectedUser.$id
            ? { ...u, name: editedUserInfo.name, email: editedUserInfo.email }
            : u
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.$id === selectedUser.$id
            ? { ...u, name: editedUserInfo.name, email: editedUserInfo.email }
            : u
        )
      );
      setSelectedUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              name: editedUserInfo.name,
              email: editedUserInfo.email,
            }
          : null
      );
      setEditingUserInfo(false);
      toast.success("User info updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update user info"
      );
    } finally {
      setUpdatingUserInfo(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      setResetPasswordLoading(true);
      const response = await fetch("/api/admin/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.$id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setNewPassword(data.newPassword);
      setResetPasswordSuccess(true);
      toast.success("Password reset successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "users") {
      return renderUsersTab();
    } else if (activeTab === "departments") {
      return renderDepartmentsTab();
    } else {
      return renderRisksTab();
    }
  };

  const renderUsersTab = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} retryFn={fetchUsers} />;

    return (
      <div>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64 md:w-80">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              onClick={() => setCreateUserDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md flex-grow sm:flex-grow-0"
            >
              <FaPlus className="mr-2" /> Create User
            </Button>

            <Button
              onClick={fetchUsers}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md flex-grow sm:flex-grow-0"
            >
              {refreshing ? (
                <FaSync className="animate-spin mr-2" />
              ) : (
                <FaSync className="mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center text-gray-500 mb-4">
              <FaUsers className="text-4xl mb-2 text-gray-400" />
              <p className="text-lg">No users found matching your search</p>
            </div>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((usr) => (
              <div
                key={usr.$id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold mr-3 sm:mr-4 flex-shrink-0">
                      {usr.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 truncate">
                        {usr.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaEnvelope className="mr-1 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{usr.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-md p-2">
                      <div className="text-xs text-gray-500 mb-1">Role</div>
                      <div className="flex items-center">
                        <div className="relative flex-grow">
                          <select
                            className="w-full bg-white border border-gray-200 rounded py-1.5 pl-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            value={usr.prefs.role}
                            onChange={(e) =>
                              handleUpdate(usr.$id, "role", e.target.value)
                            }
                            disabled={updatingUser === usr.$id}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                            <FaUserCog className="text-gray-400 text-xs" />
                          </div>
                        </div>
                        {updatingUser === usr.$id && (
                          <div className="ml-1">
                            <div className="animate-spin h-3 w-3 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {usr.prefs.role !== "admin" && (
                      <div className="bg-gray-50 rounded-md p-2">
                        <div className="text-xs text-gray-500 mb-1">
                          Department
                        </div>
                        <div className="flex items-center">
                          <div className="relative flex-grow">
                            <select
                              className="w-full bg-white border border-gray-200 rounded py-1.5 pl-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
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
                            <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                              <FaBuilding className="text-gray-400 text-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {usr.prefs.role === "admin" && (
                      <div className="bg-purple-50 rounded-md p-2">
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className="flex items-center">
                          <span className="text-purple-700 font-medium text-sm flex items-center">
                            <FaUserCog className="text-purple-500 mr-1" />
                            Administrator
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 pt-3">
                    <div className="text-xs text-gray-500">
                      {usr.prefs.reputation ? (
                        <div className="flex items-center">
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                            {usr.prefs.reputation} Rep
                          </span>
                        </div>
                      ) : (
                        "New User"
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => handleViewUserProfile(usr)}
                      >
                        <FaUserEdit className="mr-1 text-xs" /> Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handlePrepareDeleteUser(usr)}
                      >
                        <FaTrash className="mr-1 text-xs" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDepartmentsTab = () => {
    if (departmentsLoading) return <LoadingSpinner />;
    if (departmentError)
      return (
        <ErrorMessage message={departmentError} retryFn={fetchDepartments} />
      );

    // Calculate which departments are in use
    const departmentsInUse = new Set(
      users.map((user) => user.prefs?.department).filter(Boolean)
    );

    return (
      <div>
        {/* Add Department UI */}
        {showAddDepartment ? (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 border border-blue-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Add New Department
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
              <input
                type="text"
                placeholder="Department name"
                className="flex-grow bg-white text-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 w-full sm:w-auto"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                disabled={addingDepartment}
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleAddDepartment}
                  disabled={addingDepartment || !newDepartment.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors disabled:opacity-50 flex-grow sm:flex-grow-0"
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
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-4 py-2 flex items-center justify-center transition-colors flex-grow sm:flex-grow-0"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Department names must be 2-50 characters and can contain letters,
              numbers, spaces, hyphens, and apostrophes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-medium text-gray-800">
              Department Management
            </h2>
            <button
              onClick={() => setShowAddDepartment(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <FaPlus className="mr-2" /> Add Department
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

  const renderRisksTab = () => {
    if (risksLoading) return <LoadingSpinner />;
    if (risksError)
      return <ErrorMessage message={risksError} retryFn={fetchRisks} />;

    return (
      <>
        {/* Filter controls */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-grow w-full">
              <input
                type="text"
                placeholder="Search risks..."
                value={riskSearchQuery}
                onChange={(e) => setRiskSearchQuery(e.target.value)}
                className="bg-white text-gray-800 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border border-gray-200"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-between sm:justify-start">
              <div className="w-full sm:w-40">
                <Select
                  value={departmentFilter}
                  onValueChange={(value) => setDepartmentFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <FaBuilding className="mr-2 text-gray-500" />
                      <SelectValue placeholder="Department" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={impactFilter}
                  onValueChange={(value) => setImpactFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <FaExclamationCircle className="mr-2 text-gray-500" />
                      <SelectValue placeholder="Impact" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Impacts</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <FaFilter className="mr-2 text-gray-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={fetchRisks}
                disabled={risksLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors w-full sm:w-auto"
              >
                <FaSync
                  className={`mr-2 ${risksLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Risks List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {filteredRisks.length === 0 ? (
            <EmptyState message="No risks found matching your criteria" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full sm:w-1/3">
                      Risk Details
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Author
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impact
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Department
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRisks.map((risk) => (
                    <tr
                      key={risk.$id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                            {risk.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 sm:line-clamp-2">
                            {risk.content}
                          </div>
                          <div className="flex items-center sm:hidden text-xs text-blue-600 mt-1">
                            <FaUserEdit className="mr-1 h-3 w-3" />
                            {risk.authorName}
                          </div>
                          {risk.tags && risk.tags.length > 0 && (
                            <div className="flex-wrap gap-1 mt-1 hidden sm:flex">
                              {risk.tags.slice(0, 2).map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {risk.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{risk.tags.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div
                          className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
                          onClick={() => {
                            const author = users.find(
                              (u) => u.$id === risk.authorId
                            );
                            if (author) {
                              handleViewUserProfile(author);
                            }
                          }}
                        >
                          <FaUserEdit className="mr-1" />
                          {risk.authorName}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <StatusSelect
                          value={risk.impact}
                          options={[
                            { value: "low", label: "Low" },
                            { value: "medium", label: "Medium" },
                            { value: "high", label: "High" },
                          ]}
                          onChange={(value) =>
                            handleUpdateRisk(risk.$id, "impact", value)
                          }
                          colorClasses={(value) =>
                            value === "high"
                              ? "bg-red-50 text-red-700"
                              : value === "medium"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-green-50 text-green-700"
                          }
                          icon={
                            <FaExclamationCircle className="text-xs sm:text-sm" />
                          }
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <StatusSelect
                          value={risk.status}
                          options={[
                            { value: "active", label: "Active" },
                            { value: "closed", label: "Closed" },
                          ]}
                          onChange={(value) =>
                            handleUpdateRisk(risk.$id, "status", value)
                          }
                          colorClasses={(value) =>
                            value === "active"
                              ? "bg-blue-50 text-blue-700"
                              : value === "closed"
                              ? "bg-gray-50 text-gray-700"
                              : "bg-green-50 text-green-700"
                          }
                          icon={<FaEdit className="text-xs sm:text-sm" />}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="relative">
                          <select
                            className="bg-white text-gray-800 rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer"
                            value={risk.department || ""}
                            onChange={(e) =>
                              handleUpdateRisk(
                                risk.$id,
                                "department",
                                e.target.value === "" ? "" : e.target.value
                              )
                            }
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
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          asChild
                        >
                          <Link href={`/risk/${risk.$id}`}>
                            <FaEye className="mr-1" /> View
                          </Link>
                        </Button>
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

  // Extract the status select component to avoid duplication
  const StatusSelect = ({
    value,
    options,
    onChange,
    colorClasses,
    icon,
  }: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    colorClasses: (value: string) => string;
    icon: React.ReactNode;
  }) => (
    <div className="relative">
      <select
        className={`rounded px-2 py-2 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer ${colorClasses(
          value
        )}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        {icon}
      </div>
    </div>
  );

  // Simplify user profile dialog component
  const renderUserProfile = () => {
    if (!selectedUser) return null;

    return (
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-medium text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span>{selectedUser.name}&apos;s Profile</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingUserInfo ? (
                    <>
                      <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={editedUserInfo.name}
                          onChange={(e) =>
                            setEditedUserInfo((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          value={editedUserInfo.email}
                          onChange={(e) =>
                            setEditedUserInfo((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setEditingUserInfo(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="w-full"
                          onClick={handleUpdateUserInfo}
                          disabled={updatingUserInfo}
                        >
                          {updatingUserInfo ? (
                            <FaSync className="animate-spin mr-2" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <ProfileField label="Name" value={selectedUser.name} />
                      <ProfileField label="Email" value={selectedUser.email} />
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setEditingUserInfo(true)}
                        >
                          Edit Info
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setResetPasswordDialogOpen(true)}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Role</h4>
                    <select
                      className="bg-white text-gray-800 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 mt-1"
                      value={selectedUser.prefs.role}
                      onChange={(e) => {
                        handleUpdate(selectedUser.$id, "role", e.target.value);
                        setSelectedUser({
                          ...selectedUser,
                          prefs: {
                            ...selectedUser.prefs,
                            role: e.target.value,
                          },
                        });
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Department
                    </h4>
                    <select
                      className="bg-white text-gray-800 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 mt-1"
                      value={selectedUser.prefs.department || ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? "" : e.target.value;
                        handleUpdate(selectedUser.$id, "department", value);
                        setSelectedUser({
                          ...selectedUser,
                          prefs: {
                            ...selectedUser.prefs,
                            department: value,
                          },
                        });
                      }}
                    >
                      <option value="">None</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ProfileField
                    label="Reputation"
                    value={String(selectedUser.prefs.reputation || 0)}
                  />
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditingUserRisks(!editingUserRisks);
                      }}
                    >
                      {editingUserRisks ? "Done Editing" : "Edit Risks"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Risks</CardTitle>
                  <CardDescription>
                    {userRisks.length} risks created by this user
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  {userRisksLoading ? (
                    <LoadingSpinner size="small" />
                  ) : userRisks.length === 0 ? (
                    <EmptyState message="No risks found for this user" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Impact
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {userRisks.map((risk) => (
                            <tr key={risk.$id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-800">
                                  {risk.title}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {editingUserRisks ? (
                                  <select
                                    className={`rounded px-4 py-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 border appearance-none cursor-pointer 
                                      ${
                                        risk.impact === "high"
                                          ? "bg-red-50 text-red-700"
                                          : risk.impact === "medium"
                                          ? "bg-yellow-50 text-yellow-700"
                                          : "bg-green-50 text-green-700"
                                      }`}
                                    value={risk.impact}
                                    onChange={(e) => {
                                      handleUpdateRisk(
                                        risk.$id,
                                        "impact",
                                        e.target.value
                                      );
                                      setUserRisks(
                                        userRisks.map((r) =>
                                          r.$id === risk.$id
                                            ? {
                                                ...r,
                                                impact: e.target.value as
                                                  | "low"
                                                  | "medium"
                                                  | "high",
                                              }
                                            : r
                                        )
                                      );
                                    }}
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                  </select>
                                ) : (
                                  <RiskStatusBadge
                                    status={risk.impact}
                                    type="impact"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {editingUserRisks ? (
                                  <select
                                    className={`rounded px-4 py-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 border appearance-none cursor-pointer
                                      ${
                                        risk.status === "active"
                                          ? "bg-blue-50 text-blue-700"
                                          : risk.status === "closed"
                                          ? "bg-gray-50 text-gray-700"
                                          : "bg-green-50 text-green-700"
                                      }`}
                                    value={risk.status}
                                    onChange={(e) => {
                                      handleUpdateRisk(
                                        risk.$id,
                                        "status",
                                        e.target.value
                                      );
                                      setUserRisks(
                                        userRisks.map((r) =>
                                          r.$id === risk.$id
                                            ? {
                                                ...r,
                                                status: e.target.value as
                                                  | "active"
                                                  | "closed",
                                              }
                                            : r
                                        )
                                      );
                                    }}
                                  >
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                  </select>
                                ) : (
                                  <RiskStatusBadge
                                    status={risk.status}
                                    type="status"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  asChild
                                >
                                  <Link href={`/risk/${risk.$id}`}>
                                    <FaEye className="mr-1" /> View
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Helper component for profile fields
  const ProfileField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <h4 className="text-sm font-medium text-gray-500">{label}</h4>
      <p className="text-gray-800">{value}</p>
    </div>
  );

  // Helper component for displaying risk status badges
  const RiskStatusBadge = ({
    status,
    type,
  }: {
    status: string;
    type: "impact" | "status";
  }) => {
    let bgColor = "";
    let textColor = "";

    if (type === "impact") {
      if (status === "high") {
        bgColor = "bg-red-100";
        textColor = "text-red-800";
      } else if (status === "medium") {
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
      } else {
        bgColor = "bg-green-100";
        textColor = "text-green-800";
      }
    } else {
      if (status === "active") {
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
      } else if (status === "closed") {
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
      } else {
        bgColor = "bg-green-100";
        textColor = "text-green-800";
      }
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        {status}
      </span>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 pt-16 pb-12 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin header with title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-700">
            Admin Dashboard
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav
              className="-mb-px flex space-x-2 sm:space-x-6 min-w-max"
              aria-label="Tabs"
            >
              <button
                onClick={() => setActiveTab("users")}
                className={`
                  py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
                  ${
                    activeTab === "users"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-center">
                  <FaUsers className="mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">User </span>Management
                </div>
              </button>
              <button
                onClick={() => setActiveTab("departments")}
                className={`
                  py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
                  ${
                    activeTab === "departments"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-center">
                  <FaSitemap className="mr-1 sm:mr-2" />
                  Departments
                </div>
              </button>
              <button
                onClick={() => setActiveTab("risks")}
                className={`
                  py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
                  ${
                    activeTab === "risks"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-center">
                  <FaExclamationCircle className="mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">User </span>Risks
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
        {renderUserProfile()}
      </div>

      {/* Create User Dialog */}
      <Dialog
        open={createUserDialogOpen}
        onOpenChange={(open) => {
          setCreateUserDialogOpen(open);
          if (!open) {
            setNewUserData({
              name: "",
              email: "",
              role: "user",
              department: "",
            });
            setTempPassword("");
            setPasswordCopied(false);
            setCreateUserError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new user in the system.
            </DialogDescription>
          </DialogHeader>

          {tempPassword ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium mb-2">
                  User Created Successfully!
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  A temporary password has been generated for this user. Make
                  sure to save it or share it with the user.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    value={tempPassword}
                    readOnly
                    className="w-full bg-white border border-green-300 rounded px-3 py-2 text-gray-700"
                  />
                  <button
                    onClick={copyPasswordToClipboard}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800"
                    title="Copy to clipboard"
                  >
                    {passwordCopied ? <FaCheck /> : <FaClipboard />}
                  </button>
                </div>

                {passwordCopied && (
                  <p className="text-xs text-green-600 mt-1">
                    Copied to clipboard!
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCreateUserDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                {createUserError && (
                  <Alert className="bg-red-50 text-red-800 border-red-200">
                    <AlertDescription>{createUserError}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUserData.name}
                    onChange={(e) =>
                      setNewUserData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUserData.role}
                    onValueChange={(value) =>
                      setNewUserData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newUserData.department}
                    onValueChange={(value) =>
                      setNewUserData((prev) => ({ ...prev, department: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={
                    isCreatingUser || !newUserData.name || !newUserData.email
                  }
                >
                  {isCreatingUser ? (
                    <>
                      <FaSync className="animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteUserDialogOpen}
        onOpenChange={(open) => {
          setDeleteUserDialogOpen(open);
          if (!open) {
            setUserToDelete(null);
            setRiskHandlingOption("anonymize");
            setReassignUserId("");
            setDeleteUserError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user will be permanently deleted
              from the system.
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="space-y-4">
              {deleteUserError && (
                <Alert className="bg-red-50 text-red-800 border-red-200">
                  <AlertDescription>{deleteUserError}</AlertDescription>
                </Alert>
              )}

              <Card className="p-4">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {userToDelete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-medium text-gray-900">
                      {userToDelete.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {userToDelete.email}
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="risk-handling">
                    <AccordionTrigger className="text-sm font-medium">
                      Risk Handling Options
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 mt-2">
                        <p className="text-sm text-gray-600">
                          Choose how to handle risks created by this user:
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="anonymize"
                              name="riskHandling"
                              value="anonymize"
                              checked={riskHandlingOption === "anonymize"}
                              onChange={() =>
                                setRiskHandlingOption("anonymize")
                              }
                              className="mr-2"
                            />
                            <label htmlFor="anonymize" className="text-sm">
                              Keep risks and mark as anonymous (recommended)
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="reassign"
                              name="riskHandling"
                              value="reassign"
                              checked={riskHandlingOption === "reassign"}
                              onChange={() => setRiskHandlingOption("reassign")}
                              className="mr-2"
                            />
                            <label htmlFor="reassign" className="text-sm">
                              Reassign risks to another user
                            </label>
                          </div>

                          {riskHandlingOption === "reassign" && (
                            <div className="ml-6 mt-2">
                              <Select
                                value={reassignUserId}
                                onValueChange={setReassignUserId}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                  {users
                                    .filter((u) => u.$id !== userToDelete.$id)
                                    .map((usr) => (
                                      <SelectItem key={usr.$id} value={usr.$id}>
                                        {usr.name} ({usr.email})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="delete"
                              name="riskHandling"
                              value="delete"
                              checked={riskHandlingOption === "delete"}
                              onChange={() => setRiskHandlingOption("delete")}
                              className="mr-2"
                            />
                            <label htmlFor="delete" className="text-sm">
                              Delete all risks created by this user
                            </label>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={
                    isDeletingUser ||
                    (riskHandlingOption === "reassign" && !reassignUserId)
                  }
                >
                  {isDeletingUser ? (
                    <>
                      <FaSync className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialogOpen}
        onOpenChange={(open) => {
          setResetPasswordDialogOpen(open);
          if (!open) {
            setResetPasswordSuccess(false);
            setNewPassword("");
            setPasswordCopiedReset(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Generate a new temporary password for this user.
            </DialogDescription>
          </DialogHeader>

          {resetPasswordSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium mb-2">
                  Password Reset Successfully!
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  A new temporary password has been generated. Make sure to save
                  it or share it with the user.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    value={newPassword}
                    readOnly
                    className="w-full bg-white border border-green-300 rounded px-3 py-2 text-gray-700"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newPassword);
                      setPasswordCopiedReset(true);
                      setTimeout(() => setPasswordCopiedReset(false), 2000);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800"
                    title="Copy to clipboard"
                  >
                    {passwordCopiedReset ? <FaCheck /> : <FaClipboard />}
                  </button>
                </div>

                {passwordCopiedReset && (
                  <p className="text-xs text-green-600 mt-1">
                    Copied to clipboard!
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setResetPasswordDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm text-gray-600">
                Are you sure you want to reset the password for{" "}
                <span className="font-medium text-gray-800">
                  {selectedUser?.name}
                </span>
                ? This will generate a new temporary password.
              </p>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setResetPasswordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordLoading}
                >
                  {resetPasswordLoading ? (
                    <>
                      <FaSync className="animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
