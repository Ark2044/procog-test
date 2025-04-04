"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/Auth";
import { Risk } from "@/types/Risk";
import RiskList from "@/components/RiskList";
import CreateRisk from "@/components/CreateRisk";
import { databases } from "@/models/client/config";
import { riskCollection, db } from "@/models/name";
import {
  LucideUser,
  LucideAlertTriangle,
  LucideHandHeart,
  LucideCheckCircle,
  LucideShare2,
  LucideXCircle,
  LucideRefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { account } from "@/models/client/config";

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

const DashboardSkeleton = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800">
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-200 rounded w-64"></div>
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

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
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});

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
    async (showRefreshIndicator = false) => {
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
          authorName: authorNames[doc.authorId] || "Unknown", // Add authorName
          riskTitle: doc.title || "Untitled Risk", // Add riskTitle
          mitigation: doc.mitigation || "No mitigation provided", // Add mitigation
          status: doc.status || "Pending", // Add status
        }));

        let risksToSet = fetchedRisks;
        if (user && user.prefs?.role !== "admin") {
          risksToSet = fetchedRisks.filter(
            (risk) => risk.department === user.prefs.department
          );
        }
        setRisks(risksToSet);

        const impactCounts = fetchedRisks.reduce(
          (acc: ImpactCount, risk) => {
            acc[risk.impact as keyof ImpactCount] =
              (acc[risk.impact as keyof ImpactCount] || 0) + 1;
            return acc;
          },
          { low: 0, medium: 0, high: 0 }
        );
        setImpactCount(impactCounts);

        const actionCounts = fetchedRisks.reduce(
          (acc: ActionCount, risk) => {
            acc[risk.action as keyof ActionCount] =
              (acc[risk.action as keyof ActionCount] || 0) + 1;
            return acc;
          },
          { mitigate: 0, accept: 0, transfer: 0, avoid: 0 }
        );
        setActionCount(actionCounts);

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
    [authorNames, user]
  );

  const fetchAuthorName = useCallback(
    async (authorId: string) => {
      if (authorNames[authorId]) return authorNames[authorId];
      try {
        const authorUser = await account.get();
        setAuthorNames((prev) => ({ ...prev, [authorId]: authorUser.name }));
        return authorUser.name;
      } catch (error) {
        console.error("Error fetching author name:", error);
        return authorId;
      }
    },
    [authorNames]
  );

  useEffect(() => {
    if (session) {
      fetchRisks();
    }
  }, [session, fetchRisks]);

  useEffect(() => {
    const fetchAllAuthorNames = async () => {
      const uniqueAuthorIds = [...new Set(risks.map((risk) => risk.authorId))];
      await Promise.all(uniqueAuthorIds.map(fetchAuthorName));
    };

    if (risks.length > 0) {
      fetchAllAuthorNames();
    }
  }, [fetchAuthorName, risks]);

  const handleRiskCreated = () => {
    setShowCreateRisk(false);
    fetchRisks();
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
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800"
      >
        <div className="text-center">
          <LucideAlertTriangle className="mx-auto mb-4 text-red-500 w-16 h-16" />
          <p className="text-red-500 text-xl">{error?.message || fetchError}</p>
          <button
            onClick={() => verifySession()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  const totalRisks = risks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 pt-16 sm:pt-20">
      {/* Main grid layout */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-0">
        {/* Sidebar */}
        <aside className="bg-white border-b lg:border-r border-gray-200 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-20 lg:overflow-y-auto">
          {/* User profile section */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="overflow-hidden">
              <div className="flex items-center mb-1 sm:mb-2">
                <LucideUser className="mr-2 text-blue-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.name || "User"}
                </p>
              </div>
              <p className="text-xs text-gray-500 truncate">ID: {userId}</p>
              <p className="text-xs text-gray-500 truncate">
                Department: {user?.prefs?.department}
              </p>
            </div>
            <button
              onClick={() => fetchRisks(true)}
              disabled={isRefreshing}
              className={`text-gray-500 hover:text-gray-800 p-2 flex-shrink-0 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              aria-label="Refresh data"
            >
              <LucideRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Stats section */}
          <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Total risks card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-200 w-full"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Total Risks
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-800">
                    {totalRisks}
                  </p>
                </div>
                <LucideCheckCircle className="text-green-500 w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </motion.div>

            {/* Impact distribution card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-200 w-full"
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center mb-2">
                <LucideAlertTriangle className="mr-1 text-yellow-500 w-3 h-3 sm:w-4 sm:h-4" />
                Impact Distribution
              </h3>
              {["high", "medium", "low"].map((level) => (
                <div
                  className="flex justify-between items-center py-0.5"
                  key={level}
                >
                  <span className="text-xs sm:text-sm text-gray-600">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      level === "high"
                        ? "text-red-500"
                        : level === "medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {impactCount[level as keyof ImpactCount]}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </aside>

        {/* Main content */}
        <main className="p-3 sm:p-4 md:p-6 pb-16">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
              Risk Dashboard
            </h2>
            <button
              onClick={() => setShowCreateRisk((prev) => !prev)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full sm:w-auto text-sm"
            >
              {showCreateRisk ? "Cancel" : "Create Risk"}
            </button>
          </div>

          {/* Create risk form */}
          {showCreateRisk && (
            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow border border-gray-200 overflow-x-auto">
              <CreateRisk onRiskCreated={handleRiskCreated} />
            </div>
          )}

          {/* Action count cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            {Object.entries(actionCount).map(([action, count]) => {
              const iconMap = {
                mitigate: (
                  <LucideCheckCircle className="mr-2 sm:mr-3 text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
                ),
                accept: (
                  <LucideHandHeart className="mr-2 sm:mr-3 text-yellow-500 w-4 h-4 sm:w-5 sm:h-5" />
                ),
                transfer: (
                  <LucideShare2 className="mr-2 sm:mr-3 text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                ),
                avoid: (
                  <LucideXCircle className="mr-2 sm:mr-3 text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
                ),
              };

              return (
                <motion.div
                  key={action}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow border border-gray-200"
                >
                  {iconMap[action as keyof ActionCount]}
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                      {count}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Risk list */}
          <RiskList userId={userId} />
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
