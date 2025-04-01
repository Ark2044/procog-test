import { databases } from "@/models/client/config";
import { db, commentCollection } from "@/models/name";
import { Query } from "node-appwrite";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_COMMENTS_PER_WINDOW = 5;

export async function checkCommentRateLimit(userId: string): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();
    
    const response = await databases.listDocuments(
      db,
      commentCollection,
      [
        Query.equal("authorId", userId),
        Query.greaterThan("created", windowStart),
        Query.limit(MAX_COMMENTS_PER_WINDOW + 1)
      ]
    );

    return response.total < MAX_COMMENTS_PER_WINDOW;
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return false;
  }
}

// Basic spam detection
export function isSpam(content: string): boolean {
  // Convert to lowercase for checking
  const lowerContent = content.toLowerCase();
  
  // Check for common spam patterns
  const spamPatterns = [
    /\b(buy|sell|cheap|discount|offer|price|deal|order)\b.*\b(viagra|cialis|pharmacy|pills|drugs)\b/i,
    /\b(casino|poker|gambling|bet|lottery)\b.*\b(online|money|win|cash)\b/i,
    /(https?:\/\/[^\s]+){3,}/,  // More than 2 URLs
    /(.)\1{4,}/,  // Repeated characters
    /\b[A-Z\s]{10,}\b/,  // All caps words
  ];

  // Check content length
  if (content.length > 5000) return true;
  if (content.length < 2) return true;

  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(lowerContent)) return true;
  }

  // Check for excessive symbols
  const symbolRatio = (content.match(/[!?$@#%^&*()]/g) || []).length / content.length;
  if (symbolRatio > 0.3) return true;

  return false;
}