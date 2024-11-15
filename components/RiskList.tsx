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
import Link from "next/link"; // Import Link for navigation

interface Risk {
  $id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  attachmentId?: string;
  impact: "low" | "medium" | "high";
  probability: number;
  action: "mitigate" | "accept" | "transfer" | "avoid";
  mitigation?: string; // Add mitigation strategy to Risk interface
  created: string;
  updated: string;
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

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(db, riskCollection);
      const risksData: Risk[] = response.documents.map((doc) => ({
        $id: doc.$id,
        title: doc.title,
        content: doc.content,
        authorId: doc.authorId,
        tags: doc.tags || [],
        attachmentId: doc.attachmentId,
        impact: doc.impact,
        probability: doc.probability,
        action: doc.action,
        mitigation: doc.mitigation, // Fetch mitigation strategy
        created: doc.created,
        updated: doc.updated,
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
      viewMode === "my" && userId
        ? risks.filter((risk) => risk.authorId === userId)
        : risks;

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
      <div className="rounded-lg bg-red-600 p-4 text-white">
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
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-[240px] bg-black">
            <TabsTrigger value="my" className="text-white">
              My Risks
            </TabsTrigger>
            <TabsTrigger value="all" className="text-white">
              All Risks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select value={filterImpact} onValueChange={setFilterImpact}>
            <SelectTrigger className="w-[140px] bg-gray-700 text-white">
              <SelectValue placeholder="Impact Level" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800">
              <SelectGroup>
                <SelectLabel className="text-white">
                  Filter by Impact
                </SelectLabel>
                <SelectItem value="all" className="text-white">
                  All Impacts
                </SelectItem>
                <SelectItem value="high" className="text-white">
                  High
                </SelectItem>
                <SelectItem value="medium" className="text-white">
                  Medium
                </SelectItem>
                <SelectItem value="low" className="text-white">
                  Low
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "created" | "impact")}
          >
            <SelectTrigger className="w-[140px] bg-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800">
              <SelectGroup>
                <SelectLabel className="text-white">Sort by</SelectLabel>
                <SelectItem value="created" className="text-white">
                  Date Created
                </SelectItem>
                <SelectItem value="impact" className="text-white">
                  Impact Level
                </SelectItem>
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
            <div className="rounded-lg border border-dashed p-8 text-center bg-gray-700">
              <p className="text-gray-300">No risks found</p>
            </div>
          ) : (
            filteredAndSortedRisks().map((risk) => (
              <Link key={risk.$id} href={`/risk/${risk.$id}`}>
                <RiskCard
                  title={risk.title}
                  content={risk.content}
                  authorId={risk.authorId}
                  tags={risk.tags}
                  attachmentId={risk.attachmentId}
                  impact={risk.impact}
                  probability={risk.probability}
                  action={risk.action}
                  mitigation={risk.mitigation} // Pass mitigation strategy to RiskCard
                  created={risk.created}
                  updated={risk.updated}
                />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RiskList;
