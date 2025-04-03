import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Paperclip,
  Clock,
  User,
  AlertCircle,
  Calendar,
  CheckCircle,
  XCircle,
  Reply,
  Bell,
  AlertTriangle,
  Tag,
  Info,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useViewedItemsStore } from "@/store/ViewedItems";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

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
  commentCount?: number;
  reminderCount?: number;
}

const getImpactColor = (impact: "low" | "medium" | "high") => {
  switch (impact) {
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getActionColor = (
  action: "mitigate" | "accept" | "transfer" | "avoid"
) => {
  switch (action) {
    case "mitigate":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "accept":
      return "bg-green-100 text-green-800 border-green-200";
    case "transfer":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "avoid":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getActionIcon = (
  action: "mitigate" | "accept" | "transfer" | "avoid"
) => {
  switch (action) {
    case "mitigate":
      return <AlertTriangle className="w-3 h-3" />;
    case "accept":
      return <CheckCircle className="w-3 h-3" />;
    case "transfer":
      return <FileText className="w-3 h-3" />;
    case "avoid":
      return <XCircle className="w-3 h-3" />;
    default:
      return null;
  }
};

const getProbabilityColor = (probability: number) => {
  if (probability >= 4) {
    return "bg-red-100 text-red-800 border-red-200";
  } else if (probability >= 2) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
  return "bg-green-100 text-green-800 border-green-200";
};

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <AlertCircle className="w-3 h-3" />;
    case "closed":
      return <XCircle className="w-3 h-3" />;
    case "resolved":
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};

const isDueSoon = (dueDate?: string) => {
  if (!dueDate) return false;
  try {
    const today = new Date();
    const due = new Date(dueDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return isAfter(due, today) && !isAfter(due, sevenDaysFromNow);
  } catch {
    return false;
  }
};

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false;
  try {
    return isAfter(new Date(), new Date(dueDate));
  } catch {
    return false;
  }
};

const RiskCardSkeleton = () => (
  <Card className="w-full bg-white border border-gray-200">
    <CardHeader className="pb-2 space-y-2">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </CardContent>
    <CardFooter>
      <div className="grid grid-cols-2 gap-4 w-full">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-28" />
      </div>
    </CardFooter>
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
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    getNewCommentsCount,
    getNewRemindersCount,
    markCommentsViewed,
    markRemindersViewed,
  } = useViewedItemsStore();

  useEffect(() => {
    subscribeToRisk(riskId);
    return () => unsubscribeFromRisk();
  }, [riskId, subscribeToRisk, unsubscribeFromRisk]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.tagName === "BUTTON" ||
        e.target.closest("button") ||
        e.target.tagName === "A" ||
        e.target.closest("a"))
    ) {
      return;
    }

    if (!currentUserId) return;

    if (props.commentCount) {
      markCommentsViewed(currentUserId, riskId, props.commentCount);
    }

    if (props.reminderCount) {
      markRemindersViewed(currentUserId, riskId, props.reminderCount);
    }

    setIsExpanded(!isExpanded);
  };

  if (loading) return <RiskCardSkeleton />;
  if (error) return <ErrorState error={error} />;

  const isRiskCreator = currentUserId === props.authorId;
  const status = props.status || "active";

  const newCommentsCount =
    currentUserId && props.commentCount
      ? getNewCommentsCount(currentUserId, riskId, props.commentCount)
      : 0;

  const newRemindersCount =
    currentUserId && props.reminderCount
      ? getNewRemindersCount(currentUserId, riskId, props.reminderCount)
      : 0;

  const handleCloseRisk = async () => {
    await closeRisk(riskId, resolution);
    setIsCloseDialogOpen(false);
  };

  const actionStrategy = {
    mitigate: props.mitigation,
    accept: props.acceptance,
    transfer: props.transfer,
    avoid: props.avoidance,
  };

  const actionTitle = {
    mitigate: "Mitigation Strategy",
    accept: "Acceptance Rationale",
    transfer: "Transfer Mechanism",
    avoid: "Avoidance Approach",
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={cn(
            "w-full bg-white hover:shadow-lg transition-shadow duration-200 border",
            props.isConfidential ? "border-red-200" : "border-gray-200",
            isOverdue(props.dueDate) && status === "active"
              ? "border-l-4 border-l-red-500"
              : "",
            isDueSoon(props.dueDate) && status === "active"
              ? "border-l-4 border-l-yellow-500"
              : "",
            status === "resolved" ? "bg-green-50" : "",
            status === "closed" ? "bg-gray-50" : ""
          )}
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Link
                  href={`/risk/${riskId}`}
                  key={riskId}
                  className="hover:text-blue-500 hover:underline"
                >
                  {props.title}
                </Link>
                {props.isConfidential && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center text-red-500">
                        <Info className="w-4 h-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Confidential Risk</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardTitle>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getStatusColor(status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(status)}
                    {status}
                  </span>
                </Badge>

                {newCommentsCount > 0 && (
                  <Badge
                    className="bg-indigo-500 text-white hover:bg-indigo-600 flex items-center gap-1"
                    variant="default"
                  >
                    <Reply className="w-3 h-3" />
                    {newCommentsCount}
                  </Badge>
                )}

                {newRemindersCount > 0 && isRiskCreator && (
                  <Badge
                    className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                    variant="default"
                  >
                    <Bell className="w-3 h-3" />
                    {newRemindersCount}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={getImpactColor(props.impact)}>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {props.impact} impact
                </span>
              </Badge>

              <Badge variant="outline" className={getActionColor(props.action)}>
                <span className="flex items-center gap-1">
                  {getActionIcon(props.action)}
                  {props.action}
                </span>
              </Badge>

              <Badge
                variant="outline"
                className={getProbabilityColor(props.probability)}
              >
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {props.probability * 20}% probability
                </span>
              </Badge>

              {props.dueDate && (
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue(props.dueDate)
                      ? "bg-red-100 text-red-800 border-red-200"
                      : isDueSoon(props.dueDate)
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  )}
                >
                  <Calendar className="w-3 h-3" />
                  Due: {formatDate(props.dueDate)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className={cn("text-gray-700", !isExpanded && "line-clamp-2")}>
              {props.content}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  {actionStrategy[props.action] && (
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        {getActionIcon(props.action)}
                        <span className="ml-2">
                          {actionTitle[props.action]}:
                        </span>
                      </h4>
                      <ReactMarkdown>
                        {actionStrategy[props.action]}
                      </ReactMarkdown>
                    </div>
                  )}

                  {props.resolution && (
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Resolution
                      </h4>
                      <p className="mt-1 text-gray-600">{props.resolution}</p>
                    </div>
                  )}

                  {props.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <Tag className="w-4 h-4 text-gray-500" />
                      {props.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{props.authorName}</span>
                    </div>

                    {props.attachmentId && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span>Attachment</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Created: {formatDate(props.created)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Updated: {formatDate(props.updated)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-between gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Show less" : "Show more"}
            >
              {isExpanded ? "Show less" : "Show more"}
            </Button>

            <div className="flex items-center gap-2">
              {onSetReminder && isRiskCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetReminder();
                  }}
                >
                  <Bell className="w-4 h-4" />
                  Reminder
                </Button>
              )}

              {status === "active" && isRiskCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCloseDialogOpen(true);
                  }}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Close
                </Button>
              )}
            </div>
          </CardFooter>
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
    </TooltipProvider>
  );
};

export default RiskCard;
