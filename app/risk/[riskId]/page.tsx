'use client'
import React, { useEffect, useState } from "react";
import { databases, storage } from "@/models/client/config";
import Image from "next/image";
import { useParams } from "next/navigation";
import { db, riskCollection } from "@/models/name";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, Tag, User, Activity, BarChart2, Shield, ArrowUpRight, File } from "lucide-react";

interface Risk {
  title: string;
  content: string;
  authorId: string;
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
  const { riskId } = useParams();
  const [risk, setRisk] = useState<Risk | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRisk = async () => {
      if (typeof riskId === "string") {
        try {
          const response = await databases.getDocument(db, riskCollection, riskId);
          
          const mappedRisk: Risk = {
            title: response.title,
            content: response.content,
            authorId: response.authorId,
            tags: response.tags || [],
            attachmentId: response.attachmentId,
            impact: response.impact,
            probability: response.probability,
            action: response.action,
            mitigation: response.mitigation,
            created: response.created,
            updated: response.updated,
          };

          setRisk(mappedRisk);

          if (response.attachmentId) {
            const attachmentResponse = await storage.getFile(db, response.attachmentId);
            const attachmentUrl = storage.getFileView(db, attachmentResponse.$id);
            
            const mappedAttachment: Attachment = {
              id: attachmentResponse.$id,
              type: attachmentResponse.mimeType,
              url: attachmentUrl,
            };

            setAttachment(mappedAttachment);
          }
        } catch (err) {
          console.error(err);
          setError("Error fetching risk details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRisk();
  }, [riskId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-9 w-3/4 rounded-lg bg-gray-800" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full bg-gray-800" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full rounded bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="min-h-screen bg-black p-8">
        <Alert className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No risk details found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getRiskLevelColor = (level: string | undefined | null) => {
    if (!level) return 'bg-gray-400';
    const levelStr = String(level).toLowerCase();
    if (levelStr.includes('high')) return 'bg-red-500';
    if (levelStr.includes('medium')) return 'bg-yellow-500';
    return 'bg-green-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
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
                className="border-gray-700 bg-gray-800/50 hover:bg-gray-800"
              >
                <Tag className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium text-gray-300">{tag}</span>
              </Badge>
            ))}
          </div>
        </div>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-6 space-y-6">
            <p className="text-gray-300 leading-relaxed">{risk.content}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Reported by</p>
                    <p className="text-gray-300 font-medium">{risk.authorId}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400">Impact</p>
                    <p className={`${getRiskLevelColor(risk.impact)} font-semibold`}>
                      {risk.impact}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Probability</p>
                    <p className={`${getRiskLevelColor(risk.probability)} font-semibold`}>
                      {risk.probability}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="text-gray-300 font-medium">
                      {new Date(risk.created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-gray-300 font-medium">
                      {new Date(risk.updated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-400" />
                  Response Plan
                </h3>
                <div className="border-t border-gray-800" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Immediate Action</h4>
                  <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">
                    {risk.action}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Mitigation Strategy</h4>
                  <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">
                    {risk.mitigation}
                  </p>
                </div>
              </div>
            </div>

            {attachment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                    <File className="w-6 h-6 text-blue-400" />
                    Attachment
                  </h3>
                  <div className="border-t border-gray-800" />
                </div>
                
                {attachment.type.startsWith("image/") ? (
                  <div className="relative h-96 w-full rounded-xl overflow-hidden border border-gray-800">
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
                    className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <File className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="text-gray-300 font-medium">View Attachment</p>
                      <p className="text-xs text-gray-400">{attachment.type}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 ml-auto text-gray-400" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskDetail;