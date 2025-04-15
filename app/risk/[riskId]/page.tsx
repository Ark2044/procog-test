"use client";
import React, { useEffect, useState, useRef } from "react";
import { databases, storage } from "@/models/client/config";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  commentCollection,
  db,
  reminderCollection,
  riskCollection,
} from "@/models/name";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useReminderStore } from "@/store/Reminder";
import { ReminderDialog } from "@/components/ReminderDialog";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart2,
  Bell,
  Calendar,
  File,
  Shield,
  Tag,
  User,
  CheckCircle,
  XCircle,
  Pencil,
  BoldIcon,
  ItalicIcon,
  HelpCircleIcon,
  Link2Icon,
  ListIcon,
  QuoteIcon,
  Sparkles,
  Reply,
  Download,
  Trash,
} from "lucide-react";
import { useAuthStore } from "@/store/Auth";
import { useRiskStore } from "@/store/Risk";
import {
  validateRiskDetail,
  validateAttachment,
  RiskDetailValidationInput,
} from "@/lib/validation";
import { CommentSection } from "@/components/comments/CommentSection";
import { Reminder } from "@/types/Reminder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewedItemsStore } from "@/store/ViewedItems";
import { Query } from "appwrite";
import RiskAnalysisPanel from "@/components/RiskAnalysisPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  generateRiskReportHTML,
  downloadRiskReportAsPDF,
} from "@/utils/reportGenerator";

// Risk interface definition
interface Risk {
  $id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags: string[];
  attachmentId?: string;
  impact: string;
  probability: string;
  action: string;
  mitigation: string;
  acceptance?: string;
  transfer?: string;
  avoidance?: string;
  created: string;
  updated: string;
  dueDate?: string;
  status?: string;
  resolution?: string;
  department?: string; // Added department property
}

// Attachment interface definition
interface Attachment {
  id: string;
  type: string;
  url: string;
}

// EditRiskDialogProps interface definition
interface EditRiskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  risk: Risk;
  riskId: string;
  onRiskUpdated: () => void;
}

const EditRiskDialog: React.FC<EditRiskDialogProps> = ({
  isOpen,
  onClose,
  risk,
  riskId,
  onRiskUpdated,
}) => {
  const [title, setTitle] = useState(risk.title);
  const [content, setContent] = useState(risk.content);
  const [impact, setImpact] = useState(risk.impact);
  const [probability, setProbability] = useState<string>(risk.probability);
  const [action, setAction] = useState(risk.action);
  const [mitigation, setMitigation] = useState(risk.mitigation || "");
  const [acceptance, setAcceptance] = useState(risk.acceptance || "");
  const [transfer, setTransfer] = useState(risk.transfer || "");
  const [avoidance, setAvoidance] = useState(risk.avoidance || "");
  const [isPreviewingMitigation, setIsPreviewingMitigation] = useState(false);
  const [isPreviewingAcceptance, setIsPreviewingAcceptance] = useState(false);
  const [isPreviewingTransfer, setIsPreviewingTransfer] = useState(false);
  const [isPreviewingAvoidance, setIsPreviewingAvoidance] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "assessment">("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mitigationTextareaRef = useRef<HTMLTextAreaElement>(null);
  const acceptanceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const transferTextareaRef = useRef<HTMLTextAreaElement>(null);
  const avoidanceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateRisk } = useRiskStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!title.trim()) {
        throw new Error("Title is required");
      }
      if (!content.trim()) {
        throw new Error("Content is required");
      }

      // Validate strategy based on action type
      if (action === "mitigate" && !mitigation.trim()) {
        throw new Error(
          "Mitigation strategy is required when action is mitigate"
        );
      }
      if (action === "accept" && !acceptance.trim()) {
        throw new Error(
          "Acceptance rationale is required when action is accept"
        );
      }
      if (action === "transfer" && !transfer.trim()) {
        throw new Error(
          "Transfer mechanism is required when action is transfer"
        );
      }
      if (action === "avoid" && !avoidance.trim()) {
        throw new Error("Avoidance approach is required when action is avoid");
      }

      // Prepare strategy data based on action type
      let strategyData = {};
      switch (action) {
        case "mitigate":
          strategyData = { mitigation };
          break;
        case "accept":
          strategyData = { acceptance };
          break;
        case "transfer":
          strategyData = { transfer };
          break;
        case "avoid":
          strategyData = { avoidance };
          break;
      }

      const validImpacts = ["low", "medium", "high"] as const;
      const updatedRisk = {
        title,
        content,
        impact: validImpacts.includes(impact as (typeof validImpacts)[number])
          ? (impact as (typeof validImpacts)[number])
          : undefined,
        probability: Number(probability),
        action: action as "mitigate" | "accept" | "transfer" | "avoid",
        ...strategyData,
      };

      await updateRisk(riskId, updatedRisk);
      onRiskUpdated();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update risk");
      }
    } finally {
      setLoading(false);
    }
  };

  const insertMarkdown = (
    markdownSyntax: string,
    selectionReplacement: string | null = null
  ) => {
    if (!mitigationTextareaRef.current) return;

    const textarea = mitigationTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = mitigation.substring(start, end);

    let newContent = "";
    let newCursorPos = 0;

    if (selectedText) {
      // Text is selected
      const replacement = selectionReplacement || selectedText;
      newContent =
        mitigation.substring(0, start) +
        markdownSyntax.replace("$1", replacement) +
        mitigation.substring(end);

      newCursorPos = start + markdownSyntax.replace("$1", replacement).length;
    } else {
      // No text selected, just insert syntax at cursor
      const placeholder = selectionReplacement || "text";
      newContent =
        mitigation.substring(0, start) +
        markdownSyntax.replace("$1", placeholder) +
        mitigation.substring(end);

      // Position cursor in middle of inserted text if it has a placeholder
      if (markdownSyntax.includes("$1")) {
        newCursorPos =
          start + markdownSyntax.indexOf("$1") + placeholder.length;
      } else {
        newCursorPos = start + markdownSyntax.length;
      }
    }

    setMitigation(newContent);

    // Focus back on textarea and set cursor position after state update
    setTimeout(() => {
      if (mitigationTextareaRef.current) {
        mitigationTextareaRef.current.focus();
        mitigationTextareaRef.current.setSelectionRange(
          newCursorPos,
          newCursorPos
        );
      }
    }, 0);
  };

  const renderBasicForm = () => (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="text-gray-800 font-semibold mb-2 block"
        >
          Risk Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Descriptive title for the risk"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="text-gray-800 font-semibold mb-2 block"
        >
          Risk Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Detailed description of the risk"
          rows={4}
        />
      </div>
    </div>
  );

  const renderAssessmentForm = () => (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="impact"
          className="text-gray-800 font-semibold mb-2 block"
        >
          Impact <span className="text-red-500">*</span>
        </label>
        <select
          id="impact"
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="probability"
          className="text-gray-800 font-semibold mb-2 block"
        >
          Probability <span className="text-red-500">*</span>
        </label>
        <input
          type="range"
          id="probability"
          min="0"
          max="5"
          value={probability}
          onChange={(e) => setProbability(e.target.value)}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Unlikely</span>
          <span>{Number(probability) * 20}%</span>
          <span>Likely</span>
        </div>
      </div>

      <div>
        <label
          htmlFor="action"
          className="text-gray-800 font-semibold mb-2 block"
        >
          Risk Response <span className="text-red-500">*</span>
        </label>
        <select
          id="action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="mitigate">Mitigate - Reduce the risk</option>
          <option value="accept">Accept - Take the risk</option>
          <option value="transfer">Transfer - Share the risk</option>
          <option value="avoid">Avoid - Eliminate the risk</option>
        </select>
      </div>

      {action === "mitigate" && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <label
            htmlFor="mitigation"
            className="text-gray-800 font-semibold mb-2 block"
          >
            Mitigation Strategy <span className="text-red-500">*</span>
          </label>

          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <div className="flex justify-between items-center border-b p-2">
              <div className="flex gap-2">
                <Button
                  variant={isPreviewingMitigation ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsPreviewingMitigation(false)}
                >
                  Write
                </Button>
                <Button
                  variant={isPreviewingMitigation ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewingMitigation(true)}
                >
                  Preview
                </Button>
              </div>

              {!isPreviewingMitigation && (
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("**$1**")}
                        >
                          <BoldIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("*$1*")}
                        >
                          <ItalicIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("[$1](url)")}
                        >
                          <Link2Icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("- $1")}
                        >
                          <ListIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("> $1")}
                        >
                          <QuoteIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Quote</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <HelpCircleIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Markdown Supported</h4>
                          <ul className="text-xs space-y-1">
                            <li>
                              <code>**bold**</code> for <strong>bold</strong>
                            </li>
                            <li>
                              <code>*italic*</code> for <em>italic</em>
                            </li>
                            <li>
                              <code>[link](url)</code> for <a href="#">link</a>
                            </li>
                            <li>
                              <code>- item</code> for lists
                            </li>
                            <li>
                              <code>{">"} quote</code> for quotes
                            </li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {isPreviewingMitigation ? (
              <div className="prose max-w-none min-h-[100px] p-3 bg-gray-50 rounded-md">
                {mitigation ? (
                  <ReactMarkdown>{mitigation}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400">Nothing to preview</p>
                )}
              </div>
            ) : (
              <Textarea
                ref={mitigationTextareaRef}
                id="mitigation"
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
                placeholder="Describe how you plan to mitigate this risk"
                rows={3}
                className="border-0 focus:ring-0"
              />
            )}
          </div>
        </div>
      )}

      {action === "accept" && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <label
            htmlFor="acceptance"
            className="text-gray-800 font-semibold mb-2 block"
          >
            Acceptance Rationale <span className="text-red-500">*</span>
          </label>

          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <div className="flex justify-between items-center border-b p-2">
              <div className="flex gap-2">
                <Button
                  variant={isPreviewingAcceptance ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsPreviewingAcceptance(false)}
                >
                  Write
                </Button>
                <Button
                  variant={isPreviewingAcceptance ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewingAcceptance(true)}
                >
                  Preview
                </Button>
              </div>

              {!isPreviewingAcceptance && (
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("**$1**")}
                        >
                          <BoldIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("*$1*")}
                        >
                          <ItalicIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("[$1](url)")}
                        >
                          <Link2Icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("- $1")}
                        >
                          <ListIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("> $1")}
                        >
                          <QuoteIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Quote</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <HelpCircleIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Markdown Supported</h4>
                          <ul className="text-xs space-y-1">
                            <li>
                              <code>**bold**</code> for <strong>bold</strong>
                            </li>
                            <li>
                              <code>*italic*</code> for <em>italic</em>
                            </li>
                            <li>
                              <code>[link](url)</code> for <a href="#">link</a>
                            </li>
                            <li>
                              <code>- item</code> for lists
                            </li>
                            <li>
                              <code>{">"} quote</code> for quotes
                            </li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {isPreviewingAcceptance ? (
              <div className="prose max-w-none min-h-[100px] p-3 bg-gray-50 rounded-md">
                {acceptance ? (
                  <ReactMarkdown>{acceptance}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400">Nothing to preview</p>
                )}
              </div>
            ) : (
              <Textarea
                ref={acceptanceTextareaRef}
                id="acceptance"
                value={acceptance}
                onChange={(e) => setAcceptance(e.target.value)}
                placeholder="Document the rationale for accepting this risk, including thresholds and monitoring approach"
                rows={3}
                className="border-0 focus:ring-0"
              />
            )}
          </div>
        </div>
      )}

      {action === "transfer" && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <label
            htmlFor="transfer"
            className="text-gray-800 font-semibold mb-2 block"
          >
            Transfer Mechanism <span className="text-red-500">*</span>
          </label>

          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <div className="flex justify-between items-center border-b p-2">
              <div className="flex gap-2">
                <Button
                  variant={isPreviewingTransfer ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsPreviewingTransfer(false)}
                >
                  Write
                </Button>
                <Button
                  variant={isPreviewingTransfer ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewingTransfer(true)}
                >
                  Preview
                </Button>
              </div>

              {!isPreviewingTransfer && (
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("**$1**")}
                        >
                          <BoldIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("*$1*")}
                        >
                          <ItalicIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("[$1](url)")}
                        >
                          <Link2Icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("- $1")}
                        >
                          <ListIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("> $1")}
                        >
                          <QuoteIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Quote</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <HelpCircleIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Markdown Supported</h4>
                          <ul className="text-xs space-y-1">
                            <li>
                              <code>**bold**</code> for <strong>bold</strong>
                            </li>
                            <li>
                              <code>*italic*</code> for <em>italic</em>
                            </li>
                            <li>
                              <code>[link](url)</code> for <a href="#">link</a>
                            </li>
                            <li>
                              <code>- item</code> for lists
                            </li>
                            <li>
                              <code>{">"} quote</code> for quotes
                            </li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {isPreviewingTransfer ? (
              <div className="prose max-w-none min-h-[100px] p-3 bg-gray-50 rounded-md">
                {transfer ? (
                  <ReactMarkdown>{transfer}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400">Nothing to preview</p>
                )}
              </div>
            ) : (
              <Textarea
                ref={transferTextareaRef}
                id="transfer"
                value={transfer}
                onChange={(e) => setTransfer(e.target.value)}
                placeholder="Detail how the risk will be transferred (insurance, contracts, third parties)"
                rows={3}
                className="border-0 focus:ring-0"
              />
            )}
          </div>
        </div>
      )}

      {action === "avoid" && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <label
            htmlFor="avoidance"
            className="text-gray-800 font-semibold mb-2 block"
          >
            Avoidance Approach <span className="text-red-500">*</span>
          </label>

          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <div className="flex justify-between items-center border-b p-2">
              <div className="flex gap-2">
                <Button
                  variant={isPreviewingAvoidance ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsPreviewingAvoidance(false)}
                >
                  Write
                </Button>
                <Button
                  variant={isPreviewingAvoidance ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewingAvoidance(true)}
                >
                  Preview
                </Button>
              </div>

              {!isPreviewingAvoidance && (
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("**$1**")}
                        >
                          <BoldIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("*$1*")}
                        >
                          <ItalicIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("[$1](url)")}
                        >
                          <Link2Icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("- $1")}
                        >
                          <ListIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("> $1")}
                        >
                          <QuoteIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Quote</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <HelpCircleIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Markdown Supported</h4>
                          <ul className="text-xs space-y-1">
                            <li>
                              <code>**bold**</code> for <strong>bold</strong>
                            </li>
                            <li>
                              <code>*italic*</code> for <em>italic</em>
                            </li>
                            <li>
                              <code>[link](url)</code> for <a href="#">link</a>
                            </li>
                            <li>
                              <code>- item</code> for lists
                            </li>
                            <li>
                              <code>{">"} quote</code> for quotes
                            </li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {isPreviewingAvoidance ? (
              <div className="prose max-w-none min-h-[100px] p-3 bg-gray-50 rounded-md">
                {avoidance ? (
                  <ReactMarkdown>{avoidance}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400">Nothing to preview</p>
                )}
              </div>
            ) : (
              <Textarea
                ref={avoidanceTextareaRef}
                id="avoidance"
                value={avoidance}
                onChange={(e) => setAvoidance(e.target.value)}
                placeholder="Describe how you will eliminate this risk (process changes, activity termination)"
                rows={3}
                className="border-0 focus:ring-0"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Risk</DialogTitle>
          <DialogDescription>
            Update the details of this risk. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "basic" | "assessment")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              {renderBasicForm()}
            </TabsContent>

            <TabsContent value="assessment" className="mt-4">
              {renderAssessmentForm()}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const RiskDetail = () => {
  const router = useRouter();
  const params = useParams();
  const riskId = params?.riskId as string | undefined;
  const [sessionChecked, setSessionChecked] = useState(false);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { reminders, fetchReminders, deleteReminder, updateReminder } =
    useReminderStore();
  const { user, verifySession, session } = useAuthStore();
  const { closeRisk } = useRiskStore();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { markCommentsViewed, markRemindersViewed } = useViewedItemsStore();
  const [commentCount, setCommentCount] = useState(0);

  interface Result {
    url: string;
    description: string;
    score: number;
  }
  const [results, setResults] = useState<Result[]>([]);

  const search = async () => {
    if (!risk) return;
    try {
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: risk.title,
          tags: risk.tags,
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

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
        } else if (`${user.$id}` !== user.$id) {
          router.push(`/dashboard/${user.$id}`);
        }
      }
    }
  }, [sessionChecked, loading, session, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof riskId === "string" && user) {
        try {
          const response = await databases.getDocument(
            db,
            riskCollection,
            riskId
          );

          const mappedRisk: Risk = {
            $id: response.$id,
            title: response.title,
            content: response.content,
            authorId: response.authorId,
            authorName: response.authorName,
            tags: response.tags || [],
            attachmentId: response.attachmentId,
            impact: response.impact,
            probability: response.probability,
            action: response.action,
            mitigation: response.mitigation,
            acceptance: response.acceptance,
            transfer: response.transfer,
            avoidance: response.avoidance,
            created: response.created,
            updated: response.updated,
            dueDate: response.dueDate,
            status: response.status || "active",
            resolution: response.resolution,
            department: response.department, // Added department property
          };

          const validation = validateRiskDetail(
            mappedRisk as unknown as RiskDetailValidationInput
          );
          if (!validation.isValid) {
            console.error("Risk validation failed:", validation.error);
            setError(validation.error || "Invalid risk data");
            return;
          }

          setRisk(mappedRisk);

          if (response.attachmentId) {
            try {
              const attachmentResponse = await storage.getFile(
                db,
                response.attachmentId
              );
              const attachmentUrl = storage.getFileView(
                db,
                attachmentResponse.$id
              );

              const validation = validateAttachment({
                file: new Blob([], { type: attachmentResponse.mimeType }),
              });

              if (!validation.isValid) {
                console.error(
                  "Attachment validation failed:",
                  validation.error
                );
                console.warn("Skipping invalid attachment");
              } else {
                const mappedAttachment: Attachment = {
                  id: attachmentResponse.$id,
                  type: attachmentResponse.mimeType,
                  url: attachmentUrl,
                };
                setAttachment(mappedAttachment);
              }
            } catch (attachmentError) {
              console.error("Error fetching attachment:", attachmentError);
            }
          }

          await fetchReminders(user.$id);

          const userReminders = await databases.listDocuments(
            db,
            reminderCollection,
            [Query.equal("riskId", riskId), Query.equal("userId", user.$id)]
          );

          if (userReminders && userReminders.total > 0) {
            markRemindersViewed(user.$id, riskId, userReminders.total);
          }

          const commentsData = await databases.listDocuments(
            db,
            commentCollection,
            [Query.equal("riskId", riskId)]
          );

          if (commentsData && commentsData.total > 0) {
            markCommentsViewed(user.$id, riskId, commentsData.total);
          }
        } catch (err) {
          console.error(err);
          setError("Error fetching data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [riskId, user, fetchReminders, markCommentsViewed, markRemindersViewed]);

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsReminderDialogOpen(true);
  };

  const handleCloseReminderDialog = () => {
    setIsReminderDialogOpen(false);
    setEditingReminder(null);
  };

  const handleCloseRisk = async () => {
    const trimmedResolution = resolution.trim();
    if (
      !trimmedResolution ||
      trimmedResolution === "." ||
      /^\s*$/.test(trimmedResolution)
    ) {
      // Don't allow closing with empty resolution or just a period
      return;
    }

    if (riskId) {
      await closeRisk(riskId, resolution);
      setIsCloseDialogOpen(false);
      router.refresh();
    }
  };

  const handleRiskUpdated = () => {
    router.refresh();
  };

  const handleDownloadReport = async () => {
    if (!risk || !riskId) return;

    setLoading(true);
    try {
      // Determine which action strategy to use based on the risk action
      const actionStrategy = {
        mitigate: risk.mitigation,
        accept: risk.acceptance,
        transfer: risk.transfer,
        avoid: risk.avoidance,
      }[risk.action];

      // 1. Fetch all comments related to this risk
      const commentsResponse = await databases.listDocuments(
        db,
        commentCollection,
        [Query.equal("riskId", riskId), Query.orderDesc("$createdAt")]
      );

      const comments = commentsResponse.documents.map((doc) => ({
        id: doc.$id,
        author: doc.authorName,
        content: doc.content,
        created: doc.$createdAt,
        votes: doc.upvotes - doc.downvotes,
      }));

      // 2. Fetch risk analysis data if available
      let analysisData:
        | {
            summary: string;
            keyConcerns: string[];
            recommendations: string[];
          }
        | undefined = undefined;

      try {
        const analysisResponse = await fetch(
          `/api/risk-analysis?riskId=${riskId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json();
          if (analysisResult && analysisResult.summary) {
            analysisData = {
              summary: analysisResult.summary,
              keyConcerns: analysisResult.keyConcerns || [],
              recommendations: analysisResult.recommendations || [],
            };
          }
        }
      } catch (analysisError) {
        console.error("Error fetching analysis data:", analysisError);
        // Continue without analysis data
      }

      // 3. Include web references if available
      const webReferences =
        results.length > 0
          ? results.map((item) => ({
              url: item.url,
              description: item.description,
              score: item.score,
            }))
          : [];

      // Prepare complete data for the report
      const reportData = {
        riskId: risk.$id,
        title: risk.title,
        content: risk.content,
        authorName: risk.authorName,
        impact: risk.impact as "low" | "medium" | "high",
        probability: Number(risk.probability),
        action: risk.action as "mitigate" | "accept" | "transfer" | "avoid",
        actionDetails: actionStrategy || "",
        tags: risk.tags || [],
        created: risk.created,
        closed: risk.updated, // Using updated date as the closed date
        resolution: risk.resolution || "No specific resolution provided",
        department: risk.department || "General",
        attachmentId: risk.attachmentId,
        // New comprehensive fields
        comments: comments,
        webReferences: webReferences.length > 0 ? webReferences : undefined,
        analysis: analysisData,
      };

      // Generate HTML report
      const reportHTML = generateRiskReportHTML(reportData);

      // Download as PDF
      downloadRiskReportAsPDF(reportHTML, `risk-report-${risk.$id}.pdf`);
    } catch (error) {
      console.error("Error generating risk report:", error);
      alert("Error generating risk report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pt-24 sm:pt-28 p-4 sm:p-8 text-gray-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-9 w-3/4 rounded-lg bg-gray-200" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={`tag-skeleton-${i}`}
                className="h-6 w-20 rounded-full bg-gray-200"
              />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={`content-skeleton-${i}`}
                className="h-4 w-full rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pt-24 sm:pt-28 p-4 sm:p-8">
        <Alert
          variant="destructive"
          className="max-w-4xl mx-auto border border-red-200 bg-red-50"
        >
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-gray-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pt-24 sm:pt-28 p-4 sm:p-8">
        <Alert className="max-w-4xl mx-auto border border-gray-200 bg-white">
          <AlertCircle className="h-4 w-4 text-gray-500" />
          <AlertDescription className="text-gray-800">
            No risk details found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getRiskLevelColor = (level: string | undefined | null) => {
    if (!level) return "bg-gray-200 text-gray-800";
    const levelStr = String(level).toLowerCase();
    if (levelStr.includes("high")) return "bg-red-200 text-red-800";
    if (levelStr.includes("medium")) return "bg-yellow-200 text-yellow-800";
    return "bg-green-200 text-green-800";
  };

  const isRiskCreator = user && risk && user.$id === risk.authorId;

  const userRiskReminders = reminders.filter(
    (r) => r.riskId === riskId && r.userId === user?.$id
  );

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-blue-100 text-blue-800";
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pt-24 sm:pt-28 pb-12 px-4 sm:px-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title section with improved mobile layout and visual hierarchy */}
        <div className="relative bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-indigo-100 p-5 sm:p-8">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent leading-tight">
                {risk.title}
              </h1>
              <div className="flex-shrink-0 self-start">
                {isRiskCreator && risk.status !== "closed" ? (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-gray-100 shadow-sm h-9 px-3 sm:px-4"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Edit Risk</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                ) : (
                  risk.status === "closed" && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm h-9 px-3 sm:px-4"
                      onClick={() => handleDownloadReport()}
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">Download Report</span>
                      <span className="sm:hidden">Download</span>
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Risk metadata with improved mobile layout */}
            <div className="flex flex-wrap gap-y-3 gap-x-4 items-center text-sm text-gray-500">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-1.5" />
                {risk.authorName}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-1.5" />
                {new Date(risk.created).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              {risk.status && (
                <div
                  className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    risk.status === "active"
                      ? "bg-blue-100 text-blue-700"
                      : risk.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {risk.status === "active" ? (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  ) : risk.status === "resolved" ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
                </div>
              )}
            </div>

            {/* Tags with horizontal scrolling on mobile */}
            <div className="flex flex-wrap gap-2 items-center mt-1 overflow-x-auto pb-1">
              {risk.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-gray-100 px-3 py-1 rounded-full shadow-sm whitespace-nowrap"
                >
                  <Tag className="w-3 h-3 mr-2 text-blue-500" />
                  <span className="font-medium text-gray-700">{tag}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6 space-y-6">
            <p className="text-gray-700 leading-relaxed">{risk.content}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Reported by</p>
                    <p className="text-gray-800 font-medium">
                      {risk.authorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Impact</p>
                    <p
                      className={`${getRiskLevelColor(
                        risk.impact
                      )} font-semibold px-2 py-1 rounded text-sm`}
                    >
                      {risk.impact}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <BarChart2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Probability</p>
                    <p
                      className={`${getRiskLevelColor(
                        risk.probability
                      )} font-semibold px-2 py-1 rounded text-sm`}
                    >
                      {risk.probability}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p
                      className={`${getStatusColor(
                        risk.status
                      )} font-semibold px-2 py-1 rounded text-sm`}
                    >
                      {risk.status || "active"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-gray-800 font-medium text-sm">
                      {new Date(risk.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-gray-800 font-medium text-sm">
                      {new Date(risk.updated).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {risk.dueDate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-red-600 font-medium text-sm">
                        {new Date(risk.dueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  Risk Assessment
                </h3>
                <div className="border-t border-gray-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm transition hover:shadow">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-gray-400" />
                      Impact Level
                    </div>
                    <div className={`flex items-center gap-2 mt-1`}>
                      <div
                        className={`text-lg font-bold ${
                          risk.impact === "high"
                            ? "text-red-600"
                            : risk.impact === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {risk.impact.charAt(0).toUpperCase() +
                          risk.impact.slice(1)}
                      </div>
                      <div
                        className={`h-2.5 flex-1 rounded-full ${
                          risk.impact === "high"
                            ? "bg-red-200"
                            : risk.impact === "medium"
                            ? "bg-yellow-200"
                            : "bg-green-200"
                        }`}
                      >
                        <div
                          className={`h-2.5 rounded-full ${
                            risk.impact === "high"
                              ? "bg-red-500 w-full"
                              : risk.impact === "medium"
                              ? "bg-yellow-500 w-2/3"
                              : "bg-green-500 w-1/3"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm transition hover:shadow">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-gray-400" />
                      Probability
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`text-lg font-bold ${
                          Number(risk.probability) >= 4
                            ? "text-red-600"
                            : Number(risk.probability) >= 2
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {Number(risk.probability) * 20}%
                      </div>
                      <div className="h-2.5 flex-1 bg-gray-200 rounded-full">
                        <div
                          className={`h-2.5 rounded-full ${
                            Number(risk.probability) >= 4
                              ? "bg-red-500"
                              : Number(risk.probability) >= 2
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Number(risk.probability) * 20}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm transition hover:shadow">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      Priority
                    </div>
                    {(() => {
                      const impactValue =
                        risk.impact === "high"
                          ? 3
                          : risk.impact === "medium"
                          ? 2
                          : 1;
                      const probabilityValue = Number(risk.probability);
                      const priority = impactValue * probabilityValue;
                      const priorityLabel =
                        priority >= 10
                          ? "Critical"
                          : priority >= 6
                          ? "High"
                          : priority >= 3
                          ? "Medium"
                          : "Low";
                      const priorityColor =
                        priority >= 10
                          ? "text-red-600"
                          : priority >= 6
                          ? "text-orange-600"
                          : priority >= 3
                          ? "text-yellow-600"
                          : "text-green-600";

                      return (
                        <div className="flex items-center justify-between mt-1">
                          <div className={`text-lg font-bold ${priorityColor}`}>
                            {priorityLabel}
                          </div>
                          <div
                            className={`px-2 py-0.5 rounded text-xs ${
                              priority >= 10
                                ? "bg-red-100 text-red-800"
                                : priority >= 6
                                ? "bg-orange-100 text-orange-800"
                                : priority >= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            Score: {priority}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  Response Plan
                </h3>
                <div className="border-t border-gray-200" />
              </div>

              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    Immediate Action
                  </h4>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 capitalize">
                    {risk.action}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    {risk.action === "mitigate" && "Mitigation Strategy"}
                    {risk.action === "accept" && "Acceptance Rationale"}
                    {risk.action === "transfer" && "Transfer Mechanism"}
                    {risk.action === "avoid" && "Avoidance Approach"}
                  </h4>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 prose max-w-none">
                    {risk.action === "mitigate" && risk.mitigation}
                    {risk.action === "accept" && risk.acceptance}
                    {risk.action === "transfer" && risk.transfer}
                    {risk.action === "avoid" && risk.avoidance}
                  </div>
                </div>
              </div>

              {isRiskCreator && risk?.status === "active" && (
                <div className="flex justify-end mt-4">
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

              {risk?.resolution && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-700 flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Resolution
                  </h4>
                  <p className="mt-2 text-gray-600">{risk.resolution}</p>
                </div>
              )}
            </div>

            {attachment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <File className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    Attachment
                  </h3>
                  <div className="border-t border-gray-200" />
                </div>

                {attachment.type.startsWith("image/") ? (
                  <div className="relative h-96 w-full rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={attachment.url}
                      alt="Risk attachment"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <File className="w-6 h-6 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {attachment.id.substring(
                          attachment.id.lastIndexOf("/") + 1
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{attachment.type}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-600" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isRiskCreator && risk && (
          <ReminderDialog
            isOpen={isReminderDialogOpen}
            onClose={handleCloseReminderDialog}
            riskId={riskId as string}
            riskTitle={risk.title}
            userId={user.$id}
            editingReminder={editingReminder}
            onUpdate={updateReminder}
          />
        )}

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

        {isRiskCreator && risk && (
          <EditRiskDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            risk={risk}
            riskId={riskId as string}
            onRiskUpdated={handleRiskUpdated}
          />
        )}

        <Tabs defaultValue="discussion" className="w-full mt-8">
          <TabsList className="w-full border-b rounded-none p-0 h-auto bg-transparent flex overflow-x-auto hide-scrollbar pb-1 mb-1 gap-1.5">
            <TabsTrigger
              value="discussion"
              className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium min-w-max flex-shrink-0"
            >
              <div className="flex items-center gap-1.5">
                <Reply className="w-3.5 h-3.5 text-blue-500" />
                <span>Discussion</span>
                {commentCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {commentCount}
                  </span>
                )}
              </div>
            </TabsTrigger>
            {isRiskCreator && (
              <TabsTrigger
                value="reminders"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium min-w-max flex-shrink-0"
              >
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reminders</span>
                  {userRiskReminders.length > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {userRiskReminders.length}
                    </span>
                  )}
                </div>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="analysis"
              className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium min-w-max flex-shrink-0"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Analysis</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="web-search"
              className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium min-w-max flex-shrink-0"
            >
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                <span>Web</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="discussion"
            className="mt-4 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <CommentSection
              riskId={risk.$id}
              entityType="risk"
              onCommentsCountChange={(count: number) => setCommentCount(count)}
            />
          </TabsContent>

          {isRiskCreator && (
            <TabsContent
              value="reminders"
              className="mt-4 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-amber-500" />
                    Your Reminders
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReminderDialogOpen(true)}
                    className="text-sm border-blue-500 text-blue-600"
                  >
                    <Bell className="h-3.5 w-3.5 mr-1" />
                    Add Reminder
                  </Button>
                </div>

                {userRiskReminders.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-500">
                      You don&apos;t have any reminders set for this risk yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userRiskReminders.map((reminder) => (
                      <div
                        key={reminder.$id}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="font-medium text-gray-800">
                            {reminder.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {reminder.description}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(reminder.reminderDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReminder(reminder)}
                            className="h-8 px-2 text-xs"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReminder(reminder.$id)}
                            className="h-8 px-2 text-xs border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent
            value="analysis"
            className="mt-4 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            {user && (
              <RiskAnalysisPanel riskId={riskId as string} userId={user.$id} />
            )}
          </TabsContent>

          <TabsContent
            value="web-search"
            className="mt-4 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-semibold text-lg flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  Related Web Results
                </h3>
                <Button
                  onClick={search}
                  className="h-9 bg-green-600 hover:bg-green-700"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Search Web
                </Button>
              </div>

              {results.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-blue-600 hover:underline text-sm font-medium mb-1 flex items-center">
                            {new URL(result.url).hostname}
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </h4>
                          <div className="bg-green-100 text-green-800 text-xs rounded px-2 py-0.5">
                            Score: {result.score.toFixed(2)}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {result.description}
                        </p>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center mt-4">
                  <p className="text-gray-500">
                    Click &ldquo;Search Web&rdquo; to find related information
                    for this risk.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RiskDetail;
