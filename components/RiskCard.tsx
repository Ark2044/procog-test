import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Paperclip,
  Clock,
  User,
  AlertCircle,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaLock } from "react-icons/fa";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRiskStore } from "@/store/Risk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RiskCardProps {
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
  onSetReminder?: () => void;
  currentUserId?: string;
  riskId: string;
  dueDate?: string;
  status?: "active" | "closed" | "resolved";
  resolution?: string;
}

const getImpactColor = (impact: "low" | "medium" | "high") => {
  switch (impact) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getActionColor = (
  action: "mitigate" | "accept" | "transfer" | "avoid"
) => {
  switch (action) {
    case "mitigate":
      return "bg-blue-100 text-blue-800";
    case "accept":
      return "bg-green-100 text-green-800";
    case "transfer":
      return "bg-purple-100 text-purple-800";
    case "avoid":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getProbabilityColor = (probability: number) => {
  if (probability >= 4) {
    return "bg-red-100 text-red-800";
  } else if (probability >= 2) {
    return "bg-yellow-100 text-yellow-800";
  }
  return "bg-green-100 text-green-800";
};

const RiskCardSkeleton = () => (
  <Card className="w-full bg-white border border-gray-200">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-20 w-full mb-4" />
      <Skeleton className="h-16 w-full mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
      </div>
    </CardContent>
  </Card>
);

const ErrorState = ({ error }: { error: string }) => (
  <Card className="w-full bg-red-50 border border-red-200">
    <CardContent className="flex items-center justify-center py-8">
      <AlertCircle className="text-red-500 w-6 h-6 mr-2" />
      <span className="text-red-700">{error}</span>
    </CardContent>
  </Card>
);

const RiskCard: React.FC<RiskCardProps> = ({
  riskId,
  currentUserId,
  onSetReminder,
  ...props
}) => {
  const { loading, error, subscribeToRisk, unsubscribeFromRisk, closeRisk } =
    useRiskStore();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    subscribeToRisk(riskId);
    return () => unsubscribeFromRisk();
  }, [riskId, subscribeToRisk, unsubscribeFromRisk]);

  if (loading) return <RiskCardSkeleton />;
  if (error) return <ErrorState error={error} />;

  const isRiskCreator = currentUserId === props.authorId;
  const status = props.status || "active";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const handleCloseRisk = async () => {
    await closeRisk(riskId, resolution);
    setIsCloseDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full bg-white hover:shadow-lg transition-shadow duration-200 border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {props.title}
              {props.isConfidential && (
                <FaLock className="text-red-500" title="Confidential Risk" />
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className={getImpactColor(props.impact)}>
                {props.impact} impact
              </Badge>
              <Badge variant="outline" className={getActionColor(props.action)}>
                {props.action}
              </Badge>
              <Badge
                variant="outline"
                className={getProbabilityColor(props.probability)}
              >
                Probability: {props.probability * 20}%
              </Badge>
              <Badge variant="outline" className={getStatusColor(status)}>
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{props.content}</p>

          {props.action === "mitigate" && props.mitigation && (
            <div className="mb-4">
              <strong className="text-gray-800">Mitigation Strategy:</strong>
              <p className="text-gray-700">{props.mitigation}</p>
            </div>
          )}

          {props.action === "accept" && props.acceptance && (
            <div className="mb-4">
              <strong className="text-gray-800">Acceptance Rationale:</strong>
              <p className="text-gray-700">{props.acceptance}</p>
            </div>
          )}

          {props.action === "transfer" && props.transfer && (
            <div className="mb-4">
              <strong className="text-gray-800">Transfer Mechanism:</strong>
              <p className="text-gray-700">{props.transfer}</p>
            </div>
          )}

          {props.action === "avoid" && props.avoidance && (
            <div className="mb-4">
              <strong className="text-gray-800">Avoidance Approach:</strong>
              <p className="text-gray-700">{props.avoidance}</p>
            </div>
          )}

          <AnimatePresence>
            <div className="flex flex-wrap gap-1 mb-4">
              {props.tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-200 text-gray-800"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{props.authorName}</span>
            </div>

            <div className="flex items-center gap-1">
              {props.attachmentId && (
                <>
                  <Paperclip className="w-4 h-4" />
                  <span>Attachment</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                Created: {new Date(props.created).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                Updated: {new Date(props.updated).toLocaleDateString()}
              </span>
            </div>

            {props.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-500" />
                <span className="text-red-600">
                  Due: {new Date(props.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {onSetReminder && isRiskCreator && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  onSetReminder();
                }}
              >
                <Bell className="w-4 h-4" />
                Set Reminder
              </Button>
            )}
          </div>

          {status === "active" && isRiskCreator && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={() => setIsCloseDialogOpen(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Close Risk
              </Button>
            </div>
          )}

          {props.resolution && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="font-medium text-gray-700 flex items-center">
                <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                Resolution
              </h4>
              <p className="mt-1 text-gray-600">{props.resolution}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Risk</DialogTitle>
            <DialogDescription>
              Provide a resolution summary for this risk. This will mark the
              risk as closed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe how this risk was addressed..."
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCloseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCloseRisk}>Close Risk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default RiskCard;
