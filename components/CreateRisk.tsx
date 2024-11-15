import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Upload, 
  X, 
  CheckCircle, 
  Info, 
  Tag, 
  FileText, 
  TrendingUp 
} from "lucide-react";
import { databases, account, storage } from "@/models/client/config";
import { riskCollection, db, riskAttachmentBucket } from "@/models/name";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [remainingChars, setRemainingChars] = useState(500);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setRemainingChars(500 - newContent.length);
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
        setAttachmentId(fileResponse.$id);
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
        mitigation: action === "mitigate" ? mitigation : "",
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
      setProbability(3);
      setAction("mitigate");
      setMitigation("");
      setRemainingChars(500);
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

  const getProbabilityColor = () => {
    if (probability <= 1) return "text-green-500";
    if (probability <= 3) return "text-yellow-500";
    return "text-red-500";
  };

  // Removed unused getImpactColor function to address ESLint warning

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-2xl mb-8 border border-gray-700 relative"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle className="mr-3 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">Create Risk</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-gray-400 hover:text-white transition"
        >
          <Info />
        </button>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 right-6 bg-gray-700 text-white p-4 rounded-lg shadow-lg z-10 w-64"
          >
            <p className="text-sm">
              Create a comprehensive risk entry with detailed information, 
              impact assessment, and mitigation strategies.
            </p>
            <button 
              type="button"
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
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

        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="text-gray-300 font-semibold mb-2 inline-flex items-center"
            >
              <FileText className="mr-2 text-gray-500" /> Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter risk title"
              maxLength={100}
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="text-gray-300 font-semibold mb-2 inline-flex items-center"
            >
              <FileText className="mr-2 text-gray-500" /> Description
            </label>
            <textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              required
              className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter risk description"
              maxLength={500}
              rows={4}
            />
            <p className={`text-sm mt-1 ${remainingChars < 50 ? 'text-red-500' : 'text-gray-400'}`}>
              {remainingChars} characters remaining
            </p>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="text-gray-300 font-semibold mb-2 inline-flex items-center"
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
              className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div>
            <label
              htmlFor="file"
              className="text-gray-300 font-semibold mb-2 inline-flex items-center"
            >
              <Upload className="mr-2 text-gray-500" /> Attachment (optional)
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {file && <CheckCircle className="ml-2 text-green-500" />}
            </div>
            {file && (
              <p className="text-sm text-gray-400 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="impact"
              className="text-gray-300 font-semibold mb-2"
            >
              <TrendingUp className="mr-2 text-gray-500" /> Impact
            </label>
            <select
              id="impact"
              value={impact}
              onChange={(e) =>
                setImpact(e.target.value as "low" | "medium" | "high")
              }
              className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="probability"
              className="text-gray-300 font-semibold mb-2"
            >
              Probability (0-5)
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
            <p className={`text-gray-400 ${getProbabilityColor()}`}>
              Probability: {probability * 20}%
            </p>
          </div>

          <div>
            <label
              htmlFor="action"
              className="text-gray-300 font-semibold mb-2"
            >
              Action
            </label>
            <select
              id="action"
              value={action}
              onChange={(e) =>
                setAction(
                  e.target.value as "mitigate" | "accept" | "transfer" | "avoid"
                )
              }
              className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mitigate">Mitigate</option>
              <option value="accept">Accept</option>
              <option value="transfer">Transfer</option>
              <option value="avoid">Avoid</option>
            </select>
          </div>

          {action === "mitigate" && (
            <div>
              <label
                htmlFor="mitigation"
                className="text-gray-300 font-semibold mb-2"
              >
                How to Mitigate the Risk
              </label>
              <textarea
                id="mitigation"
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
                className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mitigation strategies"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`mt-4 w-full bg-blue-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Risk"}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateRisk;