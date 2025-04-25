import React, { useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaSync,
  FaUsers,
  FaBell,
  FaBellSlash,
} from "react-icons/fa";
import { Button } from "../ui/button";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import UserCard from "./UserCard";
import { User } from "@/types/User";
import { Card } from "../ui/card";
import toast from "react-hot-toast";

interface UsersTabProps {
  users: User[];
  filteredUsers: User[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  departments: string[];
  searchQuery: string;
  updatingUser: string | null;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onCreateUser: () => void;
  onViewProfile: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onUpdateUser: (
    userId: string,
    field: "role" | "department" | "receiveNotifications",
    value: string | boolean
  ) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  filteredUsers,
  loading,
  error,
  refreshing,
  departments,
  searchQuery,
  updatingUser,
  onSearchChange,
  onRefresh,
  onCreateUser,
  onViewProfile,
  onDeleteUser,
  onUpdateUser,
}) => {
  const [updatingAllNotifications, setUpdatingAllNotifications] =
    useState(false);
  const [globalNotificationsEnabled, setGlobalNotificationsEnabled] = useState<
    boolean | null
  >(null);

  // Determine the current state of notifications across all users
  React.useEffect(() => {
    if (users.length > 0 && globalNotificationsEnabled === null) {
      // Check if all users have the same notification setting
      const enabledCount = users.filter(
        (user) => user.prefs?.receiveNotifications !== false
      ).length;

      // If all users have notifications enabled, set to true
      // If all users have notifications disabled, set to false
      // Otherwise, we're in a mixed state (null)
      if (enabledCount === users.length) {
        setGlobalNotificationsEnabled(true);
      } else if (enabledCount === 0) {
        setGlobalNotificationsEnabled(false);
      } else {
        setGlobalNotificationsEnabled(null);
      }
    }
  }, [globalNotificationsEnabled, users]);

  // Function to toggle notifications for all users
  const handleToggleAllNotifications = async (enable: boolean) => {
    try {
      setUpdatingAllNotifications(true);

      const response = await fetch("/api/admin/updateAllNotifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: enable }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification settings");
      }

      const data = await response.json();

      // Update local state
      setGlobalNotificationsEnabled(enable);

      // Refresh the users list to reflect the changes
      onRefresh();

      toast.success(
        `${enable ? "Enabled" : "Disabled"} notifications for ${
          data.successCount
        } users`
      );

      if (data.failureCount > 0) {
        toast.error(`Failed to update ${data.failureCount} users`);
      }
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setUpdatingAllNotifications(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} retryFn={onRefresh} />;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto">
          <Button
            onClick={onCreateUser}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md flex-grow sm:flex-grow-0"
          >
            <FaPlus className="mr-2" /> Create User
          </Button>

          <Button
            onClick={onRefresh}
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

      {/* Global notification settings */}
      <Card className="p-4 mb-6 border border-blue-200 bg-blue-50">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              Universal Notification Management
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Enable or disable email notifications for all users with a single
              click
            </p>
          </div>
          <div className="flex items-center mt-4 sm:mt-0">
            <Button
              variant="outline"
              className={`mr-2 ${
                globalNotificationsEnabled === false
                  ? "bg-gray-200 border-gray-300"
                  : "bg-white"
              }`}
              onClick={() => handleToggleAllNotifications(false)}
              disabled={
                updatingAllNotifications || globalNotificationsEnabled === false
              }
            >
              <FaBellSlash className="mr-2 text-gray-600" />
              Disable All
            </Button>
            <Button
              variant="outline"
              className={`${
                globalNotificationsEnabled === true
                  ? "bg-blue-100 border-blue-300"
                  : "bg-white"
              }`}
              onClick={() => handleToggleAllNotifications(true)}
              disabled={
                updatingAllNotifications || globalNotificationsEnabled === true
              }
            >
              <FaBell className="mr-2 text-blue-600" />
              Enable All
            </Button>
          </div>
        </div>
        {updatingAllNotifications && (
          <div className="mt-2 flex items-center text-sm text-blue-700">
            <FaSync className="animate-spin mr-2" />
            Updating notification settings for all users...
          </div>
        )}
        {globalNotificationsEnabled === null && !updatingAllNotifications && (
          <div className="mt-2 text-sm text-amber-700">
            Users have mixed notification settings. Use the buttons above to
            standardize.
          </div>
        )}
      </Card>

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
          {filteredUsers.map((user) => (
            <UserCard
              key={user.$id}
              user={user}
              onViewProfile={onViewProfile}
              onDelete={onDeleteUser}
              onUpdate={onUpdateUser}
              updatingUser={updatingUser}
              departments={departments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersTab;
