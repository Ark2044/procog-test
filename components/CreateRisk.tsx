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
            <div className="flex gap-1 bg-gray-50 p-2 border-b">
              <div className="flex space-x-1 mr-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertStrategyMarkdown("**$1**")}
                        className="rounded-md h-8 w-8 p-0 flex items-center justify-center"
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
                        className="rounded-md h-8 w-8 p-0 flex items-center justify-center"
                      >
                        <ItalicIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Italic</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex space-x-1 mr-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertStrategyMarkdown("[$1](url)")}
                        className="rounded-md h-8 w-8 p-0 flex items-center justify-center"
                      >
                        <Link2Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertStrategyMarkdown("- $1")}
                        className="rounded-md h-8 w-8 p-0 flex items-center justify-center"
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
                        className="rounded-md h-8 w-8 p-0 flex items-center justify-center"
                      >
                        <QuoteIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Quote</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
            onChange={(date) => setDueDate(date || new Date())}
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
          <div className="flex gap-2 mt-2">
            {[
              {
                value: "low",
                color: "bg-green-100 border-green-500 text-green-700",
              },
              {
                value: "medium",
                color: "bg-yellow-100 border-yellow-500 text-yellow-700",
              },
              {
                value: "high",
                color: "bg-red-100 border-red-500 text-red-700",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setImpact(option.value as "low" | "medium" | "high")
                }
                className={`flex-1 py-2 px-4 border-2 rounded-lg flex items-center justify-center font-medium transition-all
          ${
            impact === option.value
              ? option.color + " border-2"
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
              >
                {option.value === "low" && <span className="mr-1">●</span>}
                {option.value === "medium" && <span className="mr-1">●●</span>}
                {option.value === "high" && <span className="mr-1">●●●</span>}
                {option.value.charAt(0).toUpperCase() + option.value.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label
            htmlFor="probability"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <AlertTriangle className="mr-2 text-gray-500" /> Probability
          </label>
          <div className="mt-2">
            <div className="flex items-center gap-4">
              <div className="w-full">
                <input
                  type="range"
                  id="probability"
                  min="0"
                  max="5"
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>0%</span>
                  <span>20%</span>
                  <span>40%</span>
                  <span>60%</span>
                  <span>80%</span>
                  <span>100%</span>
                </div>
              </div>
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                  probability <= 1
                    ? "bg-green-100 text-green-700"
                    : probability <= 3
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {probability * 20}%
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="action"
            className="text-gray-800 font-semibold mb-2 inline-flex items-center"
          >
            <Shield className="mr-2 text-gray-500" /> Risk Response
          </label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              {
                value: "mitigate",
                icon: <Repeat size={18} />,
                label: "Mitigate",
                description: "Reduce the risk",
              },
              {
                value: "accept",
                icon: <CheckCircle size={18} />,
                label: "Accept",
                description: "Take the risk",
              },
              {
                value: "transfer",
                icon: <Users size={18} />,
                label: "Transfer",
                description: "Share the risk",
              },
              {
                value: "avoid",
                icon: <X size={18} />,
                label: "Avoid",
                description: "Eliminate the risk",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setAction(
                    option.value as "mitigate" | "accept" | "transfer" | "avoid"
                  )
                }
                className={`p-3 border-2 rounded-lg flex flex-col items-center text-center transition-all
          ${
            action === option.value
              ? "bg-blue-50 border-blue-500 text-blue-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    action === option.value ? "bg-blue-100" : "bg-gray-100"
                  } mb-2`}
                >
                  {option.icon}
                </div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs mt-1 text-gray-500">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
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

  // Replace the settings form (around line 541)
  const renderSettingsForm = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Complete Your Risk Entry
          </h3>
          <p className="text-sm text-gray-600">
            Configure final access control and reminder settings before creating
            your risk.
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Lock className="text-indigo-600" size={18} />
            </div>
            <h4 className="font-medium text-gray-800">Access Control</h4>
          </div>

          <div className="flex items-center gap-3 mb-4 ml-2">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="confidential"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  isConfidential ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    isConfidential ? "translate-x-5" : "translate-x-1"
                  } shadow-sm`}
                />
              </div>
            </div>
            <label
              htmlFor="confidential"
              className="text-gray-800 cursor-pointer"
            >
              Mark as Confidential
            </label>
          </div>

          {isConfidential && (
            <div className="ml-10 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="text-gray-800 font-medium mb-2 inline-flex items-center">
                <Users className="mr-2 text-gray-500" size={16} /> Authorized
                Viewers <span className="text-red-500 ml-1">*</span>
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
                size={4}
              >
                {availableUsers.map((user) => (
                  <option key={user.$id} value={user.$id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Info size={12} className="mr-1" /> Hold Ctrl/Cmd to select
                multiple users
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <Bell className="text-amber-600" size={18} />
            </div>
            <h4 className="font-medium text-gray-800">Reminder Settings</h4>
          </div>

          <div className="flex items-center gap-3 mb-4 ml-2">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="includeReminder"
                checked={includeReminder}
                onChange={(e) => setIncludeReminder(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  includeReminder ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    includeReminder ? "translate-x-5" : "translate-x-1"
                  } shadow-sm`}
                />
              </div>
            </div>
            <label
              htmlFor="includeReminder"
              className="text-gray-800 cursor-pointer"
            >
              Set Review Reminder
            </label>
          </div>

          {includeReminder && (
            <div className="ml-10 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 items-center">
                  <Calendar className="mr-2 text-gray-500 inline" size={16} />{" "}
                  Review Date
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
                  customInput={
                    <input className="w-full p-2 bg-white border border-gray-300 rounded-md" />
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 items-center">
                  <Repeat className="mr-2 text-gray-500 inline" size={16} />{" "}
                  Recurrence
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "none", label: "None" },
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setReminderRecurrence(option.value as "none" | "daily" | "weekly" | "monthly")}
                      className={`py-2 px-3 text-sm text-center rounded ${
                        reminderRecurrence === option.value
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-white border border-gray-300 text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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
          <div className="flex items-center justify-between mb-4">
            {["basic", "assessment", "settings"].map((tab, index) => (
              <div key={tab} className="flex flex-col items-center w-1/3">
                <div
                  onClick={() => setActiveTab(tab as "basic" | "assessment" | "settings")}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 cursor-pointer
            ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : index < ["basic", "assessment", "settings"].indexOf(activeTab)
                ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                : "bg-gray-100 text-gray-400"
            }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    activeTab === tab ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </div>
            ))}
          </div>
          <div className="relative w-full h-1 bg-gray-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full transition-all duration-300"
              style={{
                width:
                  activeTab === "basic"
                    ? "33%"
                    : activeTab === "assessment"
                    ? "66%"
                    : "100%",
              }}
            />
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
