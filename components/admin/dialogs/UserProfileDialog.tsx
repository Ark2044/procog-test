import React from "react";
import { FaCheck, FaClipboard, FaSync } from "react-icons/fa";
import { User } from "@/types/User";
import { Risk } from "@/types/Risk";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import RiskStatusBadge from "../RiskStatusBadge";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  userRisks: Risk[];
  departments: string[];
  editingUserInfo: boolean;
  editingUserRisks: boolean;
  editedUserInfo: {
    name: string;
    email: string;
  };
  updatingUserInfo: boolean;
  userRisksLoading: boolean;
  resetPasswordDialogOpen: boolean;
  resetPasswordLoading: boolean;
  resetPasswordSuccess: boolean;
  newPassword: string;
  passwordCopiedReset: boolean;
  confirmPassword: string;
  passwordError: string;
  onEditedUserInfoChange: (field: string, value: string) => void;
  onSetEditingUserInfo: (editing: boolean) => void;
  onSetEditingUserRisks: (editing: boolean) => void;
  onUpdateUserRole: (role: string) => void;
  onUpdateUserDepartment: (department: string) => void;
  onUpdateUserNotifications: (enabled: boolean) => void;
  onUpdateUserInfo: () => void;
  onOpenResetPasswordDialog: () => void;
  onCancelUserInfoEdit: () => void;
  onResetPassword: () => void;
  onCopyResetPassword: () => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onCloseResetPasswordDialog: () => void;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onOpenChange,
  user,
  userRisks,
  departments,
  editingUserInfo,
  editingUserRisks,
  editedUserInfo,
  updatingUserInfo,
  userRisksLoading,
  resetPasswordDialogOpen,
  resetPasswordLoading,
  resetPasswordSuccess,
  newPassword,
  passwordCopiedReset,
  confirmPassword,
  passwordError,
  onEditedUserInfoChange,
  onSetEditingUserInfo,
  onSetEditingUserRisks,
  onUpdateUserRole,
  onUpdateUserDepartment,
  onUpdateUserNotifications,
  onUpdateUserInfo,
  onOpenResetPasswordDialog,
  onCancelUserInfoEdit,
  onResetPassword,
  onCopyResetPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onCloseResetPasswordDialog,
}) => {
  if (!user) return null;

  // Profile field component for displaying user info fields
  const ProfileField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <h4 className="text-sm font-medium text-gray-500">{label}</h4>
      <p className="text-gray-800">{value}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-medium text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>{user.name}&apos;s Profile</span>
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
                      <h4 className="text-sm font-medium text-gray-500">
                        Name
                      </h4>
                      <Input
                        id="edit-name"
                        value={editedUserInfo.name}
                        onChange={(e) =>
                          onEditedUserInfoChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Email
                      </h4>
                      <Input
                        id="edit-email"
                        value={editedUserInfo.email}
                        onChange={(e) =>
                          onEditedUserInfoChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={onUpdateUserInfo}
                        disabled={updatingUserInfo}
                        className="w-1/2"
                      >
                        {updatingUserInfo ? (
                          <FaSync className="animate-spin mr-2" />
                        ) : null}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onCancelUserInfoEdit}
                        className="w-1/2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <ProfileField label="Name" value={user.name} />
                    <ProfileField label="Email" value={user.email} />
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => onSetEditingUserInfo(true)}
                        variant="outline"
                        className="w-1/2"
                      >
                        Edit Info
                      </Button>
                      <Button
                        onClick={onOpenResetPasswordDialog}
                        variant="outline"
                        className="w-1/2"
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
                    value={String(user.prefs.role || "")}
                    onChange={(e) => onUpdateUserRole(e.target.value)}
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
                    value={String(user.prefs.department || "")}
                    onChange={(e) =>
                      onUpdateUserDepartment(
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
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Email Notifications
                  </h4>
                  <div className="flex items-center">
                    <div className="relative inline-flex items-center mr-2">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={user.prefs.receiveNotifications !== false}
                        onChange={(e) =>
                          onUpdateUserNotifications(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div
                        className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors duration-200 ease-in-out cursor-pointer"
                        role="switch"
                        aria-checked={user.prefs.receiveNotifications !== false}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                            user.prefs.receiveNotifications !== false
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-gray-700">
                      {user.prefs.receiveNotifications !== false
                        ? "Email notifications enabled"
                        : "Email notifications disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Controls whether the user receives email notifications for
                    risks, comments, and reminders
                  </p>
                </div>

                <ProfileField
                  label="Reputation"
                  value={String(user.prefs.reputation || 0)}
                />
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onSetEditingUserRisks(!editingUserRisks)}
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
                            Department
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
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {risk.title}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {risk.department || "General"}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <RiskStatusBadge
                                status={risk.impact}
                                type="impact"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <RiskStatusBadge
                                status={risk.status}
                                type="status"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() =>
                                  window.open(`/risk/${risk.$id}`, "_blank")
                                }
                              >
                                View
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

        {/* Reset Password Dialog */}
        <Dialog
          open={resetPasswordDialogOpen}
          onOpenChange={onCloseResetPasswordDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>

            {resetPasswordSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-green-800 font-medium mb-2">
                    Password Reset Successfully!
                  </h3>
                  <p className="text-green-700 text-sm mb-3">
                    A new temporary password has been generated. Make sure to
                    save it or share it with the user.
                  </p>

                  <div className="relative">
                    <input
                      type="text"
                      value={newPassword}
                      readOnly
                      className="w-full bg-white border border-green-300 rounded px-3 py-2 text-gray-700"
                    />
                    <button
                      onClick={onCopyResetPassword}
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
                  <Button onClick={onCloseResetPasswordDialog}>Close</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <p className="text-sm text-gray-600">
                  Are you sure you want to reset the password for{" "}
                  <span className="font-medium text-gray-800">{user.name}</span>
                  ? This will generate a new temporary password.
                </p>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    New Password
                  </h4>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => onNewPasswordChange(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Confirm Password
                  </h4>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={onCloseResetPasswordDialog}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onResetPassword}
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
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
