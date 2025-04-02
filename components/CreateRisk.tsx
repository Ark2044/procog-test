"use client";
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Upload,
  X,
  CheckCircle,
  Info,
  Tag,
  FileText,
  Calendar,
  Lock,
  Bell,
  Users,
  Repeat,
  Shield,
  FileDigit,
  BoldIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  QuoteIcon,
  HelpCircleIcon,
  Activity,
} from "lucide-react";
import { databases, storage } from "@/models/client/config";
import { riskCollection, db, riskAttachmentBucket } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useReminderStore } from "@/store/Reminder";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CreateRisk: React.FC<{ onRiskCreated: () => void }> = ({
  onRiskCreated,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | undefined>(
    undefined
  );
  const [impact, setImpact] = useState<"low" | "medium" | "high">("low");
  const [probability, setProbability] = useState<number>(3);
  const [action, setAction] = useState<
    "mitigate" | "accept" | "transfer" | "avoid"
  >("mitigate");
  const [mitigation, setMitigation] = useState("");
  const [acceptance, setAcceptance] = useState("");
  const [transfer, setTransfer] = useState("");
  const [avoidance, setAvoidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [remainingChars, setRemainingChars] = useState(500);
  const [isConfidential, setIsConfidential] = useState(false);
  const [authorizedViewers, setAuthorizedViewers] = useState<string[]>([]);
  const [includeReminder, setIncludeReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date>(new Date());
  const [reminderRecurrence, setReminderRecurrence] = useState<
    "none" | "daily" | "weekly" | "monthly"
  >("none");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const { user } = useAuthStore();
  const { addReminder } = useReminderStore();
  const [availableUsers, setAvailableUsers] = useState<
    Array<{ $id: string; name: string }>
  >([]);
  const [activeTab, setActiveTab] = useState<
    "basic" | "assessment" | "settings"
  >("basic");
  const [isPreviewingMitigation, setIsPreviewingMitigation] = useState(false);
  const [isPreviewingAcceptance, setIsPreviewingAcceptance] = useState(false);
  const [isPreviewingTransfer, setIsPreviewingTransfer] = useState(false);
  const [isPreviewingAvoidance, setIsPreviewingAvoidance] = useState(false);
  const mitigationTextareaRef = useRef<HTMLTextAreaElement>(null);
  const acceptanceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const transferTextareaRef = useRef<HTMLTextAreaElement>(null);
  const avoidanceTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/listUsers");
        const data = await response.json();
        setAvailableUsers(data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    if (isConfidential) {
      fetchUsers();
    }
  }, [isConfidential]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setRemainingChars(500 - newContent.length);
  };

  const validateFields = (): boolean => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Description are required");
      return false;
    }
    if (title.trim().length > 100) {
      toast.error("Title must be 100 characters or less");
      return false;
    }
    if (content.trim().length > 500) {
      toast.error("Description must be 500 characters or less");
      return false;
    }
    if (action === "mitigate" && !mitigation.trim()) {
      toast.error("Please provide mitigation strategies");
      return false;
    }
    if (action === "accept" && !acceptance.trim()) {
      toast.error("Please provide acceptance rationale");
      return false;
    }
    if (action === "transfer" && !transfer.trim()) {
      toast.error("Please provide transfer strategy");
      return false;
    }
    if (action === "avoid" && !avoidance.trim()) {
      toast.error("Please provide avoidance approach");
      return false;
    }
    if (
      isConfidential &&
      (!authorizedViewers || authorizedViewers.length === 0)
    ) {
      toast.error("Authorized viewers are required for confidential risks");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Only allow submission from the settings tab
    if (activeTab !== "settings") {
      return;
    }

    setError(null);
    if (!validateFields()) {
      return;
    }
    setLoading(true);

    try {
      if (!user) {
        toast.error("User is not logged in");
        setLoading(false);
        return;
      }
      const authorId = user.$id;
      const authorName = user.name || "Anonymous";
      const department = user.prefs?.department || "general";

      if (file) {
        const fileResponse = await storage.createFile(
          riskAttachmentBucket,
          "unique()",
          file
        );
        setAttachmentId(fileResponse.$id);
      }

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

      const riskResponse = await databases.createDocument(
        db,
        riskCollection,
        "unique()",
        {
          title,
          content,
          authorId,
          authorName,
          tags,
          attachmentId,
          impact,
          probability,
          action,
          ...strategyData,
          department,
          isConfidential,
          authorizedViewers: isConfidential ? authorizedViewers : [],
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          status: "active",
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        }
      );

      if (includeReminder) {
        await addReminder({
          title: `Risk Review: ${title}`,
          description: `Time to review risk: ${title}`,
          datetime: reminderDate.toISOString(),
          userId: user.$id,
          riskId: riskResponse.$id,
          recurrence: reminderRecurrence,
          status: "pending",
        });
      }

      toast.success("Risk created successfully!");
      onRiskCreated();

      setTitle("");
      setContent("");
      setTags([]);
      setFile(null);
      setAttachmentId(undefined);
      setImpact("low");
      setProbability(3);
      setAction("mitigate");
      setMitigation("");
      setAcceptance("");
      setTransfer("");
      setAvoidance("");
      setIsConfidential(false);
      setAuthorizedViewers([]);
      setRemainingChars(500);
      setIncludeReminder(false);
      setReminderDate(new Date());
      setReminderRecurrence("none");
      setDueDate(null);
      setActiveTab("basic");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Failed to create risk: " + err.message);
        toast.error("Failed to create risk: " + err.message);
      } else {
        setError("Failed to create risk: An unknown error occurred");
        toast.error("Failed to create risk: An unknown error occurred");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = () => {
    if (probability <= 1) return "text-green-500";
    if (probability <= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const insertMarkdown = (
    markdownSyntax: string,
    content: string,
    setContent: React.Dispatch<React.SetStateAction<string>>,
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    selectionReplacement: string | null = null
  ) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newContent = "";
    let newCursorPos = 0;

    if (selectedText) {
      const replacement = selectionReplacement || selectedText;
      newContent =
        content.substring(0, start) +
        markdownSyntax.replace("$1", replacement) +
        content.substring(end);

      newCursorPos = start + markdownSyntax.replace("$1", replacement).length;
    } else {
      const placeholder = selectionReplacement || "text";
      newContent =
        content.substring(0, start) +
        markdownSyntax.replace("$1", placeholder) +
        content.substring(end);

      if (markdownSyntax.includes("$1")) {
        newCursorPos =
          start + markdownSyntax.indexOf("$1") + placeholder.length;
      } else {
        newCursorPos = start + markdownSyntax.length;
      }
    }

    setContent(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertMitigationMarkdown = (
    markdownSyntax: string,
    selectionReplacement: string | null = null
  ) => {
    insertMarkdown(
      markdownSyntax,
      mitigation,
      setMitigation,
      mitigationTextareaRef,
      selectionReplacement
    );
  };

  const insertAcceptanceMarkdown = (
    markdownSyntax: string,
    selectionReplacement: string | null = null
  ) => {
    insertMarkdown(
      markdownSyntax,
      acceptance,
      setAcceptance,
      acceptanceTextareaRef,
      selectionReplacement
    );
  };

  const insertTransferMarkdown = (
    markdownSyntax: string,
    selectionReplacement: string | null = null
  ) => {
    insertMarkdown(
      markdownSyntax,
      transfer,
      setTransfer,
      transferTextareaRef,
      selectionReplacement
    );
  };

  const insertAvoidanceMarkdown = (
    markdownSyntax: string,
    selectionReplacement: string | null = null
  ) => {
    insertMarkdown(
      markdownSyntax,
      avoidance,
      setAvoidance,
      avoidanceTextareaRef,
      selectionReplacement
    );
  };

  const RiskStrategyEditor = ({
    strategy,
    setStrategy,
    isPreviewingStrategy,
    setIsPreviewingStrategy,
    textareaRef,
    insertStrategyMarkdown,
    label,
    placeholder,
  }: {
    strategy: string;
    setStrategy: React.Dispatch<React.SetStateAction<string>>;
    isPreviewingStrategy: boolean;
    setIsPreviewingStrategy: React.Dispatch<React.SetStateAction<boolean>>;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    insertStrategyMarkdown: (
      markdownSyntax: string,
      selectionReplacement?: string | null
    ) => void;
    label: string;
    placeholder: string;
  }) => (
    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
      <label
        htmlFor={label.toLowerCase().replace(/\s+/g, "-")}
        className="text-gray-800 font-semibold mb-2 block"
      >
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
        <div className="flex justify-between items-center border-b p-2">
          <div className="flex gap-2">
            <Button
              variant={isPreviewingStrategy ? "outline" : "default"}
              size="sm"
              onClick={() => setIsPreviewingStrategy(false)}
            >
              Write
            </Button>
            <Button
              variant={isPreviewingStrategy ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreviewingStrategy(true)}
            >
              Preview
            </Button>
          </div>

          {!isPreviewingStrategy && (
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertStrategyMarkdown("**$1**")}
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
                      onClick={() => insertStrategyMarkdown("*$1*")}
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
                      onClick={() => insertStrategyMarkdown("[$1](url)")}
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
                      onClick={() => insertStrategyMarkdown("- $1")}
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
                      onClick={() => insertStrategyMarkdown("> $1")}
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

        {isPreviewingStrategy ? (
          <div className="prose max-w-none min-h-[100px] p-3 bg-gray-50 rounded-md">
            {strategy ? (
              <ReactMarkdown>{strategy}</ReactMarkdown>
            ) : (
              <p className="text-gray-400">Nothing to preview</p>
            )}
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            id={label.toLowerCase().replace(/\s+/g, "-")}
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="border-0 focus:ring-0"
          />
        )}
      </div>

      <p className="text-xs text-gray-600 mt-1">
        Detail specific {label.toLowerCase()} approach. Markdown formatting is
        supported.
      </p>
    </div>
  );

  const renderBasicForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <FileText className="mr-2 text-gray-500" /> Title{" "}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Enter risk title"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">Max 100 characters</p>
        </div>

        <div>
          <label
            htmlFor="content"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <FileDigit className="mr-2 text-gray-500" /> Description{" "}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            required
            className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Enter risk description"
            maxLength={500}
            rows={4}
          />
          <p
            className={`text-xs mt-1 ${
              remainingChars < 50 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {remainingChars} characters remaining
          </p>
        </div>

        <div>
          <label
            htmlFor="tags"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <Tag className="mr-2 text-gray-500" /> Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tags.join(",")}
            onChange={(e) =>
              setTags(e.target.value.split(",").map((tag) => tag.trim()))
            }
            className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Enter tags separated by commas"
          />
          <p className="text-xs text-gray-500 mt-1">
            E.g., security, compliance, technical
          </p>
        </div>

        <div>
          <label
            htmlFor="file"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <Upload className="mr-2 text-gray-500" /> Attachment (optional)
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {file && <CheckCircle className="ml-2 text-green-500" />}
          </div>
          {file && (
            <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <Calendar className="mr-2 text-gray-500" /> Due Date
          </label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            minDate={new Date()}
            placeholderText="Select due date and time"
          />
        </div>
      </div>
    );
  };

  const renderAssessmentForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <label
            htmlFor="impact"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <Activity className="mr-2 text-gray-500" /> Impact
          </label>
          <select
            id="impact"
            value={impact}
            onChange={(e) =>
              setImpact(e.target.value as "low" | "medium" | "high")
            }
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
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <AlertTriangle className="mr-2 text-gray-500" /> Probability
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="probability"
              min="0"
              max="5"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <span className={`font-medium text-lg ${getProbabilityColor()}`}>
              {probability * 20}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Unlikely</span>
            <span>Likely</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="action"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <Shield className="mr-2 text-gray-500" /> Risk Response
          </label>
          <select
            id="action"
            value={action}
            onChange={(e) =>
              setAction(
                e.target.value as "mitigate" | "accept" | "transfer" | "avoid"
              )
            }
            className="border border-gray-300 p-2 w-full rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="mitigate">Mitigate - Reduce the risk</option>
            <option value="accept">Accept - Take the risk</option>
            <option value="transfer">Transfer - Share the risk</option>
            <option value="avoid">Avoid - Eliminate the risk</option>
          </select>
        </div>

        {action === "mitigate" && (
          <RiskStrategyEditor
            strategy={mitigation}
            setStrategy={setMitigation}
            isPreviewingStrategy={isPreviewingMitigation}
            setIsPreviewingStrategy={setIsPreviewingMitigation}
            textareaRef={mitigationTextareaRef}
            insertStrategyMarkdown={insertMitigationMarkdown}
            label="Mitigation Strategy"
            placeholder="Describe how you plan to reduce this risk"
          />
        )}

        {action === "accept" && (
          <RiskStrategyEditor
            strategy={acceptance}
            setStrategy={setAcceptance}
            isPreviewingStrategy={isPreviewingAcceptance}
            setIsPreviewingStrategy={setIsPreviewingAcceptance}
            textareaRef={acceptanceTextareaRef}
            insertStrategyMarkdown={insertAcceptanceMarkdown}
            label="Acceptance Rationale"
            placeholder="Document the rationale for accepting this risk, including thresholds and monitoring approach"
          />
        )}

        {action === "transfer" && (
          <RiskStrategyEditor
            strategy={transfer}
            setStrategy={setTransfer}
            isPreviewingStrategy={isPreviewingTransfer}
            setIsPreviewingStrategy={setIsPreviewingTransfer}
            textareaRef={transferTextareaRef}
            insertStrategyMarkdown={insertTransferMarkdown}
            label="Transfer Mechanism"
            placeholder="Detail how the risk will be transferred (insurance, contracts, third parties)"
          />
        )}

        {action === "avoid" && (
          <RiskStrategyEditor
            strategy={avoidance}
            setStrategy={setAvoidance}
            isPreviewingStrategy={isPreviewingAvoidance}
            setIsPreviewingStrategy={setIsPreviewingAvoidance}
            textareaRef={avoidanceTextareaRef}
            insertStrategyMarkdown={insertAvoidanceMarkdown}
            label="Avoidance Approach"
            placeholder="Describe how you will eliminate this risk (process changes, activity termination)"
          />
        )}
      </div>
    );
  };

  const renderSettingsForm = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Additional Settings
          </h3>
          <p className="text-sm text-gray-600">
            Configure access control and reminder settings for this risk.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="text-gray-600" size={18} />
            <h4 className="font-medium text-gray-800">Access Control</h4>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="confidential"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="rounded border-gray-300 bg-white text-blue-500 w-4 h-4"
            />
            <label htmlFor="confidential" className="text-gray-800">
              Mark as Confidential
            </label>
          </div>

          {isConfidential && (
            <div className="ml-7">
              <label className="text-gray-800 font-medium mb-2 inline-flex items-center">
                <Users className="mr-2 text-gray-500" size={16} /> Authorized
                Viewers
              </label>
              <select
                multiple
                className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={authorizedViewers}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setAuthorizedViewers(selected);
                }}
                size={3}
              >
                {availableUsers.map((user) => (
                  <option key={user.$id} value={user.$id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple users
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="text-gray-600" size={18} />
            <h4 className="font-medium text-gray-800">Reminder Settings</h4>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="includeReminder"
              checked={includeReminder}
              onChange={(e) => setIncludeReminder(e.target.checked)}
              className="rounded border-gray-300 bg-white text-blue-500 w-4 h-4"
            />
            <label htmlFor="includeReminder" className="text-gray-800">
              Set Review Reminder
            </label>
          </div>

          {includeReminder && (
            <div className="space-y-4 ml-7">
              <div>
                <label className="block text-sm font-medium mb-1 items-center">
                  <Calendar className="mr-2 text-gray-500" size={16} /> Review
                  Date
                </label>
                <DatePicker
                  selected={reminderDate}
                  onChange={(date) => setReminderDate(date || new Date())}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minDate={new Date()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 items-center">
                  <Repeat className="mr-2 text-gray-500" size={16} /> Recurrence
                </label>
                <select
                  value={reminderRecurrence}
                  onChange={(e) =>
                    setReminderRecurrence(
                      e.target.value as "none" | "daily" | "weekly" | "monthly"
                    )
                  }
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">No recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-2xl mb-8 border border-gray-200 relative"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertTriangle className="mr-3 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Create Risk</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <Info size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 right-6 bg-white text-gray-800 p-4 rounded-lg shadow-lg z-10 w-64 border border-gray-200"
          >
            <p className="text-sm">
              Create a comprehensive risk entry with detailed information,
              impact assessment, and mitigation strategies.
            </p>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 flex items-center"
            >
              <X className="mr-2 text-red-500" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("basic");
              }}
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "basic"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("assessment");
              }}
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "assessment"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Assessment
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("settings");
              }}
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "basic" && renderBasicForm()}
            {activeTab === "assessment" && renderAssessmentForm()}
            {activeTab === "settings" && renderSettingsForm()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          {activeTab !== "basic" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(
                  activeTab === "assessment" ? "basic" : "assessment"
                );
              }}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>
          )}

          {activeTab !== "settings" ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(activeTab === "basic" ? "assessment" : "settings");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto flex items-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Creating...</span>
                </>
              ) : (
                "Create Risk"
              )}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default CreateRisk;
