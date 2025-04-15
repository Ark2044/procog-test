"use client";
import React, {
  useReducer,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
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
import { useRiskStore } from "@/store/Risk";
import { validateString } from "@/lib/validation";

// State interface
interface RiskState {
  title: string;
  content: string;
  tags: string[];
  file: File | null;
  impact: "low" | "medium" | "high";
  probability: number;
  action: "mitigate" | "accept" | "transfer" | "avoid";
  mitigation: string;
  acceptance: string;
  transfer: string;
  avoidance: string;
  error: string | null;
  showTooltip: boolean;
  remainingChars: number;
  isConfidential: boolean;
  authorizedViewers: string[];
  includeReminder: boolean;
  reminderDate: Date;
  reminderRecurrence: "none" | "daily" | "weekly" | "monthly";
  dueDate: Date | null;
  availableUsers: Array<{ $id: string; name: string }>;
  activeTab: "basic" | "assessment" | "settings";
  isPreviewingMitigation: boolean;
  isPreviewingAcceptance: boolean;
  isPreviewingTransfer: boolean;
  isPreviewingAvoidance: boolean;
  titleCharCount: number;
  reminderTitle: string;
  reminderDescription: string;
}

// Initial state
const initialState: RiskState = {
  title: "",
  content: "",
  tags: [],
  file: null,
  impact: "low",
  probability: 3,
  action: "mitigate",
  mitigation: "",
  acceptance: "",
  transfer: "",
  avoidance: "",
  error: null,
  showTooltip: false,
  remainingChars: 500,
  isConfidential: false,
  authorizedViewers: [],
  includeReminder: false,
  reminderDate: new Date(),
  reminderRecurrence: "none",
  dueDate: null,
  availableUsers: [],
  activeTab: "basic",
  isPreviewingMitigation: false,
  isPreviewingAcceptance: false,
  isPreviewingTransfer: false,
  isPreviewingAvoidance: false,
  titleCharCount: 0,
  reminderTitle: "",
  reminderDescription: "",
};

// Action types
type Action =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_TAGS"; payload: string[] }
  | { type: "SET_FILE"; payload: File | null }
  | { type: "SET_IMPACT"; payload: "low" | "medium" | "high" }
  | { type: "SET_PROBABILITY"; payload: number }
  | {
      type: "SET_ACTION";
      payload: "mitigate" | "accept" | "transfer" | "avoid";
    }
  | { type: "SET_MITIGATION"; payload: string }
  | { type: "SET_ACCEPTANCE"; payload: string }
  | { type: "SET_TRANSFER"; payload: string }
  | { type: "SET_AVOIDANCE"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SHOW_TOOLTIP"; payload: boolean }
  | { type: "SET_IS_CONFIDENTIAL"; payload: boolean }
  | { type: "SET_AUTHORIZED_VIEWERS"; payload: string[] }
  | { type: "SET_INCLUDE_REMINDER"; payload: boolean }
  | { type: "SET_REMINDER_DATE"; payload: Date }
  | {
      type: "SET_REMINDER_RECURRENCE";
      payload: "none" | "daily" | "weekly" | "monthly";
    }
  | { type: "SET_DUE_DATE"; payload: Date | null }
  | {
      type: "SET_AVAILABLE_USERS";
      payload: Array<{ $id: string; name: string }>;
    }
  | { type: "SET_ACTIVE_TAB"; payload: "basic" | "assessment" | "settings" }
  | { type: "SET_IS_PREVIEWING_MITIGATION"; payload: boolean }
  | { type: "SET_IS_PREVIEWING_ACCEPTANCE"; payload: boolean }
  | { type: "SET_IS_PREVIEWING_TRANSFER"; payload: boolean }
  | { type: "SET_IS_PREVIEWING_AVOIDANCE"; payload: boolean }
  | { type: "SET_TITLE_CHAR_COUNT"; payload: number }
  | { type: "SET_REMINDER_TITLE"; payload: string }
  | { type: "SET_REMINDER_DESCRIPTION"; payload: string }
  | { type: "RESET" };

// Reducer function
const riskReducer = (state: RiskState, action: Action): RiskState => {
  switch (action.type) {
    case "SET_TITLE":
      return {
        ...state,
        title: action.payload,
        titleCharCount: action.payload.length,
      };
    case "SET_CONTENT":
      return {
        ...state,
        content: action.payload,
        remainingChars: 500 - action.payload.length,
      };
    case "SET_TAGS":
      return { ...state, tags: action.payload };
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_IMPACT":
      return { ...state, impact: action.payload };
    case "SET_PROBABILITY":
      return { ...state, probability: action.payload };
    case "SET_ACTION":
      return { ...state, action: action.payload };
    case "SET_MITIGATION":
      return { ...state, mitigation: action.payload };
    case "SET_ACCEPTANCE":
      return { ...state, acceptance: action.payload };
    case "SET_TRANSFER":
      return { ...state, transfer: action.payload };
    case "SET_AVOIDANCE":
      return { ...state, avoidance: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SHOW_TOOLTIP":
      return { ...state, showTooltip: action.payload };
    case "SET_IS_CONFIDENTIAL":
      return { ...state, isConfidential: action.payload };
    case "SET_AUTHORIZED_VIEWERS":
      return { ...state, authorizedViewers: action.payload };
    case "SET_INCLUDE_REMINDER":
      return { ...state, includeReminder: action.payload };
    case "SET_REMINDER_DATE":
      return { ...state, reminderDate: action.payload };
    case "SET_REMINDER_RECURRENCE":
      return { ...state, reminderRecurrence: action.payload };
    case "SET_DUE_DATE":
      return { ...state, dueDate: action.payload };
    case "SET_AVAILABLE_USERS":
      return { ...state, availableUsers: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_IS_PREVIEWING_MITIGATION":
      return { ...state, isPreviewingMitigation: action.payload };
    case "SET_IS_PREVIEWING_ACCEPTANCE":
      return { ...state, isPreviewingAcceptance: action.payload };
    case "SET_IS_PREVIEWING_TRANSFER":
      return { ...state, isPreviewingTransfer: action.payload };
    case "SET_IS_PREVIEWING_AVOIDANCE":
      return { ...state, isPreviewingAvoidance: action.payload };
    case "SET_TITLE_CHAR_COUNT":
      return { ...state, titleCharCount: action.payload };
    case "SET_REMINDER_TITLE":
      return { ...state, reminderTitle: action.payload };
    case "SET_REMINDER_DESCRIPTION":
      return { ...state, reminderDescription: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// Component
const CreateRisk: React.FC<{ onRiskCreated: () => void }> = ({
  onRiskCreated,
}) => {
  const [state, dispatch] = useReducer(riskReducer, initialState);
  const { user } = useAuthStore();
  const { addReminder } = useReminderStore();
  const { createRisk, loading: isCreating } = useRiskStore();
  const mitigationTextareaRef = useRef<HTMLTextAreaElement>(null);
  const acceptanceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const transferTextareaRef = useRef<HTMLTextAreaElement>(null);
  const avoidanceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Define the steps array
  const steps = ["basic", "assessment", "settings"] as const;

  // Compute step completion status
  const stepCompletion = {
    basic: state.title.trim() !== "" && state.content.trim() !== "",
    assessment:
      !!state.impact &&
      !!state.action &&
      ((state.action === "mitigate" && state.mitigation.trim() !== "") ||
        (state.action === "accept" && state.acceptance.trim() !== "") ||
        (state.action === "transfer" && state.transfer.trim() !== "") ||
        (state.action === "avoid" && state.avoidance.trim() !== "")),
    settings:
      !state.isConfidential ||
      (state.isConfidential && state.authorizedViewers.length > 0),
  };

  // Determine if a step is clickable (can navigate to it)
  const isStepClickable = (step: (typeof steps)[number]): boolean => {
    const stepIndex = steps.indexOf(step);
    return (
      stepIndex === 0 ||
      steps.slice(0, stepIndex).every((s) => stepCompletion[s])
    );
  };

  // Check if all steps are complete for submission
  const allStepsComplete = steps.every((step) => stepCompletion[step]);

  // Fetch available users when confidentiality is toggled
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/listUsers");
        const data = await response.json();
        dispatch({ type: "SET_AVAILABLE_USERS", payload: data.users });
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    if (state.isConfidential) {
      fetchUsers();
    }
  }, [state.isConfidential]);

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    dispatch({ type: "SET_FILE", payload: selectedFile });
  };

  // Validate form fields before submission
  const validateFields = (): boolean => {
    // Use validateString for title and content
    const titleValidation = validateString(state.title, "Title", {
      required: true,
      minLength: 3,
      maxLength: 100,
    });

    if (!titleValidation.isValid) {
      toast.error(titleValidation.error || "Invalid title");
      return false;
    }

    const contentValidation = validateString(state.content, "Description", {
      required: true,
      minLength: 10,
      maxLength: 500,
    });

    if (!contentValidation.isValid) {
      toast.error(contentValidation.error || "Invalid description");
      return false;
    }

    // Validate action-specific fields
    if (state.action === "mitigate") {
      const mitigationValidation = validateString(
        state.mitigation,
        "Mitigation strategy",
        {
          required: true,
          minLength: 10,
        }
      );

      if (!mitigationValidation.isValid) {
        toast.error(mitigationValidation.error || "An unknown error occurred");
        return false;
      }
    }

    if (state.action === "accept") {
      const acceptanceValidation = validateString(
        state.acceptance,
        "Acceptance rationale",
        {
          required: true,
          minLength: 10,
        }
      );

      if (!acceptanceValidation.isValid) {
        toast.error(acceptanceValidation.error || "An unknown error occurred");
        return false;
      }
    }

    if (state.action === "transfer") {
      const transferValidation = validateString(
        state.transfer,
        "Transfer strategy",
        {
          required: true,
          minLength: 10,
        }
      );

      if (!transferValidation.isValid) {
        toast.error(transferValidation.error || "An unknown error occurred");
        return false;
      }
    }

    if (state.action === "avoid") {
      const avoidanceValidation = validateString(
        state.avoidance,
        "Avoidance approach",
        {
          required: true,
          minLength: 10,
        }
      );

      if (!avoidanceValidation.isValid) {
        toast.error(avoidanceValidation.error || "An unknown error occurred");
        return false;
      }
    }

    // Validate authorized viewers for confidential risks
    if (state.isConfidential && state.authorizedViewers.length === 0) {
      toast.error("Authorized viewers are required for confidential risks");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    // Always prevent default form submission behavior
    e.preventDefault();

    // Only proceed with form submission if this was triggered by the submit button
    const submitter = (e.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | HTMLInputElement;
    if (submitter?.type !== "submit") {
      return;
    }

    // Validate form before submission
    dispatch({ type: "SET_ERROR", payload: null });
    if (!validateFields()) {
      return;
    }

    try {
      if (!user) {
        toast.error("User is not logged in");
        return;
      }
      const risk = await createRisk({
        title: state.title,
        content: state.content,
        authorId: user.$id,
        authorName: user.name || "Anonymous",
        tags: state.tags,
        file: state.file || undefined,
        impact: state.impact,
        probability: state.probability,
        action: state.action,
        mitigation: state.mitigation,
        acceptance: state.acceptance,
        transfer: state.transfer,
        avoidance: state.avoidance,
        department: user.prefs?.department,
        isConfidential: state.isConfidential,
        authorizedViewers: state.authorizedViewers,
        dueDate: state.dueDate || undefined,
      });
      if (state.includeReminder) {
        await addReminder({
          title: state.reminderTitle || `Risk Review: ${state.title}`,
          description:
            state.reminderDescription || `Time to review risk: ${state.title}`,
          datetime: state.reminderDate.toISOString(),
          userId: user.$id,
          riskId: risk.$id,
          recurrence: state.reminderRecurrence,
          status: "pending",
        });
      }
      dispatch({ type: "RESET" });
      onRiskCreated();
    } catch (err) {
      if (err instanceof Error) {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to create risk: " + err.message,
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to create risk: An unknown error occurred",
        });
      }
      console.error(err);
    }
  };

  // Utility function to insert markdown
  const insertMarkdown = (
    markdownSyntax: string,
    content: string,
    setContent: (value: string) => void,
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
      newCursorPos =
        start +
        (markdownSyntax.includes("$1")
          ? markdownSyntax.indexOf("$1") + placeholder.length
          : markdownSyntax.length);
    }
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Markdown insertion functions for each strategy
  const insertMitigationMarkdown = (
    markdownSyntax: string,
    selectionReplacement: string | null = null
  ) => {
    insertMarkdown(
      markdownSyntax,
      state.mitigation,
      (value) => dispatch({ type: "SET_MITIGATION", payload: value }),
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
      state.acceptance,
      (value) => dispatch({ type: "SET_ACCEPTANCE", payload: value }),
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
      state.transfer,
      (value) => dispatch({ type: "SET_TRANSFER", payload: value }),
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
      state.avoidance,
      (value) => dispatch({ type: "SET_AVOIDANCE", payload: value }),
      avoidanceTextareaRef,
      selectionReplacement
    );
  };

  // Risk Strategy Editor component
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
    setStrategy: (value: string) => void;
    isPreviewingStrategy: boolean;
    setIsPreviewingStrategy: (value: boolean) => void;
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
        className="text-gray-800 font-semibold mb-2 flex items-center"
      >
        {label}{" "}
        <span className="text-red-500 ml-1" aria-hidden="true">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </label>
      <div className="bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-200 p-2 bg-gray-50">
          <div className="flex gap-2">
            <Button
              variant={isPreviewingStrategy ? "outline" : "default"}
              size="sm"
              onClick={() => setIsPreviewingStrategy(false)}
              aria-label="Write mode"
            >
              Write
            </Button>
            <Button
              variant={isPreviewingStrategy ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreviewingStrategy(true)}
              aria-label="Preview mode"
            >
              Preview
            </Button>
          </div>
          {!isPreviewingStrategy && (
            <div className="flex gap-1 p-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertStrategyMarkdown("**$1**")}
                      className="h-8 w-8 p-0"
                      aria-label="Bold text"
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
                      className="h-8 w-8 p-0"
                      aria-label="Italic text"
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
                      className="h-8 w-8 p-0"
                      aria-label="Insert link"
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
                      className="h-8 w-8 p-0"
                      aria-label="Insert list"
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
                      className="h-8 w-8 p-0"
                      aria-label="Insert quote"
                    >
                      <QuoteIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quote</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        {isPreviewingStrategy ? (
          <div className="prose max-w-none min-h-[100px] p-3 bg-gray-50">
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
            rows={4}
            className="border-0 focus:ring-0 resize-none text-gray-800"
            required
            aria-required="true"
          />
        )}
      </div>
      <p className="text-xs text-gray-600 mt-1">
        Supports Markdown formatting for rich text
      </p>
    </div>
  );

  // Render Basic Form
  const renderBasicForm = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <FileText className="mr-2 text-gray-500" aria-hidden="true" /> Title
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <input
          type="text"
          id="title"
          value={state.title}
          onChange={(e) =>
            dispatch({ type: "SET_TITLE", payload: e.target.value })
          }
          required
          className="border border-gray-300 p-3 w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          placeholder="Enter risk title"
          maxLength={100}
          aria-describedby="title-char-count"
        />
        <p
          id="title-char-count"
          className={`text-xs mt-1 ${
            state.titleCharCount > 80 ? "text-red-500" : "text-gray-500"
          }`}
        >
          {state.titleCharCount}/100 characters
        </p>
      </div>
      <div>
        <label
          htmlFor="content"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <FileDigit className="mr-2 text-gray-500" aria-hidden="true" />{" "}
          Description
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <textarea
          id="content"
          value={state.content}
          onChange={(e) =>
            dispatch({ type: "SET_CONTENT", payload: e.target.value })
          }
          required
          className="border border-gray-300 p-3 w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
          placeholder="Describe the risk in detail"
          maxLength={500}
          rows={5}
          aria-describedby="content-char-count"
        />
        <p
          id="content-char-count"
          className={`text-xs mt-1 ${
            state.remainingChars < 50 ? "text-red-500" : "text-gray-500"
          }`}
        >
          {state.remainingChars}/500 characters remaining
        </p>
      </div>
      <div>
        <label
          htmlFor="tags"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <Tag className="mr-2 text-gray-500" aria-hidden="true" /> Tags
        </label>
        <input
          type="text"
          id="tags"
          value={state.tags.join(", ")}
          onChange={(e) =>
            dispatch({
              type: "SET_TAGS",
              payload: e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            })
          }
          className="border border-gray-300 p-3 w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          placeholder="e.g., security, compliance, technical"
          aria-describedby="tags-help"
        />
        <p id="tags-help" className="text-xs text-gray-500 mt-1">
          Separate tags with commas
        </p>
      </div>
      <div>
        <label
          htmlFor="file"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <Upload className="mr-2 text-gray-500" aria-hidden="true" />{" "}
          Attachment
          <span className="text-gray-500 ml-1">(optional)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="border border-gray-300 p-2 w-full rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            aria-describedby="file-status"
          />
          {state.file && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "SET_FILE", payload: null })}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Remove attachment"
            >
              <X size={16} />
            </Button>
          )}
        </div>
        {state.file && (
          <p
            id="file-status"
            className="text-xs text-gray-500 mt-1 flex items-center"
          >
            <CheckCircle className="mr-1 text-green-500" size={12} />{" "}
            {state.file.name}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="dueDate"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <Calendar className="mr-2 text-gray-500" aria-hidden="true" /> Due
          Date
        </label>
        <DatePicker
          selected={state.dueDate}
          onChange={(date) => dispatch({ type: "SET_DUE_DATE", payload: date })}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          minDate={new Date()}
          placeholderText="Select due date and time"
        />
      </div>
    </div>
  );

  // Render Assessment Form
  const renderAssessmentForm = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="impact"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <Activity className="mr-2 text-gray-500" aria-hidden="true" /> Impact
        </label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            {
              value: "low",
              color: "bg-green-100 border-green-500 text-green-700",
              label: "Low",
            },
            {
              value: "medium",
              color: "bg-yellow-100 border-yellow-500 text-yellow-700",
              label: "Medium",
            },
            {
              value: "high",
              color: "bg-red-100 border-red-500 text-red-700",
              label: "High",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_IMPACT",
                  payload: option.value as "low" | "medium" | "high",
                })
              }
              className={`py-3 px-4 border-2 rounded-md flex items-center justify-center font-medium transition-all shadow-sm
                ${
                  state.impact === option.value
                    ? option.color + " border-2"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              aria-pressed={state.impact === option.value}
            >
              {option.value === "low" && <span className="mr-2">●</span>}
              {option.value === "medium" && <span className="mr-2">●●</span>}
              {option.value === "high" && <span className="mr-2">●●●</span>}
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label
          htmlFor="probability"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <AlertTriangle className="mr-2 text-gray-500" aria-hidden="true" />{" "}
          Probability
        </label>
        <div className="mt-2">
          <div className="flex items-center gap-4">
            <div className="w-full">
              <input
                type="range"
                id="probability"
                min="0"
                max="5"
                value={state.probability}
                onChange={(e) =>
                  dispatch({
                    type: "SET_PROBABILITY",
                    payload: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={state.probability}
                aria-label="Probability slider (0% to 100%)"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
                <span>80%</span>
                <span>100%</span>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base shadow-sm
                ${
                  state.probability <= 1
                    ? "bg-green-100 text-green-700"
                    : state.probability <= 3
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {state.probability * 20}%
            </div>
          </div>
        </div>
      </div>
      <div>
        <label
          htmlFor="action"
          className="text-gray-800 font-semibold mb-2 flex items-center"
        >
          <Shield className="mr-2 text-gray-500" aria-hidden="true" /> Risk
          Response
        </label>
        <div className="grid grid-cols-2 gap-4 mt-2">
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
                dispatch({
                  type: "SET_ACTION",
                  payload: option.value as
                    | "mitigate"
                    | "accept"
                    | "transfer"
                    | "avoid",
                })
              }
              className={`p-4 border-2 rounded-md flex flex-col items-center text-center transition-all shadow-sm
                ${
                  state.action === option.value
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              aria-pressed={state.action === option.value}
            >
              <div
                className={`p-2 rounded-full ${
                  state.action === option.value ? "bg-blue-100" : "bg-gray-100"
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
      {state.action === "mitigate" && (
        <RiskStrategyEditor
          strategy={state.mitigation}
          setStrategy={(value) =>
            dispatch({ type: "SET_MITIGATION", payload: value })
          }
          isPreviewingStrategy={state.isPreviewingMitigation}
          setIsPreviewingStrategy={(value) =>
            dispatch({ type: "SET_IS_PREVIEWING_MITIGATION", payload: value })
          }
          textareaRef={mitigationTextareaRef}
          insertStrategyMarkdown={insertMitigationMarkdown}
          label="Mitigation Strategy"
          placeholder="Describe how you plan to reduce this risk"
        />
      )}
      {state.action === "accept" && (
        <RiskStrategyEditor
          strategy={state.acceptance}
          setStrategy={(value) =>
            dispatch({ type: "SET_ACCEPTANCE", payload: value })
          }
          isPreviewingStrategy={state.isPreviewingAcceptance}
          setIsPreviewingStrategy={(value) =>
            dispatch({ type: "SET_IS_PREVIEWING_ACCEPTANCE", payload: value })
          }
          textareaRef={acceptanceTextareaRef}
          insertStrategyMarkdown={insertAcceptanceMarkdown}
          label="Acceptance Rationale"
          placeholder="Explain why accepting this risk is appropriate"
        />
      )}
      {state.action === "transfer" && (
        <RiskStrategyEditor
          strategy={state.transfer}
          setStrategy={(value) =>
            dispatch({ type: "SET_TRANSFER", payload: value })
          }
          isPreviewingStrategy={state.isPreviewingTransfer}
          setIsPreviewingStrategy={(value) =>
            dispatch({ type: "SET_IS_PREVIEWING_TRANSFER", payload: value })
          }
          textareaRef={transferTextareaRef}
          insertStrategyMarkdown={insertTransferMarkdown}
          label="Transfer Mechanism"
          placeholder="Detail how the risk will be transferred"
        />
      )}
      {state.action === "avoid" && (
        <RiskStrategyEditor
          strategy={state.avoidance}
          setStrategy={(value) =>
            dispatch({ type: "SET_AVOIDANCE", payload: value })
          }
          isPreviewingStrategy={state.isPreviewingAvoidance}
          setIsPreviewingStrategy={(value) =>
            dispatch({ type: "SET_IS_PREVIEWING_AVOIDANCE", payload: value })
          }
          textareaRef={avoidanceTextareaRef}
          insertStrategyMarkdown={insertAvoidanceMarkdown}
          label="Avoidance Approach"
          placeholder="Describe how you will eliminate this risk"
        />
      )}
    </div>
  );

  // Render Settings Form
  const renderSettingsForm = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-md border-l-4 border-blue-500 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Finalize Your Risk Entry
        </h3>
        <p className="text-sm text-gray-600">
          Set access control and reminders before submission
        </p>
      </div>
      <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-100 p-2 rounded-full">
            <Lock className="text-indigo-600" size={18} aria-hidden="true" />
          </div>
          <h4 className="font-medium text-gray-800">Access Control</h4>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "SET_IS_CONFIDENTIAL",
                payload: !state.isConfidential,
              })
            }
            className="flex items-center gap-3 focus:outline-none"
            aria-pressed={state.isConfidential}
          >
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="confidential"
                checked={state.isConfidential}
                onChange={(e) =>
                  dispatch({
                    type: "SET_IS_CONFIDENTIAL",
                    payload: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div
                className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors duration-200 ease-in-out cursor-pointer"
                role="switch"
                aria-checked={state.isConfidential}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    state.isConfidential ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
            <span className="text-gray-800 cursor-pointer">
              Mark as Confidential
            </span>
          </button>
        </div>
        {state.isConfidential && (
          <div className="ml-10 p-4 bg-gray-50 rounded-md border border-gray-200">
            <label
              htmlFor="authorizedViewers"
              className="text-gray-800 font-medium mb-2 flex items-center"
            >
              <Users
                className="mr-2 text-gray-500"
                size={16}
                aria-hidden="true"
              />{" "}
              Authorized Viewers
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </label>
            <select
              id="authorizedViewers"
              multiple
              className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={state.authorizedViewers}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                dispatch({ type: "SET_AUTHORIZED_VIEWERS", payload: selected });
              }}
              size={4}
              required={state.isConfidential}
              aria-required={state.isConfidential}
              aria-describedby="authorized-viewers-help"
            >
              {state.availableUsers.map((user) => (
                <option key={user.$id} value={user.$id}>
                  {user.name}
                </option>
              ))}
            </select>
            <p
              id="authorized-viewers-help"
              className="text-xs text-gray-500 mt-1 flex items-center"
            >
              <Info size={12} className="mr-1" aria-hidden="true" /> Use
              Ctrl/Cmd to select multiple users
            </p>
          </div>
        )}
      </div>
      <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-full">
            <Bell className="text-amber-600" size={18} aria-hidden="true" />
          </div>
          <h4 className="font-medium text-gray-800">Reminder Settings</h4>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "SET_INCLUDE_REMINDER",
                payload: !state.includeReminder,
              })
            }
            className="flex items-center gap-3 focus:outline-none"
            aria-pressed={state.includeReminder}
          >
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="includeReminder"
                checked={state.includeReminder}
                onChange={(e) =>
                  dispatch({
                    type: "SET_INCLUDE_REMINDER",
                    payload: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div
                className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors duration-200 ease-in-out cursor-pointer"
                role="switch"
                aria-checked={state.includeReminder}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    state.includeReminder ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
            <span className="text-gray-800 cursor-pointer">
              Set Review Reminder
            </span>
          </button>
        </div>
        {state.includeReminder && (
          <div className="ml-10 p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
            <div>
              <label
                htmlFor="reminderTitle"
                className="text-gray-800 font-medium mb-2 flex items-center"
              >
                <FileText
                  className="mr-2 text-gray-500"
                  size={16}
                  aria-hidden="true"
                />{" "}
                Reminder Title
              </label>
              <input
                type="text"
                id="reminderTitle"
                value={state.reminderTitle}
                onChange={(e) =>
                  dispatch({
                    type: "SET_REMINDER_TITLE",
                    payload: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Enter reminder title"
              />
            </div>
            <div>
              <label
                htmlFor="reminderDescription"
                className="text-gray-800 font-medium mb-2 flex items-center"
              >
                <FileDigit
                  className="mr-2 text-gray-500"
                  size={16}
                  aria-hidden="true"
                />{" "}
                Reminder Description
              </label>
              <textarea
                id="reminderDescription"
                value={state.reminderDescription}
                onChange={(e) =>
                  dispatch({
                    type: "SET_REMINDER_DESCRIPTION",
                    payload: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                placeholder="Enter reminder description"
                rows={3}
              />
            </div>
            <div>
              <label
                htmlFor="reminderDate"
                className="text-gray-800 font-medium mb-2 flex items-center"
              >
                <Calendar
                  className="mr-2 text-gray-500"
                  size={16}
                  aria-hidden="true"
                />{" "}
                Review Date
              </label>
              <DatePicker
                id="reminderDate"
                selected={state.reminderDate}
                onChange={(date) =>
                  dispatch({
                    type: "SET_REMINDER_DATE",
                    payload: date || new Date(),
                  })
                }
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                minDate={new Date()}
                placeholderText="Select reminder date and time"
              />
            </div>
            <div>
              <label className="text-gray-800 font-medium mb-2 flex items-center">
                <Repeat
                  className="mr-2 text-gray-500"
                  size={16}
                  aria-hidden="true"
                />{" "}
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
                    onClick={() =>
                      dispatch({
                        type: "SET_REMINDER_RECURRENCE",
                        payload: option.value as
                          | "none"
                          | "daily"
                          | "weekly"
                          | "monthly",
                      })
                    }
                    className={`py-2 px-3 text-sm rounded-md transition-all shadow-sm
                      ${
                        state.reminderRecurrence === option.value
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    aria-pressed={state.reminderRecurrence === option.value}
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

  // Main render
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle
            className="text-yellow-500"
            size={24}
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold text-gray-800">
            Create Risk Entry
          </h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_SHOW_TOOLTIP",
                    payload: !state.showTooltip,
                  })
                }
                className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle information tooltip"
              >
                <Info size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Create a detailed risk entry with assessment and strategies
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <AnimatePresence>
        {state.showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-16 right-6 bg-white text-gray-800 p-4 rounded-lg shadow-lg z-10 w-72 border border-gray-200"
          >
            <p className="text-sm">
              Document risks with detailed information, impact assessment, and
              response strategies.
            </p>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_SHOW_TOOLTIP", payload: false })
              }
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              aria-label="Close tooltip"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-6 flex items-center gap-2"
          >
            <X className="text-red-500" size={18} aria-hidden="true" />
            <span>{state.error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((tab, index) => (
            <button
              key={tab}
              type="button"
              onClick={() =>
                isStepClickable(tab) &&
                dispatch({ type: "SET_ACTIVE_TAB", payload: tab })
              }
              disabled={!isStepClickable(tab)}
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                ${
                  stepCompletion[tab]
                    ? "bg-green-500 text-white"
                    : tab === state.activeTab
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }
                ${
                  !isStepClickable(tab)
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              aria-label={`Step ${index + 1}: ${
                tab.charAt(0).toUpperCase() + tab.slice(1)
              }, ${stepCompletion[tab] ? "complete" : "incomplete"}`}
              aria-current={tab === state.activeTab ? "step" : undefined}
            >
              {stepCompletion[tab] ? <CheckCircle size={20} /> : index + 1}
            </button>
          ))}
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{
              width:
                state.activeTab === "basic"
                  ? "33%"
                  : state.activeTab === "assessment"
                  ? "66%"
                  : "100%",
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Use a div instead of a form to prevent automatic form submissions */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px]"
          >
            {state.activeTab === "basic" && renderBasicForm()}
            {state.activeTab === "assessment" && renderAssessmentForm()}
            {state.activeTab === "settings" && renderSettingsForm()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 gap-4">
          {state.activeTab !== "basic" && (
            <Button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_ACTIVE_TAB",
                  payload:
                    state.activeTab === "assessment" ? "basic" : "assessment",
                })
              }
              variant="outline"
              className="w-32"
            >
              Previous
            </Button>
          )}

          {state.activeTab !== "settings" ? (
            <Button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_ACTIVE_TAB",
                  payload:
                    state.activeTab === "basic" ? "assessment" : "settings",
                })
              }
              className="w-32 ml-auto"
              disabled={!stepCompletion[state.activeTab]}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as unknown as FormEvent);
              }}
              className="w-32 ml-auto"
              disabled={!allStepsComplete || isCreating}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                  Creating
                </span>
              ) : (
                "Create Risk"
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateRisk;
