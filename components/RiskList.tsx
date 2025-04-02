"use client";
import { useEffect, useState, useCallback } from "react";
import { databases } from "@/models/client/config";
import { riskCollection, db } from "@/models/name";
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
import { ReminderDialog } from './ReminderDialog';

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
  created: string;
  updated: string;
  isConfidential?: boolean;
  authorizedViewers?: string[];
  department?: string;
}

interface RiskListProps {
  userId?: string;
}

const RiskList: React.FC<RiskListProps> = ({ userId }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"my" | "all">("my");
  const [sortBy, setSortBy] = useState<"created" | "impact">("created");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

  const { user } = useAuthStore();
  const currentUserId = userId || user?.$id;

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
        created: doc.created,
        updated: doc.updated,
        isConfidential: doc.isConfidential,
        authorizedViewers: doc.authorizedViewers,
        department: doc.department,
      }));

      setRisks(risksData);
    } catch (err) {
      setError("Failed to fetch risks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const filteredAndSortedRisks = () => {
    let filtered =
      viewMode === "my" && currentUserId
        ? risks.filter((risk) => risk.authorId === currentUserId)
        : risks;

    if (user && user.prefs?.role !== "admin") {
      filtered = filtered.filter(
        (risk) =>
          risk.department === user.prefs.department &&
          (!risk.isConfidential ||
            risk.authorizedViewers?.includes(user.$id) ||
            risk.authorId === user.$id)
      );
    }

    if (filterImpact !== "all") {
      filtered = filtered.filter((risk) => risk.impact === filterImpact);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "created") {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      } else {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
    });
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          defaultValue={viewMode}
          onValueChange={(value) => setViewMode(value as "my" | "all")}
          className="w-full sm:w-auto "
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-[240px] border border-gray-200 rounded">
            <TabsTrigger value="my" className="text-gray-800 ">
              My Risks
            </TabsTrigger>
            <TabsTrigger value="all" className="text-gray-800">
              All Risks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select value={filterImpact} onValueChange={setFilterImpact}>
            <SelectTrigger className="w-[140px] bg-white text-gray-800 border border-gray-200">
              <SelectValue placeholder="Impact Level" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-800 border border-gray-200">
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
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "created" | "impact")}
          >
            <SelectTrigger className="w-[140px] bg-white text-gray-800 border border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-800 border border-gray-200">
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="impact">Impact Level</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedRisks().length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center bg-gray-100">
              <p className="text-gray-600">No risks found</p>
            </div>
          ) : (
            filteredAndSortedRisks().map((risk) => (
              <div key={risk.$id}>
                <Link href={`/risk/${risk.$id}`}>
                  <RiskCard
                    {...risk}
                    riskId={risk.$id}
                    currentUserId={user?.$id}
                    onSetReminder={
                      user && user.$id === risk.authorId
                        ? () => {
                            setSelectedRisk(risk);
                            setIsReminderDialogOpen(true);
                          }
                        : undefined
                    }
                  />
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {selectedRisk && user && (
        <ReminderDialog
          isOpen={isReminderDialogOpen}
          onClose={() => {
            setIsReminderDialogOpen(false);
            setSelectedRisk(null);
          }}
          riskId={selectedRisk.$id}
          riskTitle={selectedRisk.title}
          userId={user.$id}
          email={user.email}
        />
      )}
    </div>
  );
};

export default RiskList;
