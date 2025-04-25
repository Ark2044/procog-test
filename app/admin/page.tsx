"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaExclamationCircle, FaSitemap, FaUsers } from "react-icons/fa";
import { useAuthStore } from "@/store/Auth";
import toast from "react-hot-toast";
import { validateAdminUpdate, validateNewDepartment } from "@/lib/validation";
import { User } from "@/types/User";
import { Risk } from "@/types/Risk";

// Import custom components
import UsersTab from "@/components/admin/UsersTab";
import DepartmentsTab from "@/components/admin/DepartmentsTab";
import RisksTab from "@/components/admin/RisksTab";
import CreateUserDialog from "@/components/admin/dialogs/CreateUserDialog";
import DeleteUserDialog from "@/components/admin/dialogs/DeleteUserDialog";
import UserProfileDialog from "@/components/admin/dialogs/UserProfileDialog";

// Define tab types
type TabType = "users" | "departments" | "risks";

// Default departments
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

const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  // Main tab state
  const [activeTab, setActiveTab] = useState<TabType>("users");

  // Users tab state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Departments tab state
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [newDepartment, setNewDepartment] = useState("");
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [addingDepartment, setAddingDepartment] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<string | null>(
    null
  );

  // Risks tab state
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const [risksLoading, setRisksLoading] = useState(true);
  const [risksError, setRisksError] = useState<string | null>(null);
  const [riskSearchQuery, setRiskSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // User profile dialog state
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

  // Reset password state
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] =
    useState<boolean>(false);
  const [resetPasswordLoading, setResetPasswordLoading] =
    useState<boolean>(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] =
    useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordCopiedReset, setPasswordCopiedReset] =
    useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // Create User dialog state
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

  // Delete User dialog state
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [riskHandlingOption, setRiskHandlingOption] =
    useState<string>("anonymize");
  const [reassignUserId, setReassignUserId] = useState<string>("");
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState("");

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.prefs?.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  // ===== Users Tab Functions =====
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

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter((usr) => {
        return (
          (usr.name && usr.name.toLowerCase().includes(lowercasedQuery)) ||
          (usr.email && usr.email.toLowerCase().includes(lowercasedQuery)) ||
          (usr.prefs?.department &&
            typeof usr.prefs.department === "string" &&
            usr.prefs.department.toLowerCase().includes(lowercasedQuery)) ||
          (usr.prefs?.role &&
            typeof usr.prefs.role === "string" && usr.prefs.role.toLowerCase().includes(lowercasedQuery))
        );
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleUpdate = async (
    userId: string,
    field: "role" | "department" | "receiveNotifications",
    value: string | boolean
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

  // ===== Departments Tab Functions =====
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

  // ===== Risks Tab Functions =====
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

  // Filter risks based on search and filter criteria
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

  // ===== User Profile Functions =====
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

  // View user profile and risks
  const handleViewUserProfile = async (usr: User) => {
    setSelectedUser(usr);
    setUserDialogOpen(true);
    await fetchUserRisks(usr.$id);
    setEditedUserInfo({ name: usr.name, email: usr.email });
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

  // ===== Reset Password Functions =====
  const handleResetPassword = async () => {
    if (!selectedUser) return;

    // Validate password
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setResetPasswordLoading(true);
      setPasswordError("");

      const response = await fetch("/api/admin/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.$id,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setResetPasswordSuccess(true);
      toast.success("Password reset successfully");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to reset password"
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // ===== Create User Functions =====
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

  // Copy reset password to clipboard
  const copyResetPasswordToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    setPasswordCopiedReset(true);
    setTimeout(() => setPasswordCopiedReset(false), 2000);
  };

  // ===== Delete User Functions =====
  const handlePrepareDeleteUser = (usr: User) => {
    setUserToDelete(usr);
    setDeleteUserDialogOpen(true);
    setRiskHandlingOption("anonymize");
    setReassignUserId("");
    setDeleteUserError("");
  };

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

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 pt-16 pb-12 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin header with title */}
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

        {/* Tab Content using the component structure */}
        {activeTab === "users" && (
          <UsersTab
            users={users}
            filteredUsers={filteredUsers}
            loading={loading}
            error={error}
            refreshing={refreshing}
            departments={departments}
            searchQuery={searchQuery}
            updatingUser={updatingUser}
            onSearchChange={setSearchQuery}
            onRefresh={fetchUsers}
            onCreateUser={() => setCreateUserDialogOpen(true)}
            onViewProfile={handleViewUserProfile}
            onDeleteUser={handlePrepareDeleteUser}
            onUpdateUser={handleUpdate}
          />
        )}

        {activeTab === "departments" && (
          <DepartmentsTab
            departments={departments}
            users={users}
            loading={departmentsLoading}
            error={departmentError}
            showAddDepartment={showAddDepartment}
            newDepartment={newDepartment}
            addingDepartment={addingDepartment}
            deletingDepartment={deletingDepartment}
            onShowAddDepartment={setShowAddDepartment}
            onNewDepartmentChange={setNewDepartment}
            onAddDepartment={handleAddDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            defaultDepartments={DEFAULT_DEPARTMENTS}
          />
        )}

        {activeTab === "risks" && (
          <RisksTab
            risks={risks}
            filteredRisks={filteredRisks}
            loading={risksLoading}
            error={risksError}
            searchQuery={riskSearchQuery}
            departmentFilter={departmentFilter}
            impactFilter={impactFilter}
            statusFilter={statusFilter}
            departments={departments}
            onSearchChange={setRiskSearchQuery}
            onDepartmentFilterChange={setDepartmentFilter}
            onImpactFilterChange={setImpactFilter}
            onStatusFilterChange={setStatusFilter}
            onRefresh={fetchRisks}
            onUpdateRisk={handleUpdateRisk}
          />
        )}
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        open={createUserDialogOpen}
        onOpenChange={setCreateUserDialogOpen}
        departments={departments}
        isCreating={isCreatingUser}
        error={createUserError}
        tempPassword={tempPassword}
        passwordCopied={passwordCopied}
        onCreateUser={handleCreateUser}
        onUserDataChange={(field, value) =>
          setNewUserData((prev) => ({ ...prev, [field]: value }))
        }
        onCopyPassword={copyPasswordToClipboard}
        userData={newUserData}
      />

      <DeleteUserDialog
        open={deleteUserDialogOpen}
        onOpenChange={setDeleteUserDialogOpen}
        user={userToDelete}
        users={users}
        isDeleting={isDeletingUser}
        error={deleteUserError}
        riskHandlingOption={riskHandlingOption}
        reassignUserId={reassignUserId}
        onRiskHandlingChange={setRiskHandlingOption}
        onReassignUserChange={setReassignUserId}
        onDeleteUser={handleDeleteUser}
      />

      <UserProfileDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
        userRisks={userRisks}
        departments={departments}
        editingUserInfo={editingUserInfo}
        editingUserRisks={editingUserRisks}
        editedUserInfo={editedUserInfo}
        updatingUserInfo={updatingUserInfo}
        userRisksLoading={userRisksLoading}
        resetPasswordDialogOpen={resetPasswordDialogOpen}
        resetPasswordLoading={resetPasswordLoading}
        resetPasswordSuccess={resetPasswordSuccess}
        newPassword={newPassword}
        passwordCopiedReset={passwordCopiedReset}
        confirmPassword={confirmPassword}
        passwordError={passwordError}
        onEditedUserInfoChange={(field, value) =>
          setEditedUserInfo((prev) => ({ ...prev, [field]: value }))
        }
        onSetEditingUserInfo={setEditingUserInfo}
        onSetEditingUserRisks={setEditingUserRisks}
        onUpdateUserRole={(role) => {
          if (selectedUser) handleUpdate(selectedUser.$id, "role", role);
        }}
        onUpdateUserDepartment={(department) => {
          if (selectedUser)
            handleUpdate(selectedUser.$id, "department", department);
        }}
        onUpdateUserNotifications={(enabled) => {
          if (selectedUser)
            handleUpdate(selectedUser.$id, "receiveNotifications", enabled);
        }}
        onUpdateUserInfo={handleUpdateUserInfo}
        onOpenResetPasswordDialog={() => {
          setResetPasswordDialogOpen(true);
          setNewPassword("");
          setConfirmPassword("");
          setPasswordError("");
          setResetPasswordSuccess(false);
        }}
        onCancelUserInfoEdit={() => {
          setEditingUserInfo(false);
          if (selectedUser) {
            setEditedUserInfo({
              name: selectedUser.name,
              email: selectedUser.email,
            });
          }
        }}
        onResetPassword={handleResetPassword}
        onCopyResetPassword={copyResetPasswordToClipboard}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onCloseResetPasswordDialog={() => {
          setResetPasswordDialogOpen(false);
          setResetPasswordSuccess(false);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
