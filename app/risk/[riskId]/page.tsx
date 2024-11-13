"use client";
import React, { useEffect, useState } from "react";
import { databases, storage } from "@/models/client/config"; // Adjust the import based on your project structure
import Image from "next/image"; // Using Next.js Image component
import { useParams } from "next/navigation"; // Import useParams
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
  const { riskId } = useParams(); // Use useParams to get riskId
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

          // Fetch the attachment if it exists
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
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!risk) {
    return <div className="text-center">No risk details found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{risk.title}</h1>
      <p className="text-gray-700 mb-2">{risk.content}</p>
      <div className="space-y-2 mb-4">
        <p className="font-semibold">
          Author ID: <span className="font-normal">{risk.authorId}</span>
        </p>
        <p className="font-semibold">
          Impact: <span className="font-normal">{risk.impact}</span>
        </p>
        <p className="font-semibold">
          Probability: <span className="font-normal">{risk.probability}</span>
        </p>
        <p className="font-semibold">
          Action: <span className="font-normal">{risk.action}</span>
        </p>
        <p className="font-semibold">
          Mitigation: <span className="font-normal">{risk.mitigation}</span>
        </p>
        <p className="font-semibold">
          Tags: <span className="font-normal">{risk.tags.join(", ")}</span>
        </p>
        <p className="font-semibold">
          Created:{" "}
          <span className="font-normal">
            {new Date(risk.created).toLocaleString()}
          </span>
        </p>
        <p className="font-semibold">
          Updated:{" "}
          <span className="font-normal">
            {new Date(risk.updated).toLocaleString()}
          </span>
        </p>
      </div>

      {attachment && (
        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
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
              className="text-blue-600 hover:underline"
            >
              View Attachment
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskDetail;
