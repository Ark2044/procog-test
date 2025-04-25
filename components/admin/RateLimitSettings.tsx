import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaSync, FaExclamationTriangle } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/Auth";

const RateLimitSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<boolean>(false);
  const { user } = useAuthStore();

  // Check if user is admin
  const isAdmin = user && user.prefs?.role === "admin";

  // Fetch the current rate limit status
  const fetchRateLimitStatus = async () => {
    try {
      setIsLoading(true);
      setAuthError(false);

      const response = await fetch("/api/admin/rateLimit", {
        credentials: "include", // Include cookies in the request
      });

      if (response.status === 401) {
        setAuthError(true);
        toast.error("Authentication failed. Admin access required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch rate limit status");
      }

      const data = await response.json();
      setIsEnabled(data.enabled);
    } catch (error) {
      console.error("Error fetching rate limit status:", error);
      toast.error("Failed to load rate limit settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle rate limit status
  const toggleRateLimit = async () => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/admin/rateLimit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({ enabled: !isEnabled }),
      });

      if (response.status === 401) {
        setAuthError(true);
        toast.error("Authentication failed. Admin access required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update rate limit status");
      }

      const data = await response.json();
      setIsEnabled(data.enabled);
      toast.success(data.message || "Rate limit settings updated");
    } catch (error) {
      console.error("Error updating rate limit status:", error);
      toast.error("Failed to update rate limit settings");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is already authenticated as admin
    if (isAdmin) {
      fetchRateLimitStatus();
    } else {
      setIsLoading(false);
      setAuthError(true);
    }
  }, [isAdmin]);

  if (authError) {
    return (
      <Card className="p-4 mb-6 border border-red-200 bg-red-50">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              Authentication Error
            </h3>
            <p className="text-sm text-gray-600">
              Admin privileges are required to manage rate limiting settings.
              Please log in with an admin account.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 border border-blue-200 bg-blue-50">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <FaShieldAlt className="mr-2 text-blue-600" />
            Rate Limit Protection
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isEnabled
              ? "Rate limiting is active: API requests, comments, and risk analyses are limited to prevent abuse."
              : "Rate limiting is disabled: No restrictions on API requests, comments, or risk analyses."}
          </p>
        </div>
        <div className="flex items-center mt-4 sm:mt-0">
          <Button
            onClick={toggleRateLimit}
            disabled={isLoading || isUpdating}
            variant={isEnabled ? "destructive" : "default"}
            className={
              isEnabled
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {isLoading || isUpdating ? (
              <FaSync className="animate-spin mr-2" />
            ) : null}
            {isLoading
              ? "Loading..."
              : isUpdating
              ? "Updating..."
              : isEnabled
              ? "Disable Rate Limiting"
              : "Enable Rate Limiting"}
          </Button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <strong>Note:</strong> Disabling rate limiting may expose the system to
        potential abuse, but can be useful during high-traffic events or when
        testing the API.
      </div>
    </Card>
  );
};

export default RateLimitSettings;
