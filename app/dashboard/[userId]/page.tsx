"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/Auth";
import { Risk } from "@/types/Risk";
import RiskList from "@/components/RiskList";
import CreateRisk from "@/components/CreateRisk";
import { databases } from "@/models/client/config";
import { riskCollection, db } from "@/models/name";
import {
  FaUser,
  FaExclamationCircle,
  FaHandHolding,
  FaCheckCircle,
  FaShareAlt,
  FaBan,
} from "react-icons/fa"; // Importing icons

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

const Dashboard = () => {
  const { userId } = useParams();
  const userIdString = Array.isArray(userId) ? userId[0] : userId;
  const router = useRouter();
  const { user, loading, error, verifySession, session } = useAuthStore();
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

  const fetchRisks = async () => {
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500">{error?.message || fetchError}</p>
      </div>
    );
  }

  const totalRisks = risks.length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <p className="flex items-center text-sm font-medium text-gray-900">
              <FaUser className="mr-2 text-blue-600" />
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500">ID: {userIdString}</p>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center">
                <FaExclamationCircle className="mr-1 text-blue-600" /> Overview
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Total Risks</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalRisks}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center">
                <FaExclamationCircle className="mr-1 text-red-600" /> Impact
                Distribution
              </h3>
              <div className="space-y-2">
                {["high", "medium", "low"].map((level) => (
                  <div
                    className="flex justify-between items-center"
                    key={level}
                  >
                    <span className="text-sm text-gray-600">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        level === "high"
                          ? "text-red-600"
                          : level === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {impactCount[level as keyof ImpactCount]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Risk Dashboard
          </h2>
          <button
            onClick={() => setShowCreateRisk((prev) => !prev)}
            className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {showCreateRisk ? "Cancel" : "Create Risk"}
          </button>
        </div>

        {showCreateRisk && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
            <CreateRisk onRiskCreated={handleRiskCreated} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(actionCount).map(([action, count]) => {
            const iconMap = {
              mitigate: <FaCheckCircle className="mr-3 text-green-600" />,
              accept: <FaHandHolding className="mr-3 text-yellow-600" />,
              transfer: <FaShareAlt className="mr-3 text-blue-600" />,
              avoid: <FaBan className="mr-3 text-red-600" />,
            };

            return (
              <div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex items-center"
                key={action}
              >
                {iconMap[action as keyof ActionCount]}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <RiskList userId={userIdString} />
      </div>
    </div>
  );
};

export default Dashboard;
