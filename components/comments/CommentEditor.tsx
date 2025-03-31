import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/Auth";
import ReactMarkdown from 'react-markdown';
import { Textarea } from "@/components/ui/textarea";

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
    submitLabel = "Submit"
}) => {
    const [content, setContent] = useState(initialContent);
    const [isPreview, setIsPreview] = useState(false);
    const { user } = useAuthStore();

    const handleSubmit = () => {
        if (content.trim()) {
            onSubmit(content);
            setContent("");
            setIsPreview(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex gap-2 mb-2">
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

            {isPreview ? (
                <div className="prose max-w-none min-h-[100px] p-3 bg-gray-50 rounded-md">
                    {content ? (
                        <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                        <p className="text-gray-400">Nothing to preview</p>
                    )}
                </div>
            ) : (
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
            )}

            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => {
                        setContent("");
                        setIsPreview(false);
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                >
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
};