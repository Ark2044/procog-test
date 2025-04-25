import React from "react";
import {
  FaSearch,
  FaBuilding,
  FaExclamationCircle,
  FaFilter,
  FaSync,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import { StatusSelect } from "./StatusSelect";
import { Risk } from "@/types/Risk";

interface RisksTabProps {
  risks: Risk[];
  filteredRisks: Risk[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  departmentFilter: string;
  impactFilter: string;
  statusFilter: string;
  departments: string[];
  onSearchChange: (query: string) => void;
  onDepartmentFilterChange: (value: string) => void;
  onImpactFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
  onUpdateRisk: (riskId: string, field: string, value: string) => void;
}

const RisksTab: React.FC<RisksTabProps> = ({
  filteredRisks,
  loading,
  error,
  searchQuery,
  departmentFilter,
  impactFilter,
  statusFilter,
  departments,
  onSearchChange,
  onDepartmentFilterChange,
  onImpactFilterChange,
  onStatusFilterChange,
  onRefresh,
  onUpdateRisk,
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} retryFn={onRefresh} />;

  return (
    <>
      {/* Filter controls */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Search risks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white text-gray-800 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border border-gray-200"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-between sm:justify-start">
            <div className="w-full sm:w-40">
              <Select
                value={departmentFilter}
                onValueChange={onDepartmentFilterChange}
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
              <Select value={impactFilter} onValueChange={onImpactFilterChange}>
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
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
              onClick={onRefresh}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors w-full sm:w-auto"
            >
              <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
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
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {risk.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                          {risk.content.substring(0, 100)}
                          {risk.content.length > 100 ? "..." : ""}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">
                        {risk.authorName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(risk.created).toLocaleDateString()}
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
                          onUpdateRisk(risk.$id, "impact", value)
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
                          onUpdateRisk(risk.$id, "status", value)
                        }
                        colorClasses={(value) =>
                          value === "active"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-50 text-gray-700"
                        }
                        icon={<FaFilter className="text-xs sm:text-sm" />}
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {risk.department || "General"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-full"
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
      </div>
    </>
  );
};

export default RisksTab;
