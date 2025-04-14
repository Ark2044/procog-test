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
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Reply,
  Sparkles,
  User,
  XCircle,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRiskStore } from "@/store/Risk";
import { AnimatePresence, motion } from "framer-motion";
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
import { isAfter, formatDistanceToNow } from "date-fns";
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

// Simplified style maps
const IMPACT_STYLES: Record<string, { color: string; icon: string }> = {
  low: { color: "bg-green-100 text-green-800", icon: "●" },
  medium: { color: "bg-yellow-100 text-yellow-800", icon: "●●" },
  high: { color: "bg-red-100 text-red-800", icon: "●●●" },
};

const ACTION_STYLES: Record<string, { color: string; label: string }> = {
  mitigate: { color: "bg-blue-100 text-blue-800", label: "Mitigate" },
  accept: { color: "bg-green-100 text-green-800", label: "Accept" },
  transfer: { color: "bg-purple-100 text-purple-800", label: "Transfer" },
  avoid: { color: "bg-red-100 text-red-800", label: "Avoid" },
};

const PRIORITY_MAP: Record<string, { color: string; bgColor: string }> = {
  critical: { color: "text-red-600", bgColor: "bg-red-50" },
  high: { color: "text-orange-600", bgColor: "bg-orange-50" },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-50" },
  low: { color: "text-green-600", bgColor: "bg-green-50" },
};

const RiskCardSkeleton = () => (
  <Card className="w-full bg-white border border-gray-200">
    <CardHeader className="py-2 px-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardHeader>
    <CardContent className="px-3 py-2">
      <Skeleton className="h-12 w-full" />
    </CardContent>
    <CardFooter className="py-2 px-3 flex justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-24" />
    </CardFooter>
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

  if (loading) return <RiskCardSkeleton />;
  if (error)
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="py-2 px-3">
          <div className="flex items-center text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" /> {error}
          </div>
        </CardContent>
      </Card>
    );

  // Simplified data preparation
  const isRiskCreator = currentUserId === props.authorId;
  const status = props.status || "active";

  // Calculate priority
  const impactValue = { low: 1, medium: 2, high: 3 }[props.impact] || 1;
  const riskPriority = impactValue * props.probability;
  const priorityLabel =
    riskPriority >= 10
      ? "Critical"
      : riskPriority >= 6
      ? "High"
      : riskPriority >= 3
      ? "Medium"
      : "Low";

  const priorityStyle = PRIORITY_MAP[priorityLabel.toLowerCase()];

  // State indicators
  const newCommentsCount =
    currentUserId && props.commentCount
      ? getNewCommentsCount(currentUserId, riskId, props.commentCount)
      : 0;

  // Display reminders notification badge if there are new reminders
  const newRemindersCount =
    currentUserId && props.reminderCount && isRiskCreator
      ? getNewRemindersCount(currentUserId, riskId, props.reminderCount)
      : 0;

  // Add reminder notification badge if needed
  const hasNewReminders = newRemindersCount > 0;

  // Due date status
  const isDueSoon =
    props.dueDate &&
    isAfter(new Date(props.dueDate), new Date()) &&
    !isAfter(
      new Date(props.dueDate),
      new Date(new Date().setDate(new Date().getDate() + 7))
    );

  const isOverdue =
    props.dueDate && isAfter(new Date(), new Date(props.dueDate));

  // Handlers
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

  const handleCloseRisk = async () => {
    await closeRisk(riskId, resolution);
    setIsCloseDialogOpen(false);
  };

  const handleDownloadReport = () => {
    const actionStrategy = {
      mitigate: props.mitigation,
      accept: props.acceptance,
      transfer: props.transfer,
      avoid: props.avoidance,
    }[props.action];

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
      closed: props.updated,
      resolution: props.resolution || "",
      department: props.department,
      attachmentId: props.attachmentId,
    };

    const reportHTML = generateRiskReportHTML(reportData);
    downloadRiskReportAsPDF(reportHTML, `risk-report-${riskId}.pdf`);
  };

  // Format dates
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "w-full border hover:shadow-sm relative",
          props.isConfidential ? "border-red-200" : "border-gray-200",
          isOverdue ? "border-l-4 border-l-red-500" : "",
          isDueSoon ? "border-l-4 border-l-yellow-500" : "",
          status === "closed" ? "bg-gray-50" : "bg-white"
        )}
      >
        {/* Status indicators */}
        <div className="absolute top-0 right-0 z-10 flex">
          {status !== "active" && (
            <div className="py-0.5 px-2 text-xs font-medium bg-gray-500 text-white">
              Closed
            </div>
          )}
          {props.isConfidential && (
            <div className="bg-red-500 text-white py-0.5 px-2 text-xs font-medium ml-1">
              Confidential
            </div>
          )}
        </div>

        {/* Header */}
        <CardHeader className="py-2 px-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <CardTitle className="text-base font-medium text-gray-800">
                <Link
                  href={`/risk/${riskId}`}
                  className="hover:text-blue-600 hover:underline flex items-center"
                >
                  {props.title}
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 hover:opacity-100" />
                </Link>
              </CardTitle>

              <div className="flex flex-wrap items-center gap-x-2 mt-1 text-xs text-gray-500">
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" /> {props.authorName}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />{" "}
                  {formatTimeAgo(props.created)}
                </span>
                {props.dueDate && status === "active" && isOverdue && (
                  <span className="flex items-center text-red-600 font-medium">
                    <Calendar className="w-3 h-3 mr-1" /> Overdue
                  </span>
                )}
                {props.dueDate && status === "active" && isDueSoon && (
                  <span className="flex items-center text-yellow-600 font-medium">
                    <Calendar className="w-3 h-3 mr-1" /> Due soon
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center mt-4">
              <Badge
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5",
                  priorityStyle.color,
                  priorityStyle.bgColor
                )}
              >
                {priorityLabel}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-0 pb-2 px-3">
          {/* Risk summary - always visible */}
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <div
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-sm flex items-center",
                  IMPACT_STYLES[props.impact].color
                )}
              >
                <span className="mr-1">{IMPACT_STYLES[props.impact].icon}</span>{" "}
                {props.impact}
              </div>

              <div
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-sm",
                  ACTION_STYLES[props.action].color
                )}
              >
                {ACTION_STYLES[props.action].label}
              </div>

              {newCommentsCount > 0 && (
                <div className="bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                  <Reply className="w-3 h-3 mr-1" /> {newCommentsCount} new
                </div>
              )}

              {hasNewReminders && (
                <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                  <Bell className="w-3 h-3 mr-1" /> {newRemindersCount} new
                </div>
              )}
            </div>

            <div className="text-sm text-gray-700 line-clamp-2 mb-1">
              {props.content}
            </div>

            <button
              onClick={toggleExpand}
              className="text-xs text-blue-500 hover:text-blue-700 self-start flex items-center"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="w-3 h-3 ml-0.5" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="w-3 h-3 ml-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Expandable details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 text-xs text-gray-600 border-t border-gray-100 pt-2"
              >
                {/* Action strategy */}
                {/* Check each property individually in a type-safe way */}
                <div className="mb-2">
                  <div className="font-medium mb-1">
                    {props.action === "mitigate" && "Mitigation Strategy:"}
                    {props.action === "accept" && "Acceptance Rationale:"}
                    {props.action === "transfer" && "Transfer Mechanism:"}
                    {props.action === "avoid" && "Avoidance Approach:"}
                  </div>
                  <div className="text-gray-600 prose-sm">
                    {props.action === "mitigate" && props.mitigation && (
                      <ReactMarkdown>{props.mitigation}</ReactMarkdown>
                    )}
                    {props.action === "accept" && props.acceptance && (
                      <ReactMarkdown>{props.acceptance}</ReactMarkdown>
                    )}
                    {props.action === "transfer" && props.transfer && (
                      <ReactMarkdown>{props.transfer}</ReactMarkdown>
                    )}
                    {props.action === "avoid" && props.avoidance && (
                      <ReactMarkdown>{props.avoidance}</ReactMarkdown>
                    )}
                  </div>
                </div>

                {/* Resolution if closed */}
                {props.resolution && (
                  <div className="mb-2">
                    <div className="font-medium flex items-center mb-1">
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      Resolution:
                    </div>
                    <p>{props.resolution}</p>
                  </div>
                )}

                {/* Tags */}
                {props.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-gray-500">Tags:</span>
                    {props.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Additional metadata */}
                {props.attachmentId && (
                  <div className="text-gray-500">Attachment available</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Footer with actions */}
        <CardFooter className="py-1.5 px-3 border-t border-gray-100 flex justify-between items-center">
          <Link
            href={`/risk/${riskId}`}
            className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
          >
            <Reply className="w-3 h-3 mr-1" />
            {props.commentCount || 0} Comments
          </Link>

          <div className="flex items-center gap-1">
            {status === "active" && onSetReminder && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 p-1 text-xs"
                    onClick={onSetReminder}
                  >
                    <Bell className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set reminder</TooltipContent>
              </Tooltip>
            )}

            {status === "active" && onAnalyze && currentUserId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 p-1 text-xs text-purple-600"
                    onClick={onAnalyze}
                  >
                    <Sparkles className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Analyze</TooltipContent>
              </Tooltip>
            )}

            {status === "closed" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 p-1 text-xs text-green-600"
                    onClick={handleDownloadReport}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download report</TooltipContent>
              </Tooltip>
            )}

            {status === "active" && isRiskCreator && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 p-1 text-xs text-red-600"
                    onClick={() => setIsCloseDialogOpen(true)}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close risk</TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Close Risk Dialog */}
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
    </TooltipProvider>
  );
};

export default RiskCard;
