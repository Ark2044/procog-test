import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
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
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
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
import { format, isAfter, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  generateRiskReportHTML,
  downloadRiskReportAsPDF,
} from "@/utils/reportGenerator";

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
  status?: "active" | "closed";
  resolution?: string;
  commentCount?: number;
  reminderCount?: number;
  onAnalyze?: () => void;
  department?: string;
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

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};

const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Unknown time";
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

const getDueStatusText = (dueDate?: string) => {
  if (!dueDate) return "";
  if (isOverdue(dueDate)) return "Overdue";
  if (isDueSoon(dueDate)) return "Due soon";
  return "Upcoming";
};

const getDueStatusColor = (dueDate?: string) => {
  if (!dueDate) return "";
  if (isOverdue(dueDate)) return "text-red-600";
  if (isDueSoon(dueDate)) return "text-yellow-600";
  return "text-blue-600";
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
  onAnalyze,
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

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentUserId) {
      if (props.commentCount) {
        markCommentsViewed(currentUserId, riskId, props.commentCount);
      }

      if (props.reminderCount) {
        markRemindersViewed(currentUserId, riskId, props.reminderCount);
      }
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

  const handleDownloadReport = () => {
    // Determine which action strategy to use
    const actionStrategy = {
      mitigate: props.mitigation,
      accept: props.acceptance,
      transfer: props.transfer,
      avoid: props.avoidance,
    }[props.action];

    // Prepare data for the report
    const reportData = {
      riskId,
      title: props.title,
      content: props.content,
      authorName: props.authorName,
      impact: props.impact,
      probability: props.probability,
      action: props.action,
      actionDetails: actionStrategy,
      tags: props.tags || [],
      created: props.created,
      closed: props.updated, // Using updated date as the closed date
      resolution: props.resolution || "",
      department: props.department,
      attachmentId: props.attachmentId,
    };

    // Generate HTML report
    const reportHTML = generateRiskReportHTML(reportData);

    // Download as PDF
    downloadRiskReportAsPDF(reportHTML, `risk-report-${riskId}.pdf`);
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

  const riskImpactPriority =
    {
      high: 3,
      medium: 2,
      low: 1,
    }[props.impact] || 0;

  const riskPriority = riskImpactPriority * props.probability;
  const priorityLabel =
    riskPriority >= 10
      ? "Critical"
      : riskPriority >= 6
      ? "High"
      : riskPriority >= 3
      ? "Medium"
      : "Low";

  const priorityColor =
    riskPriority >= 10
      ? "text-red-600 bg-red-50 border-red-200"
      : riskPriority >= 6
      ? "text-orange-600 bg-orange-50 border-orange-200"
      : riskPriority >= 3
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-green-600 bg-green-50 border-green-200";

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Card
          className={cn(
            "w-full bg-white hover:shadow-md transition-all duration-300 border relative overflow-hidden group-hover:border-gray-300",
            props.isConfidential ? "border-red-200" : "border-gray-200",
            isOverdue(props.dueDate) && status === "active"
              ? "border-l-4 border-l-red-500"
              : "",
            isDueSoon(props.dueDate) && status === "active"
              ? "border-l-4 border-l-yellow-500"
              : "",
            status === "closed" ? "bg-gray-50" : ""
          )}
        >
          <div className="absolute top-0 right-0 flex">
            {status !== "active" && (
              <div className="py-1 px-3 text-xs font-medium bg-gray-500 text-white">
                Closed
              </div>
            )}
            {props.isConfidential && (
              <div className="bg-red-500 text-white py-1 px-3 text-xs font-medium">
                Confidential
              </div>
            )}
          </div>

          <CardHeader className="pb-1 pt-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2 group/link">
                  <Link
                    href={`/risk/${riskId}`}
                    className="hover:text-blue-600 hover:underline flex items-center group-hover/link:text-blue-600 transition-colors duration-200"
                  >
                    {props.title}
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </Link>
                </CardTitle>

                <CardDescription className="mt-1 text-sm text-gray-500 flex flex-wrap items-center">
                  <span className="inline-flex items-center mr-3">
                    <User className="w-3 h-3 mr-1" />
                    {props.authorName}
                  </span>
                  <span className="inline-flex items-center mr-3">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(props.created)}
                  </span>
                  {props.dueDate && status === "active" && (
                    <span
                      className={`inline-flex items-center ${getDueStatusColor(
                        props.dueDate
                      )}`}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      <span className="font-medium">
                        {getDueStatusText(props.dueDate)}:
                      </span>{" "}
                      {formatDate(props.dueDate)}
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={cn("font-medium", priorityColor)}>
                  {priorityLabel} Priority
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="flex flex-wrap gap-2 mb-3">
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

              {newCommentsCount > 0 && (
                <Badge
                  className="bg-indigo-500 text-white hover:bg-indigo-600 flex items-center gap-1"
                  variant="default"
                >
                  <Reply className="w-3 h-3" />
                  {newCommentsCount} new
                </Badge>
              )}

              {newRemindersCount > 0 && isRiskCreator && (
                <Badge
                  className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                  variant="default"
                >
                  <Bell className="w-3 h-3" />
                  {newRemindersCount} new
                </Badge>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-md border border-gray-100 mb-3 shadow-sm hover:border-gray-200 transition-colors duration-200">
              <div
                className={cn(
                  "text-gray-700 prose-sm",
                  !isExpanded && "max-h-16 overflow-hidden"
                )}
              >
                {props.content}
              </div>

              <button
                onClick={toggleExpand}
                className="flex items-center justify-center w-full mt-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 py-1 rounded-md text-sm font-medium transition-all duration-200"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 overflow-hidden"
                >
                  {actionStrategy[props.action] && (
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        {getActionIcon(props.action)}
                        <span className="ml-2">
                          {actionTitle[props.action]}:
                        </span>
                      </h4>
                      <div className="mt-1 text-gray-600 prose-sm max-w-none">
                        <ReactMarkdown>
                          {actionStrategy[props.action]}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {props.resolution && (
                    <div className="p-3 bg-green-50 rounded-md border border-green-200 shadow-sm">
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
                    {props.attachmentId && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span>Attachment available</span>
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

          <CardFooter className="pt-0 border-t border-gray-100 mt-2 flex flex-wrap justify-between items-center gap-2">
            <Link
              href={`/risk/${riskId}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center hover:underline"
            >
              <Reply className="w-3 h-3 mr-1" />
              {props.commentCount || 0} Comments
            </Link>

            <div className="flex items-center gap-2">
              {status === "closed" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReport();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download Report
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download risk report as PDF</TooltipContent>
                </Tooltip>
              )}

              {status === "active" && onSetReminder && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetReminder();
                      }}
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Remind
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Set a reminder for this risk</TooltipContent>
                </Tooltip>
              )}

              {status === "active" && onAnalyze && currentUserId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyze();
                      }}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>AI analysis of this risk</TooltipContent>
                </Tooltip>
              )}

              {status === "active" && isRiskCreator && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCloseDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Close
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close this risk</TooltipContent>
                </Tooltip>
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
