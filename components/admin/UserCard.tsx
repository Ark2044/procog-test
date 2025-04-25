import React from "react";
import { FaTrash, FaUserEdit } from "react-icons/fa";
import { Button } from "../ui/button";
import { User } from "@/types/User";

interface UserCardProps {
  user: User;
  onViewProfile: (user: User) => void;
  onDelete: (user: User) => void;
  onUpdate: (
    userId: string,
    field: "role" | "department" | "receiveNotifications",
    value: string | boolean
  ) => void;
  updatingUser: string | null;
  departments: string[];
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onViewProfile,
  onDelete,
  onUpdate,
  updatingUser,
  departments,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold mr-3 sm:mr-4 flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-md p-2">
            <p className="text-xs text-gray-500 mb-1">Role</p>
            <div className="flex items-center">
              <select
                className="bg-white text-gray-800 rounded px-2 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={String(user.prefs?.role || "user")}
                onChange={(e) => onUpdate(user.$id, "role", e.target.value)}
                disabled={updatingUser === user.$id}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {user.prefs.role !== "admin" && (
            <div className="bg-gray-50 rounded-md p-2">
              <p className="text-xs text-gray-500 mb-1">Department</p>
              <div className="flex items-center">
                <select
                  className="bg-white text-gray-800 rounded px-2 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={String(user.prefs?.department || "")}
                  onChange={(e) =>
                    onUpdate(
                      user.$id,
                      "department",
                      e.target.value === "" ? "" : e.target.value
                    )
                  }
                  disabled={updatingUser === user.$id}
                >
                  <option value="">None</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {user.prefs.role === "admin" && (
            <div className="bg-gray-50 rounded-md p-2">
              <p className="text-xs text-gray-500 mb-1">Admin Access</p>
              <div className="text-sm text-gray-700">Full system access</div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-500">
            {user.prefs.reputation
              ? `Reputation: ${user.prefs.reputation} points`
              : "New User"}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => onViewProfile(user)}
            >
              <FaUserEdit className="mr-1 text-xs" /> Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={() => onDelete(user)}
            >
              <FaTrash className="mr-1 text-xs" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
