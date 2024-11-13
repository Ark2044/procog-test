import React, { useState, ChangeEvent, FormEvent } from "react";
import { databases, account, storage } from "@/models/client/config"; // Import Appwrite configuration
import { riskCollection, db, riskAttachmentBucket } from "@/models/name"; // Import risk collection name and database ID

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
  const [probability, setProbability] = useState<number>(3); // Set to 3 (midpoint)
  const [action, setAction] = useState<
    "mitigate" | "accept" | "transfer" | "avoid"
  >("mitigate");
  const [mitigation, setMitigation] = useState(""); // State for mitigation strategies
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the current user ID
      const user = await account.get();
      const authorId = user.$id;

      // Upload file if provided
      if (file) {
        const fileResponse = await storage.createFile(
          riskAttachmentBucket,
          "unique()",
          file
        );
        setAttachmentId(fileResponse.$id); // Set the file ID
      }

      // Create the risk document
      await databases.createDocument(db, riskCollection, "unique()", {
        title,
        content,
        authorId,
        tags,
        attachmentId,
        impact,
        probability: probability,
        action,
        mitigation: action === "mitigate" ? mitigation : "", // Include mitigation only if action is mitigate
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      onRiskCreated(); // Refresh the risk list

      // Reset form fields
      setTitle("");
      setContent("");
      setTags([]);
      setFile(null);
      setAttachmentId(undefined);
      setImpact("low");
      setProbability(3); // Set probability back to midpoint (50%)
      setAction("mitigate");
      setMitigation(""); // Reset mitigation strategies
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Failed to create risk: " + err.message);
      } else {
        setError("Failed to create risk: An unknown error occurred");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Risk</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-gray-700 font-semibold mb-2"
        >
          Title:
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="content"
          className="block text-gray-700 font-semibold mb-2"
        >
          Content:
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="tags"
          className="block text-gray-700 font-semibold mb-2"
        >
          Tags:
        </label>
        <input
          type="text"
          id="tags"
          value={tags.join(",")}
          onChange={(e) =>
            setTags(e.target.value.split(",").map((tag) => tag.trim()))
          }
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="file"
          className="block text-gray-700 font-semibold mb-2"
        >
          Attachment (optional):
        </label>
        <input
          type="file"
          id="file"
          onChange={handleFileChange}
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="impact"
          className="block text-gray-700 font-semibold mb-2"
        >
          Impact:
        </label>
        <select
          id="impact"
          value={impact}
          onChange={(e) =>
            setImpact(e.target.value as "low" | "medium" | "high")
          }
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="mb-4">
        <label
          htmlFor="probability"
          className="block text-gray-700 font-semibold mb-2"
        >
          Probability (0-5):
        </label>
        <input
          type="range"
          id="probability"
          min="0"
          max="5"
          value={probability}
          onChange={(e) => setProbability(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-gray-600">Probability: {probability * 20}%</p>
      </div>
      <div className="mb-4">
        <label
          htmlFor="action"
          className="block text-gray-700 font-semibold mb-2"
        >
          Action:
        </label>
        <select
          id="action"
          value={action}
          onChange={(e) =>
            setAction(
              e.target.value as "mitigate" | "accept" | "transfer" | "avoid"
            )
          }
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="mitigate">Mitigate</option>
          <option value="accept">Accept</option>
          <option value="transfer">Transfer</option>
          <option value="avoid">Avoid</option>
        </select>
      </div>
      {action === "mitigate" && ( // Conditionally render the mitigation input
        <div className="mb-4">
          <label
            htmlFor="mitigation"
            className="block text-gray-700 font-semibold mb-2"
          >
            How to Mitigate the Risk:
          </label>
          <textarea
            id="mitigation"
            value={mitigation}
            onChange={(e) => setMitigation(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      <button
        type="submit"
        className={`mt-4 w-full bg-blue-500 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Risk"}
      </button>
    </form>
  );
};

export default CreateRisk;
