"use client";
import React, { useEffect, useState } from "react";
import { databases, storage } from "@/models/client/config";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { db, riskCollection } from "@/models/name";
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
} from "lucide-react";
import { useAuthStore } from "@/store/Auth";
import {
  validateRiskDetail,
  validateAttachment,
  RiskDetailValidationInput,
} from "@/lib/validation";
import { CommentSection } from "@/components/comments/CommentSection";
import { Reminder } from "@/types/Reminder";

interface Risk {
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
  created: string;
  updated: string;
}

interface Attachment {
  id: string;
  type: string;
  url: string;
}

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
            created: response.created,
            updated: response.updated,
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
        } catch (err) {
          console.error(err);
          setError("Error fetching data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [riskId, user, fetchReminders]);

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsReminderDialogOpen(true);
  };

  const handleCloseReminderDialog = () => {
    setIsReminderDialogOpen(false);
    setEditingReminder(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {risk.title}
          </h1>
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
                    Mitigation Strategy
                  </h4>
                  <p className="text-gray-700 bg-gray-100 p-4 rounded-lg">
                    {risk.mitigation}
                  </p>
                </div>
              </div>
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
                resourceId={riskId as string}
                resourceType="risk"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiskDetail;
