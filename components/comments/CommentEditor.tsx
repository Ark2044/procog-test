import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/Auth";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import {
  BoldIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  QuoteIcon,
  AtSignIcon,
  HelpCircleIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommentEditorProps {
  riskId: string;
  parentId?: string;
  onSubmit: (content: string) => void;
  placeholder?: string;
  initialContent?: string;
  submitLabel?: string;
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  initialContent = "",
  submitLabel = "Submit",
}) => {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthStore();

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent("");
      setIsPreview(false);
    }
  };

  const insertMarkdown = (
    markdownSyntax: string,
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
      // Text is selected
      const replacement = selectionReplacement || selectedText;
      newContent =
        content.substring(0, start) +
        markdownSyntax.replace("$1", replacement) +
        content.substring(end);

      newCursorPos = start + markdownSyntax.replace("$1", replacement).length;
    } else {
      // No text selected, just insert syntax at cursor
      const placeholder = selectionReplacement || "text";
      newContent =
        content.substring(0, start) +
        markdownSyntax.replace("$1", placeholder) +
        content.substring(end);

      // Position cursor in middle of inserted text if it has a placeholder
      if (markdownSyntax.includes("$1")) {
        newCursorPos =
          start + markdownSyntax.indexOf("$1") + placeholder.length;
      } else {
        newCursorPos = start + markdownSyntax.length;
      }
    }

    setContent(newContent);

    // Focus back on textarea and set cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  if (!user) return null;

  return (
    <div className="space-y-3 bg-white rounded-lg p-3 border border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-1">
          <Button
            variant={isPreview ? "outline" : "default"}
            size="sm"
            onClick={() => setIsPreview(false)}
          >
            Write
          </Button>
          <Button
            variant={isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(true)}
          >
            Preview
          </Button>
        </div>

        {!isPreview && (
          <div className="flex gap-0.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("**$1**")}
                    className="h-7 w-7 p-0"
                  >
                    <BoldIcon className="h-3.5 w-3.5" />
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
                    className="h-7 w-7 p-0"
                  >
                    <ItalicIcon className="h-3.5 w-3.5" />
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
                    className="h-7 w-7 p-0"
                  >
                    <Link2Icon className="h-3.5 w-3.5" />
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
                    onClick={() => insertMarkdown("> $1")}
                    className="h-7 w-7 p-0"
                  >
                    <QuoteIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("- $1")}
                    className="h-7 w-7 p-0"
                  >
                    <ListIcon className="h-3.5 w-3.5" />
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
                    onClick={() => insertMarkdown("@username", "")}
                    className="h-7 w-7 p-0"
                  >
                    <AtSignIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mention a user</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <HelpCircleIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-72 p-1.5">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs">
                      Markdown Supported
                    </h4>
                    <ul className="text-xs space-y-0.5">
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
                        <code>@username</code> to mention someone
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

      {isPreview ? (
        <div className="prose max-w-none min-h-[90px] p-2 bg-gray-50 rounded-md">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 text-sm">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full min-h-[90px]"
        />
      )}

      <div className="flex justify-end gap-1.5">
        <Button
          variant="outline"
          onClick={() => {
            setContent("");
            setIsPreview(false);
          }}
          size="sm"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!content.trim()} size="sm">
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};
