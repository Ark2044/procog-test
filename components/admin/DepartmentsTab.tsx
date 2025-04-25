import { FaBuilding, FaCheck, FaPlus, FaSync, FaTimes } from "react-icons/fa";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import { User } from "@/types/User";

interface DepartmentsTabProps {
  departments: string[];
  users: User[];
  loading: boolean;
  error: string | null;
  showAddDepartment: boolean;
  newDepartment: string;
  addingDepartment: boolean;
  deletingDepartment: string | null;
  onShowAddDepartment: (show: boolean) => void;
  onNewDepartmentChange: (value: string) => void;
  onAddDepartment: () => void;
  onDeleteDepartment: (department: string) => void;
  defaultDepartments: string[];
}

const DepartmentsTab: React.FC<DepartmentsTabProps> = ({
  departments,
  users,
  loading,
  error,
  showAddDepartment,
  newDepartment,
  addingDepartment,
  deletingDepartment,
  onShowAddDepartment,
  onNewDepartmentChange,
  onAddDepartment,
  onDeleteDepartment,
  defaultDepartments,
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

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
              onChange={(e) => onNewDepartmentChange(e.target.value)}
              disabled={addingDepartment}
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={onAddDepartment}
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
                  onShowAddDepartment(false);
                  onNewDepartmentChange("");
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
            onClick={() => onShowAddDepartment(true)}
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
                const isDefault = defaultDepartments.includes(dept);
                const usersCount = users.filter(
                  (u) => u.prefs?.department === dept
                ).length;
                const isInUse = departmentsInUse.has(dept);

                return (
                  <tr key={dept} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBuilding className="mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {dept}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDefault
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isDefault ? "Default" : "Custom"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usersCount} user{usersCount !== 1 ? "s" : ""}
                      {isInUse && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          In Use
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!isDefault && (
                        <button
                          onClick={() => onDeleteDepartment(dept)}
                          disabled={
                            deletingDepartment === dept || usersCount > 0
                          }
                          className={`text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded-md hover:bg-red-50 ${
                            deletingDepartment === dept ? "opacity-50" : ""
                          }`}
                          title={
                            usersCount > 0
                              ? "Cannot delete department with assigned users"
                              : "Delete department"
                          }
                        >
                          {deletingDepartment === dept ? (
                            <FaSync className="animate-spin" />
                          ) : (
                            "Delete"
                          )}
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

export default DepartmentsTab;
