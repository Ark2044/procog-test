"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { databases } from "@/models/client/config";
import {
  riskCollection,
  db,
  commentCollection,
  reminderCollection,
} from "@/models/name";
import RiskCard from "./RiskCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X, Filter, SortDesc, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/Auth";
import { ReminderDialog } from "./ReminderDialog";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import { VALID_ACTIONS } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";

interface Risk {
  $id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags: string[];
  attachmentId?: string;
  impact: "low" | "medium" | "high";
  probability: number;
  action: "mitigate" | "accept" | "transfer" | "avoid";
  mitigation?: string;
  acceptance?: string;
  transfer?: string;
  avoidance?: string;
  created: string;
  updated: string;
  isConfidential?: boolean;
  authorizedViewers?: string[];
  department?: string;
  dueDate?: string;
  status?: "active" | "closed";
  resolution?: string;
  commentCount?: number;
  reminderCount?: number;
}

interface RiskListProps {
  userId?: string;
}

const RiskList: React.FC<RiskListProps> = ({ userId }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"my" | "all">("my");
  const [sortBy, setSortBy] = useState<
    "created" | "impact" | "dueDate" | "probability" | "updated"
  >("created");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [filterProbability, setFilterProbability] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterDueDate, setFilterDueDate] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {}
  );
  const [reminderCounts, setReminderCounts] = useState<Record<string, number>>(
    {}
  );
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { user } = useAuthStore();
  const currentUserId = userId || user?.$id;
  const router = useRouter();

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterAction !== "all") count++;
    if (filterImpact !== "all") count++;
    if (filterProbability !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterDueDate !== "all") count++;
    return count;
  }, [
    filterAction,
    filterImpact,
    filterProbability,
    filterStatus,
    filterDueDate,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setFilterAction("all");
    setFilterImpact("all");
    setFilterProbability("all");
    setFilterStatus("active"); // Default to active risks
    setFilterDueDate("all");
  };

  const fetchCommentCounts = async (riskIds: string[]) => {
    if (riskIds.length === 0) return;

    try {
      const counts: Record<string, number> = {};

      await Promise.all(
        riskIds.map(async (riskId) => {
          const response = await databases.listDocuments(
            db,
            commentCollection,
            [Query.equal("riskId", riskId)]
          );
          counts[riskId] = response.total;
        })
      );

      setCommentCounts(counts);
    } catch (error) {
      console.error("Failed to fetch comment counts:", error);
    }
  };

  const fetchReminderCounts = useCallback(
    async (riskIds: string[]) => {
      if (!currentUserId || riskIds.length === 0) return;

      try {
        const counts: Record<string, number> = {};

        await Promise.all(
          riskIds.map(async (riskId) => {
            const response = await databases.listDocuments(
              db,
              reminderCollection,
              [
                Query.equal("riskId", riskId),
                Query.equal("userId", currentUserId),
              ]
            );
            counts[riskId] = response.total;
          })
        );

        setReminderCounts(counts);
      } catch (error) {
        console.error("Failed to fetch reminder counts:", error);
      }
    },
    [currentUserId]
  );

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(db, riskCollection);
      const risksData: Risk[] = response.documents.map((doc) => ({
        $id: doc.$id,
        title: doc.title,
        content: doc.content,
        authorId: doc.authorId,
        authorName: doc.authorName,
        tags: doc.tags || [],
        attachmentId: doc.attachmentId,
        impact: doc.impact,
        probability: doc.probability,
        action: doc.action,
        mitigation: doc.mitigation,
        acceptance: doc.acceptance,
        transfer: doc.transfer,
        avoidance: doc.avoidance,
        created: doc.created,
        updated: doc.updated,
        isConfidential: doc.isConfidential,
        authorizedViewers: doc.authorizedViewers,
        department: doc.department,
        dueDate: doc.dueDate,
        status: doc.status || "active",
        resolution: doc.resolution,
      }));

      setRisks(risksData);

      const riskIds = risksData.map((risk) => risk.$id);
      fetchCommentCounts(riskIds);
      fetchReminderCounts(riskIds);
    } catch (err) {
      setError("Failed to fetch risks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchReminderCounts]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const filteredAndSortedRisks = useMemo(() => {
    let filtered =
      viewMode === "my" && currentUserId
        ? risks.filter((risk) => risk.authorId === currentUserId)
        : risks;

    if (user && user.prefs?.role !== "admin") {
      filtered = filtered.filter(
        (risk) =>
          !risk.isConfidential ||
          risk.authorizedViewers?.includes(user.$id) ||
          risk.authorId === user.$id
      );
    }

    if (filterAction !== "all") {
      filtered = filtered.filter((risk) => risk.action === filterAction);
    }

    if (filterImpact !== "all") {
      filtered = filtered.filter((risk) => risk.impact === filterImpact);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((risk) => risk.status === filterStatus);
    }

    if (filterProbability !== "all") {
      const [min, max] = filterProbability.split("-").map(Number);
      filtered = filtered.filter(
        (risk) => risk.probability >= min && risk.probability <= max
      );
    }

    if (filterDueDate !== "all") {
      const now = new Date();
      filtered = filtered.filter((risk) => {
        if (!risk.dueDate) return false;
        const dueDate = new Date(risk.dueDate);
        switch (filterDueDate) {
          case "overdue":
            return dueDate < now && risk.status === "active";
          case "today":
            return dueDate.toDateString() === now.toDateString();
          case "tomorrow":
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            return dueDate.toDateString() === tomorrow.toDateString();
          case "week":
            const weekFromNow = new Date(now);
            weekFromNow.setDate(now.getDate() + 7);
            return dueDate <= weekFromNow && dueDate > now;
          case "month":
            const monthFromNow = new Date(now);
            monthFromNow.setMonth(now.getMonth() + 1);
            return dueDate <= monthFromNow && dueDate > now;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case "updated":
          return new Date(b.updated).getTime() - new Date(a.updated).getTime();
        case "impact":
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        case "probability":
          return b.probability - a.probability;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default:
          return 0;
      }
    });
  }, [
    risks,
    viewMode,
    currentUserId,
    user,
    filterAction,
    filterImpact,
    filterStatus,
    filterProbability,
    filterDueDate,
    sortBy,
  ]);

  const handleAnalyzeRisk = (riskId: string) => {
    router.push(`/risk/${riskId}?tab=analysis`);
  };

  const renderFilterBadges = () => {
    const badges = [];

    if (filterAction !== "all") {
      badges.push(
        <Badge
          key="action"
          variant="outline"
          className="bg-blue-50 border-blue-200 text-blue-700 flex items-center gap-1 py-1"
        >
          Action: {filterAction}
          <X
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setFilterAction("all");
            }}
          />
        </Badge>
      );
    }

    if (filterImpact !== "all") {
      badges.push(
        <Badge
          key="impact"
          variant="outline"
          className="bg-purple-50 border-purple-200 text-purple-700 flex items-center gap-1 py-1"
        >
          Impact: {filterImpact}
          <X
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setFilterImpact("all");
            }}
          />
        </Badge>
      );
    }

    if (filterStatus !== "all") {
      badges.push(
        <Badge
          key="status"
          variant="outline"
          className="bg-green-50 border-green-200 text-green-700 flex items-center gap-1 py-1"
        >
          Status: {filterStatus}
          <X
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setFilterStatus("all");
            }}
          />
        </Badge>
      );
    }

    if (filterProbability !== "all") {
      const probabilityLabel =
        filterProbability === "0-1"
          ? "Very Low"
          : filterProbability === "2-3"
          ? "Low"
          : "High";

      badges.push(
        <Badge
          key="probability"
          variant="outline"
          className="bg-amber-50 border-amber-200 text-amber-700 flex items-center gap-1 py-1"
        >
          Probability: {probabilityLabel}
          <X
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setFilterProbability("all");
            }}
          />
        </Badge>
      );
    }

    if (filterDueDate !== "all") {
      const dueDateLabel =
        filterDueDate === "overdue"
          ? "Overdue"
          : filterDueDate === "today"
          ? "Today"
          : filterDueDate === "tomorrow"
          ? "Tomorrow"
          : filterDueDate === "week"
          ? "This Week"
          : "This Month";

      badges.push(
        <Badge
          key="dueDate"
          variant="outline"
          className="bg-red-50 border-red-200 text-red-700 flex items-center gap-1 py-1"
        >
          Due Date: {dueDateLabel}
          <X
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setFilterDueDate("all");
            }}
          />
        </Badge>
      );
    }

    return badges;
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-gray-800 border border-red-200">
        <p className="font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
          Error
        </p>
        <p className="text-sm mt-1">{error}</p>
        <Button
          className="mt-2 bg-white text-red-600 border border-red-300 hover:bg-red-50"
          size="sm"
          onClick={fetchRisks}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const filteredRisks = filteredAndSortedRisks;
  const totalRisks = risks.length;
  const filteredCount = filteredRisks.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <Tabs
          defaultValue={viewMode}
          onValueChange={(value) => setViewMode(value as "my" | "all")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-[240px] border border-gray-200 rounded">
            <TabsTrigger
              value="my"
              className="text-gray-800 text-xs sm:text-sm py-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              My Risks
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-gray-800 text-xs sm:text-sm py-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              All Risks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Collapsible
            open={isFilterExpanded}
            onOpenChange={setIsFilterExpanded}
            className="w-full"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 flex items-center gap-1 ${
                      activeFilterCount > 0
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : ""
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-indigo-600 text-white">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </CollapsibleTrigger>

                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as typeof sortBy)}
                >
                  <SelectTrigger className="w-[110px] sm:w-[140px] h-9 text-xs sm:text-sm bg-white">
                    <div className="flex items-center">
                      <SortDesc className="h-3.5 w-3.5 mr-1.5" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort by</SelectLabel>
                      <SelectItem value="created">Date Created</SelectItem>
                      <SelectItem value="updated">Last Updated</SelectItem>
                      <SelectItem value="impact">Impact Level</SelectItem>
                      <SelectItem value="probability">Probability</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {filteredRisks.length > 0 && (
                <div className="text-sm text-gray-500">
                  {filteredCount === totalRisks
                    ? `Showing all ${totalRisks} risks`
                    : `Showing ${filteredCount} of ${totalRisks} risks`}
                </div>
              )}
            </div>

            <CollapsibleContent className="mt-3">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 border border-gray-200 rounded-md bg-gray-50"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {renderFilterBadges()}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-full h-9 text-xs sm:text-sm bg-white">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Action</SelectLabel>
                        <SelectItem value="all">All Actions</SelectItem>
                        {VALID_ACTIONS.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select value={filterImpact} onValueChange={setFilterImpact}>
                    <SelectTrigger className="w-full h-9 text-xs sm:text-sm bg-white">
                      <SelectValue placeholder="Impact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Impact</SelectLabel>
                        <SelectItem value="all">All Impacts</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterProbability}
                    onValueChange={setFilterProbability}
                  >
                    <SelectTrigger className="w-full h-9 text-xs sm:text-sm bg-white">
                      <SelectValue placeholder="Probability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Probability</SelectLabel>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="0-1">Very Low (0-1)</SelectItem>
                        <SelectItem value="2-3">Low (2-3)</SelectItem>
                        <SelectItem value="4-5">High (4-5)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full h-9 text-xs sm:text-sm bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Status</SelectLabel>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterDueDate}
                    onValueChange={setFilterDueDate}
                  >
                    <SelectTrigger className="w-full h-9 text-xs sm:text-sm bg-white">
                      <SelectValue placeholder="Due Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Due Date</SelectLabel>
                        <SelectItem value="all">All Due Dates</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="today">Due Today</SelectItem>
                        <SelectItem value="tomorrow">Due Tomorrow</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end mt-3">
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-white flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset Filters
                  </Button>
                </div>
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading your risk data...</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6">
          {loading && !risks.length ? (
            <div className="flex items-center justify-center p-4 sm:p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Loader2 className="animate-spin mr-2 w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              <span className="text-sm sm:text-base">Loading risks...</span>
            </div>
          ) : filteredRisks.length === 0 ? (
            <div className="bg-white rounded-lg p-6 sm:p-8 text-center border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                No risks found
              </p>
              <p className="mb-4 text-sm sm:text-base text-gray-500">
                {activeFilterCount > 0
                  ? "Try adjusting your filter criteria to see more results."
                  : "Create your first risk to get started with risk management."}
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mx-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            filteredRisks.map((risk) => (
              <motion.div
                key={risk.$id}
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RiskCard
                  {...risk}
                  riskId={risk.$id}
                  currentUserId={currentUserId}
                  onSetReminder={
                    user && user.$id === risk.authorId
                      ? () => {
                          setSelectedRisk(risk);
                          setIsReminderDialogOpen(true);
                        }
                      : undefined
                  }
                  onAnalyze={
                    user ? () => handleAnalyzeRisk(risk.$id) : undefined
                  }
                  commentCount={commentCounts[risk.$id] || 0}
                  reminderCount={reminderCounts[risk.$id] || 0}
                />
              </motion.div>
            ))
          )}
        </div>
      )}

      {isReminderDialogOpen && selectedRisk && (
        <ReminderDialog
          isOpen={isReminderDialogOpen}
          onClose={() => {
            setIsReminderDialogOpen(false);
            setSelectedRisk(null);
          }}
          riskId={selectedRisk.$id}
          riskTitle={selectedRisk.title}
          userId={currentUserId || ""}
          email={user?.email}
        />
      )}
    </div>
  );
};

export default RiskList;
