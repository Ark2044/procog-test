"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/Auth";
import { Risk } from "@/types/Risk";
import RiskList from "@/components/RiskList";
import CreateRisk from "@/components/CreateRisk";
import { databases } from "@/models/client/config";
import { riskCollection, db } from "@/models/name";
import {
  LucideAlertTriangle,
  LucideFileCheck,
  LucideSearch,
  LucideBarChart3,
  LucideCalendarClock,
  LucideRefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the data type for the Progress component
type ProgressProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

// Custom Progress component with indicator class name prop
const Progress = ({ value, className, indicatorClassName }: ProgressProps) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className || ""}`}>
      <div
        className={`h-full rounded-full ${indicatorClassName || "bg-blue-600"}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

type ImpactCount = {
  low: number;
  medium: number;
  high: number;
};

type ActionCount = {
  mitigate: number;
  accept: number;
  transfer: number;
  avoid: number;
};

// SearchRisk component for searching through risks
const SearchRisk = ({ risks }: { risks: Risk[] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredRisks([]);
      setIsDropdownOpen(false);
      return;
    }

    const filtered = risks.filter(
      (risk) =>
        risk.title.toLowerCase().includes(query.toLowerCase()) ||
        risk.content.toLowerCase().includes(query.toLowerCase()) ||
        risk.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredRisks(filtered);
    setIsDropdownOpen(true);
  };

  const handleRiskClick = (riskId: string) => {
    router.push(`/risk/${riskId}`);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search risks..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>

      {isDropdownOpen && filteredRisks.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredRisks.map((risk) => (
            <div
              key={risk.$id}
              onClick={() => handleRiskClick(risk.$id)}
              className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-800 truncate">
                {risk.title}
              </div>
              <div className="flex items-center mt-1 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    risk.impact === "high"
                      ? "bg-red-100 text-red-700"
                      : risk.impact === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {risk.impact}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-500 truncate">
                  {risk.content.substring(0, 50)}...
                </span>
              </div>
              {risk.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {risk.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {risk.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{risk.tags.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && searchQuery && filteredRisks.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center">
          <p className="text-gray-500">
            No risks found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 text-gray-800">
    <div className="animate-pulse space-y-4 w-full max-w-7xl px-4">
      <div className="h-12 bg-gray-200 rounded w-64"></div>
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const RiskActivityGraph = ({
  data,
}: {
  data: { mitigate: number; accept: number; transfer: number; avoid: number };
}) => {
  // Calculate total for percentages
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  // Calculate percentages and ensure we have values to show
  const mitigatePercent = total > 0 ? (data.mitigate / total) * 100 : 0;
  const acceptPercent = total > 0 ? (data.accept / total) * 100 : 0;
  const transferPercent = total > 0 ? (data.transfer / total) * 100 : 0;
  const avoidPercent = total > 0 ? (data.avoid / total) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Risk Response Actions
        </CardTitle>
        <CardDescription>
          Distribution of risk response strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block mr-1 rounded-sm bg-green-500"></span>
              Mitigate
            </span>
            <span>{data.mitigate}</span>
          </div>
          <Progress value={mitigatePercent} className="h-2 bg-gray-100" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block mr-1 rounded-sm bg-yellow-500"></span>
              Accept
            </span>
            <span>{data.accept}</span>
          </div>
          <Progress value={acceptPercent} className="h-2 bg-gray-100" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block mr-1 rounded-sm bg-blue-500"></span>
              Transfer
            </span>
            <span>{data.transfer}</span>
          </div>
          <Progress
            value={transferPercent}
            className="h-2 bg-gray-100 [&>div]:bg-blue-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block mr-1 rounded-sm bg-red-500"></span>
              Avoid
            </span>
            <span>{data.avoid}</span>
          </div>
          <Progress
            value={avoidPercent}
            className="h-2 bg-gray-100 [&>div]:bg-red-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ImpactDistribution = ({ data }: { data: ImpactCount }) => {
  const total = data.low + data.medium + data.high;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Impact Distribution
        </CardTitle>
        <CardDescription>Distribution of risk impact levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block mr-2"></span>
                High Impact
              </span>
              <span className="text-sm font-medium">{data.high}</span>
            </div>
            <Progress
              value={total > 0 ? (data.high / total) * 100 : 0}
              className="h-2.5 bg-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block mr-2"></span>
                Medium Impact
              </span>
              <span className="text-sm font-medium">{data.medium}</span>
            </div>
            <Progress
              value={total > 0 ? (data.medium / total) * 100 : 0}
              className="h-2.5 bg-gray-100 [&>div]:bg-yellow-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2"></span>
                Low Impact
              </span>
              <span className="text-sm font-medium">{data.low}</span>
            </div>
            <Progress
              value={total > 0 ? (data.low / total) * 100 : 0}
              className="h-2.5 bg-gray-100 [&>div]:bg-green-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const params = useParams();
  const userId = Array.isArray(params?.userId)
    ? params.userId[0]
    : params?.userId;
  const router = useRouter();
  const { user, loading, error, verifySession, session } = useAuthStore();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showCreateRisk, setShowCreateRisk] = useState(false);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [impactCount, setImpactCount] = useState<ImpactCount>({
    low: 0,
    medium: 0,
    high: 0,
  });
  const [actionCount, setActionCount] = useState<ActionCount>({
    mitigate: 0,
    accept: 0,
    transfer: 0,
    avoid: 0,
  });
  const [dueRisks, setDueRisks] = useState(0);
  const [highPriorityRisks, setHighPriorityRisks] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add a ref to track if data is already fetched to prevent duplicate calls
  const dataFetchedRef = useRef(false);
  // Add a cache timeout ref to control when we should refresh data
  const lastFetchTimeRef = useRef(0);
  // Cache timeout in milliseconds (5 minutes)
  const CACHE_TIMEOUT = 5 * 60 * 1000;

  useEffect(() => {
    const checkSession = async () => {
      try {
        await verifySession();
      } catch (err) {
        console.error(err);
      } finally {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, [verifySession]);

  useEffect(() => {
    if (sessionChecked && !loading) {
      if (!session) {
        router.push("/login");
      } else if (user) {
        if (user.prefs?.role === "admin") {
          router.push("/admin/users");
        } else if (userId !== user.$id) {
          router.push(`/dashboard/${user.$id}`);
        }
      }
    }
  }, [sessionChecked, loading, session, user, router, userId]);

  const fetchRisks = useCallback(
    async (showRefreshIndicator = false, forceRefresh = false) => {
      // Check if data was recently fetched and we don't need to refresh
      const now = Date.now();
      if (
        !forceRefresh &&
        dataFetchedRef.current &&
        now - lastFetchTimeRef.current < CACHE_TIMEOUT &&
        !showRefreshIndicator
      ) {
        return; // Use cached data if it's recent enough
      }

      if (showRefreshIndicator) setIsRefreshing(true);
      setFetchError(null);

      try {
        const response = await databases.listDocuments(db, riskCollection);
        const fetchedRisks: Risk[] = response.documents.map((doc) => ({
          $id: doc.$id,
          title: doc.title,
          content: doc.content,
          authorId: doc.authorId,
          tags: doc.tags || [],
          attachmentId: doc.attachmentId,
          impact: doc.impact,
          probability: doc.probability,
          action: doc.action,
          department: doc.department,
          created: doc.created,
          updated: doc.updated,
          isConfidential: doc.isConfidential ?? false,
          authorizedViewers: doc.authorizedViewers ?? [],
          // The author name is already provided by the API, or we use a fallback value
          authorName: doc.authorName || "Unknown",
          riskTitle: doc.title || "Untitled Risk",
          mitigation: doc.mitigation || "No mitigation provided",
          status: doc.status || "Pending",
          dueDate: doc.dueDate,
        }));

        let risksToSet = fetchedRisks;
        if (user && user.prefs?.role !== "admin") {
          risksToSet = fetchedRisks.filter(
            (risk) => risk.department === user.prefs.department
          );
        }
        setRisks(risksToSet);

        // Calculate impact counts
        const impactCounts = risksToSet.reduce(
          (acc: ImpactCount, risk) => {
            acc[risk.impact as keyof ImpactCount] += 1;
            return acc;
          },
          { low: 0, medium: 0, high: 0 }
        );
        setImpactCount(impactCounts);

        // Calculate action counts
        const actionCounts = risksToSet.reduce(
          (acc: ActionCount, risk) => {
            acc[risk.action as keyof ActionCount] += 1;
            return acc;
          },
          { mitigate: 0, accept: 0, transfer: 0, avoid: 0 }
        );
        setActionCount(actionCounts);

        // Calculate due risks
        const nowDate = new Date();
        const dueSoonCount = risksToSet.filter((risk) => {
          if (!risk.dueDate) return false;
          const dueDate = new Date(risk.dueDate);
          const weekFromNow = new Date();
          weekFromNow.setDate(nowDate.getDate() + 7);
          return (
            dueDate <= weekFromNow &&
            dueDate >= nowDate &&
            risk.status !== "closed"
          );
        }).length;
        setDueRisks(dueSoonCount);

        // Calculate high priority risks
        const highPriorityCount = risksToSet.filter((risk) => {
          return (
            risk.impact === "high" &&
            risk.probability >= 4 &&
            risk.status !== "closed"
          );
        }).length;
        setHighPriorityRisks(highPriorityCount);

        // After successfully fetching data, update our refs
        dataFetchedRef.current = true;
        lastFetchTimeRef.current = now;

        if (showRefreshIndicator) {
          toast.success("Data refreshed!");
        }
      } catch (err) {
        setFetchError("Failed to fetch risks");
        console.error(err);
        toast.error("Failed to refresh data");
      } finally {
        if (showRefreshIndicator) {
          setTimeout(() => setIsRefreshing(false), 1000);
        }
      }
    },
    [user, CACHE_TIMEOUT] // Removed authorNames and fetchAllAuthorNames dependencies
  );

  useEffect(() => {
    if (session && !dataFetchedRef.current) {
      fetchRisks(false, true); // Only fetch on initial load
    }
  }, [session, fetchRisks]);

  const handleRiskCreated = () => {
    setShowCreateRisk(false);
    fetchRisks(false, true); // Force refresh after creating a risk
    toast.success("Risk created successfully!");
  };

  if (loading || !sessionChecked) {
    return <DashboardSkeleton />;
  }

  if (error || fetchError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800"
      >
        <div className="text-center max-w-md mx-auto px-4">
          <LucideAlertTriangle className="mx-auto mb-4 text-red-500 w-16 h-16" />
          <p className="text-red-500 text-xl font-medium">
            {error?.message || fetchError}
          </p>
          <p className="text-gray-500 mt-2 mb-4">
            We encountered an error while loading your dashboard. Please try
            again.
          </p>
          <Button
            onClick={() => verifySession()}
            variant="default"
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  const totalRisks = risks.length;

  return (
    <div className="bg-gray-50 w-full">
      {/* Main content - added pt-16 for proper header spacing */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name?.split(" ")[0] || "User"}
            </h2>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRisks(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5"
            >
              <LucideRefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>

            <Button
              onClick={() => setShowCreateRisk((prev) => !prev)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              {showCreateRisk ? "Cancel" : "Create New Risk"}
            </Button>
          </div>
        </div>

        {/* Create risk form */}
        {showCreateRisk && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
          >
            <CreateRisk onRiskCreated={handleRiskCreated} />
          </motion.div>
        )}

        {/* Search bar */}
        <div className="mb-6">
          <SearchRisk risks={risks} />
        </div>

        {/* Dashboard tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="mb-6 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="risks"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md"
            >
              Risk List
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Total Risks
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {totalRisks}
                      </p>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                      <LucideFileCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-medium text-gray-500">
                    {risks.filter((r) => r.authorId === userId).length} created
                    by you
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        High Impact Risks
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {impactCount.high}
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                      <LucideAlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-medium">
                    <span
                      className={
                        highPriorityRisks > 0 ? "text-red-500" : "text-gray-500"
                      }
                    >
                      {highPriorityRisks} high priority risks need attention
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Due Soon
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {dueRisks}
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                      <LucideCalendarClock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-medium text-gray-500">
                    Risks due in the next 7 days
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Department
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {user?.prefs?.department || "General"}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <LucideBarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-medium text-gray-500">
                    {user?.prefs?.role || "User"} access level
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ImpactDistribution data={impactCount} />
              <RiskActivityGraph data={actionCount} />
            </div>

            {/* Recent risks */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Recent Risks</CardTitle>
                <CardDescription>
                  Your most recently added or updated risks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {risks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      No risks found. Create your first risk to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {risks
                      .sort(
                        (a, b) =>
                          new Date(b.updated).getTime() -
                          new Date(a.updated).getTime()
                      )
                      .slice(0, 5)
                      .map((risk) => (
                        <div
                          key={risk.$id}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/risk/${risk.$id}`)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 mt-2 rounded-full ${
                                risk.impact === "high"
                                  ? "bg-red-500"
                                  : risk.impact === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {risk.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {risk.content.substring(0, 60)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                risk.status === "active"
                                  ? "bg-blue-100 text-blue-800"
                                  : risk.status === "closed"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {risk.status || "Pending"}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {new Date(risk.updated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  className="text-indigo-600"
                  onClick={() => {
                    const element = document.querySelector('[value="risks"]');
                    if (element instanceof HTMLElement) {
                      element.click();
                    }
                  }}
                >
                  View All Risks
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <RiskList userId={userId} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                  <CardDescription>
                    Comprehensive view of your risk portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Impact Distribution
                      </h3>
                      <ImpactDistribution data={impactCount} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Risk Response Strategies
                      </h3>
                      <RiskActivityGraph data={actionCount} />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">
                      Risk Status Overview
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                              {
                                risks.filter((r) => r.status === "active")
                                  .length
                              }
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Active Risks
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                              {
                                risks.filter((r) => r.status === "closed")
                                  .length
                              }
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Closed Risks
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                              {dueRisks}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Due Soon
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
