"use client";
import { useEffect, useState, useCallback } from "react";
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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/Auth";
import { ReminderDialog } from "./ReminderDialog";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import { VALID_ACTIONS } from "@/lib/validation";

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
  status?: "active" | "closed" | "resolved";
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
  const [sortBy, setSortBy] = useState<"created" | "impact" | "dueDate" | "probability" | "updated">("created");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [filterProbability, setFilterProbability] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDueDate, setFilterDueDate] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {}
  );
  const [reminderCounts, setReminderCounts] = useState<Record<string, number>>(
    {}
  );

  const { user } = useAuthStore();
  const currentUserId = userId || user?.$id;
  const router = useRouter();

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

  const filteredAndSortedRisks = () => {
    let filtered = viewMode === "my" && currentUserId
      ? risks.filter((risk) => risk.authorId === currentUserId)
      : risks;

    if (user && user.prefs?.role !== "admin") {
      filtered = filtered.filter(
        (risk) =>
          (!risk.isConfidential ||
            risk.authorizedViewers?.includes(user.$id) ||
            risk.authorId === user.$id)
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
  };

  const handleAnalyzeRisk = (riskId: string) => {
    router.push(`/risk/${riskId}?tab=analysis`);
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-gray-800 border border-red-200">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          defaultValue={viewMode}
          onValueChange={(value) => setViewMode(value as "my" | "all")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-[240px] border border-gray-200 rounded">
            <TabsTrigger
              value="my"
              className="text-gray-800 text-xs sm:text-sm py-1.5"
            >
              My Risks
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-gray-800 text-xs sm:text-sm py-1.5"
            >
              All Risks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[110px] sm:w-[140px] h-9 text-xs sm:text-sm bg-white">
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
            <SelectTrigger className="w-[110px] sm:w-[140px] h-9 text-xs sm:text-sm bg-white">
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

          <Select value={filterProbability} onValueChange={setFilterProbability}>
            <SelectTrigger className="w-[110px] sm:w-[140px] h-9 text-xs sm:text-sm bg-white">
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
            <SelectTrigger className="w-[110px] sm:w-[140px] h-9 text-xs sm:text-sm bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter by Status</SelectLabel>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={filterDueDate} onValueChange={setFilterDueDate}>
            <SelectTrigger className="w-[110px] sm:w-[140px] h-9 text-xs sm:text-sm bg-white">
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

          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as typeof sortBy)
            }
          >
            <SelectTrigger className="w-[110px] sm:w-[140px] h-9 text-xs sm:text-sm bg-white">
              <SelectValue placeholder="Sort by" />
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
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6">
          {loading && !risks.length ? (
            <div className="flex items-center justify-center p-4 sm:p-8">
              <Loader2 className="animate-spin mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Loading risks...</span>
            </div>
          ) : filteredAndSortedRisks().length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-8 text-center text-gray-500 border border-gray-200">
              <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                No risks found matching your criteria.
              </p>
              <Link
                href="/risk/new"
                className="text-blue-600 hover:text-blue-700 underline text-sm sm:text-base"
              >
                Create a new risk
              </Link>
            </div>
          ) : (
            filteredAndSortedRisks().map((risk) => (
              <div key={risk.$id} className="w-full">
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
              </div>
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
