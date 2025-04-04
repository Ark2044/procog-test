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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Edit,
  CheckCircle,
  XCircle,
  Pencil,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BoldIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  QuoteIcon,
  HelpCircleIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewedItemsStore } from "@/store/ViewedItems";
import { Query } from "appwrite";
import RiskAnalysisPanel from "@/components/RiskAnalysisPanel";

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
}

interface Attachment {
  id: string;
  type: string;
  url: string;
}

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

          // Mark any reminders for this risk as viewed - now with userId
          const userReminders = await databases.listDocuments(
            db,
            reminderCollection,
            [Query.equal("riskId", riskId), Query.equal("userId", user.$id)]
          );

          if (userReminders && userReminders.total > 0) {
            markRemindersViewed(user.$id, riskId, userReminders.total);
          }

          // Count comments for this risk
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
    if (riskId) {
      await closeRisk(riskId, resolution);
      setIsCloseDialogOpen(false);
      router.refresh();
    }
  };

  const handleRiskUpdated = () => {
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-gray-800 ">
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {risk.title}
            </h1>
            {isRiskCreator && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil size={16} />
                Edit Risk
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {risk.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-gray-300 bg-gray-100 hover:bg-gray-200"
              >
                <Tag className="w-4 h-4 mr-2 text-gray-600" />
                <span className="font-medium text-gray-700">{tag}</span>
              </Badge>
            ))}
          </div>
        </div>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6 space-y-6">
            <p className="text-gray-700 leading-relaxed">{risk.content}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Reported by</p>
                    <p className="text-gray-800 font-medium">
                      {risk.authorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Impact</p>
                    <p
                      className={`${getRiskLevelColor(
                        risk.impact
                      )} font-semibold px-2 py-1 rounded`}
                    >
                      {risk.impact}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Probability</p>
                    <p
                      className={`${getRiskLevelColor(
                        risk.probability
                      )} font-semibold px-2 py-1 rounded`}
                    >
                      {risk.probability}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p
                      className={`${getStatusColor(
                        risk.status
                      )} font-semibold px-2 py-1 rounded`}
                    >
                      {risk.status || "active"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-gray-800 font-medium">
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

                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-gray-800 font-medium">
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
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-red-600 font-medium">
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
                  <Shield className="w-6 h-6 text-blue-500" />
                  Response Plan
                </h3>
                <div className="border-t border-gray-200" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    Immediate Action
                  </h4>
                  <p className="text-gray-700 bg-gray-100 p-4 rounded-lg">
                    {risk.action}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    {risk.action === "mitigate" && "Mitigation Strategy"}
                    {risk.action === "accept" && "Acceptance Rationale"}
                    {risk.action === "transfer" && "Transfer Mechanism"}
                    {risk.action === "avoid" && "Avoidance Approach"}
                  </h4>
                  <div className="text-gray-700 bg-gray-100 p-4 rounded-lg prose max-w-none">
                    {risk.action === "mitigate" && (
                      <ReactMarkdown>{risk.mitigation}</ReactMarkdown>
                    )}
                    {risk.action === "accept" && (
                      <ReactMarkdown>{risk.acceptance || ""}</ReactMarkdown>
                    )}
                    {risk.action === "transfer" && (
                      <ReactMarkdown>{risk.transfer || ""}</ReactMarkdown>
                    )}
                    {risk.action === "avoid" && (
                      <ReactMarkdown>{risk.avoidance || ""}</ReactMarkdown>
                    )}
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
                <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-700 flex items-center">
                    <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                    Resolution
                  </h4>
                  <p className="mt-1 text-gray-600">{risk.resolution}</p>
                </div>
              )}
            </div>

            {attachment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <File className="w-6 h-6 text-blue-500" />
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
                    className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <File className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-gray-700 font-medium">
                        View Attachment
                      </p>
                      <p className="text-xs text-gray-600">{attachment.type}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 ml-auto text-gray-600" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {user && (
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  Review Reminders
                </h3>
                {isRiskCreator && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingReminder(null);
                      setIsReminderDialogOpen(true);
                    }}
                  >
                    Set New Reminder
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {userRiskReminders.length === 0 ? (
                <p className="text-gray-500">
                  {isRiskCreator
                    ? "No reminders set"
                    : "Only the risk creator can set reminders"}
                </p>
              ) : (
                <div className="space-y-4">
                  {userRiskReminders.map((reminder) => (
                    <div
                      key={reminder.$id}
                      className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {reminder.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(reminder.datetime).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{reminder.description}</p>
                        {reminder.recurrence !== "none" && (
                          <Badge variant="outline" className="mt-1">
                            Repeats {reminder.recurrence}
                          </Badge>
                        )}
                      </div>
                      {isRiskCreator && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditReminder(reminder)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteReminder(reminder.$id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

        {user && riskId && (
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <CommentSection
                riskId={riskId as string}
                entityType="risk"
                onCommentsCountChange={(count: number) =>
                  setCommentCount(count)
                }
              />
            </CardContent>
          </Card>
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
          <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
            <TabsTrigger
              value="discussion"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              Discussion {commentCount > 0 && `(${commentCount})`}
            </TabsTrigger>
            {isRiskCreator && (
              <TabsTrigger
                value="reminders"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
              >
                Reminders{" "}
                {userRiskReminders.length > 0 &&
                  `(${userRiskReminders.length})`}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="analysis"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              AI Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussion" className="mt-6">
            <CommentSection
              riskId={risk.$id}
              entityType="risk"
              onCommentsCountChange={(count: number) => setCommentCount(count)}
            />
          </TabsContent>

          {isRiskCreator && (
            <TabsContent value="reminders" className="mt-6">
              <div className="space-y-4">
                {userRiskReminders.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No reminders yet
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      Set reminders for this risk to notify yourself or the team
                      about important deadlines or follow-up tasks.
                    </p>
                    <Button
                      onClick={() => {
                        setEditingReminder(null);
                        setIsReminderDialogOpen(true);
                      }}
                      className="mt-4"
                      size="sm"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Set a Reminder
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Reminders
                      </h3>
                      <Button
                        onClick={() => {
                          setEditingReminder(null);
                          setIsReminderDialogOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Add Reminder
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {userRiskReminders.map((reminder) => (
                        <div
                          key={reminder.$id}
                          className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {reminder.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(reminder.datetime).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-gray-700">
                              {reminder.description}
                            </p>
                            {reminder.recurrence !== "none" && (
                              <Badge variant="outline" className="mt-1">
                                Repeats {reminder.recurrence}
                              </Badge>
                            )}
                          </div>
                          {isRiskCreator && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditReminder(reminder)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteReminder(reminder.$id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="analysis" className="mt-6">
            {user ? (
              <RiskAnalysisPanel riskId={risk.$id} userId={user.$id} />
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <p className="text-yellow-800">
                    Please log in to use the AI analysis feature.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RiskDetail;
