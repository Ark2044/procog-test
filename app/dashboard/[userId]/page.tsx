"use client";
import { useEffect, useState} from "react";
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
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-700 rounded w-64"></div>
      <div className="h-8 bg-gray-700 rounded w-48"></div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { userId } = useParams();
  const userIdString = Array.isArray(userId) ? userId[0] : userId;
  const router = useRouter();
  const { user, loading, error, verifySession, session } = useAuthStore();
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

  useEffect(() => {
    if (!session) {
      verifySession();
    }
  }, [session, verifySession]);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  const fetchRisks = async (showRefreshIndicator = false) => {
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
        created: doc.created,
        updated: doc.updated,
      }));
      setRisks(fetchedRisks);

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
    } catch (err) {
      setFetchError("Failed to fetch risks");
      console.error(err);
    } finally {
      if (showRefreshIndicator) {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  useEffect(() => {
    if (session) {
      fetchRisks();
    }
  }, [session]);

  const handleRiskCreated = () => {
    setShowCreateRisk(false);
    fetchRisks();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || fetchError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gray-900 text-white"
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-white pt-16"
    >
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <div className="flex items-center mb-2">
              <LucideUser className="mr-2 text-blue-400 w-5 h-5" />
              <p className="text-sm font-medium text-white">
                {user?.name || "User"}
              </p>
            </div>
            <p className="text-xs text-gray-400">ID: {userIdString}</p>
          </div>
          <button
            onClick={() => fetchRisks(true)}
            className={`text-gray-400 hover:text-white ${
              isRefreshing ? "animate-spin" : ""
            }`}
          >
            <LucideRefreshCw />
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="p-6 space-y-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-700 p-4 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-300">Total Risks</p>
                <p className="text-2xl font-semibold text-white">
                  {totalRisks}
                </p>
              </div>
              <LucideCheckCircle className="text-green-400 w-8 h-8" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-700 p-4 rounded-lg shadow-md"
          >
            <h3 className="text-xs font-semibold text-gray-400 uppercase flex items-center">
              <LucideAlertTriangle className="mr-1 text-yellow-400" /> Impact
              Distribution
            </h3>
            {["high", "medium", "low"].map((level) => (
              <div className="flex justify-between items-center" key={level}>
                <span className="text-sm text-gray-300">
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    level === "high"
                      ? "text-red-400"
                      : level === "medium"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {impactCount[level as keyof ImpactCount]}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Risk Dashboard</h2>
          <button
            onClick={() => setShowCreateRisk((prev) => !prev)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showCreateRisk ? "Cancel" : "Create Risk"}
          </button>
        </div>

        {showCreateRisk && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <CreateRisk onRiskCreated={handleRiskCreated} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(actionCount).map(([action, count]) => {
            const iconMap = {
              mitigate: <LucideCheckCircle className="mr-3 text-green-400" />,
              accept: <LucideHandHeart className="mr-3 text-yellow-400" />,
              transfer: <LucideShare2 className="mr-3 text-blue-400" />,
              avoid: <LucideXCircle className="mr-3 text-red-400" />,
            };

            return (
              <motion.div
                key={action}
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md"
              >
                {iconMap[action as keyof ActionCount]}
                <div>
                  <p className="text-sm text-gray-300">
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </p>
                  <p className="text-xl font-semibold text-white">{count}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <RiskList userId={userIdString} />
      </div>
    </motion.div>
  );
};

export default Dashboard;
