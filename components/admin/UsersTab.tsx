import React, { useState } from "react";
import { FaPlus, FaSearch, FaSync, FaUsers } from "react-icons/fa";
import { Button } from "../ui/button";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import UserCard from "./UserCard";
import { User } from "@/types/User";

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
