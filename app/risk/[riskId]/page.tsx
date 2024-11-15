"use client";
import React, { useEffect, useState } from "react";
import { databases, storage } from "@/models/client/config";
import Image from "next/image";
import { useParams } from "next/navigation";
import { db, riskCollection } from "@/models/name";

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
          const response = await databases.getDocument(
            db,
            riskCollection,
            riskId
          );

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
            const attachmentResponse = await storage.getFile(
              db,
              response.attachmentId
            );

            const attachmentUrl = storage.getFileView(
              db,
              attachmentResponse.$id
            );

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
      <div className="flex items-center justify-center h-screen bg-black text-lg text-gray-300">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-center text-gray-300">
        No risk details found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white mb-4">{risk.title}</h1>
        <p className="text-gray-300 mb-2">{risk.content}</p>
        <div className="space-y-2 mb-4">
          <p className="font-semibold text-gray-200">
            Author ID:{" "}
            <span className="font-normal text-gray-400">{risk.authorId}</span>
          </p>
          <p className="font-semibold text-gray-200">
            Impact:{" "}
            <span className="font-normal text-gray-400">{risk.impact}</span>
          </p>
          <p className="font-semibold text-gray-200">
            Probability:{" "}
            <span className="font-normal text-gray-400">
              {risk.probability}
            </span>
          </p>
          <p className="font-semibold text-gray-200">
            Action:{" "}
            <span className="font-normal text-gray-400">{risk.action}</span>
          </p>
          <p className="font-semibold text-gray-200">
            Mitigation:{" "}
            <span className="font-normal text-gray-400">{risk.mitigation}</span>
          </p>
          <p className="font-semibold text-gray-200">
            Tags:{" "}
            <span className="font-normal text-gray-400">
              {risk.tags.join(", ")}
            </span>
          </p>
          <p className="font-semibold text-gray-200">
            Created:{" "}
            <span className="font-normal text-gray-400">
              {new Date(risk.created).toLocaleString()}
            </span>
          </p>
          <p className="font-semibold text-gray-200">
            Updated:{" "}
            <span className="font-normal text-gray-400">
              {new Date(risk.updated).toLocaleString()}
            </span>
          </p>
        </div>

        {attachment && (
          <div className="mt-4">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Attachment
            </h2>
            {attachment.type.startsWith("image/") ? (
              <Image
                src={attachment.url}
                alt="Attachment"
                width={500}
                height={300}
                className="rounded-md shadow-lg"
              />
            ) : (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                View Attachment
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskDetail;
