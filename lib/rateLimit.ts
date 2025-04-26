import { databases } from "@/models/client/config";
import { db, riskAnalysisCollection } from "@/models/name";
import { Query } from "node-appwrite";
import { NextRequest } from "next/server";
import env from "@/app/env";

// Setup Redis client for rate limiting
// Use a configurable Redis client that works with or without Upstash
class RedisClient {
  private static instance: RedisClient;
  private isUpstashConfigured: boolean;
  private memoryStore: Map<
    string,
    { value: string | number; expiry: number | null }
  > = new Map();

  private constructor() {
    // Check if Upstash Redis environment variables are configured
    this.isUpstashConfigured =
      typeof env.upstash.redis.url === "string" &&
      env.upstash.redis.url.length > 0 &&
      typeof env.upstash.redis.token === "string" &&
      env.upstash.redis.token.length > 0;

    console.log(
      `Redis client initialized. Using ${
        this.isUpstashConfigured ? "Upstash Redis" : "in-memory store"
      }`
    );
  }

  public static getInstance(): RedisClient {
    if (!this.instance) {
      this.instance = new RedisClient();
    }
    return this.instance;
  }

  // Get a value from Redis or memory store
  async get(key: string): Promise<string | number | null> {
    if (this.isUpstashConfigured) {
      // If Upstash is configured, use the REST API
      try {
        const response = await fetch(`${env.upstash.redis.url}/get/${key}`, {
          headers: {
            Authorization: `Bearer ${env.upstash.redis.token}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Error fetching key ${key} from Upstash Redis:`,
            await response.text()
          );
          return null;
        }

        const data = await response.json();
        return data.result;
      } catch (error) {
        console.error(`Error fetching from Upstash Redis:`, error);
        return null;
      }
    } else {
      // Use in-memory store
      const item = this.memoryStore.get(key);
      if (!item) return null;

      // Check for expiration
      if (item.expiry && item.expiry < Date.now()) {
        this.memoryStore.delete(key);
        return null;
      }

      return item.value;
    }
  }

  // Set a value in Redis or memory store with optional expiration
  async set(
    key: string,
    value: string | number,
    options?: { ex?: number }
  ): Promise<string | null> {
    if (this.isUpstashConfigured) {
      // If Upstash is configured, use the REST API
      try {
        let url = `${env.upstash.redis.url}/set/${key}/${value}`;

        // Add expiration if provided
        if (options?.ex) {
          url += `/ex/${options.ex}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${env.upstash.redis.token}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Error setting key ${key} in Upstash Redis:`,
            await response.text()
          );
          return null;
        }

        const data = await response.json();
        return data.result;
      } catch (error) {
        console.error(`Error setting in Upstash Redis:`, error);
        return null;
      }
    } else {
      // Use in-memory store
      let expiry = null;
      if (options?.ex) {
        expiry = Date.now() + options.ex * 1000;
      }

      this.memoryStore.set(key, { value, expiry });
      return "OK";
    }
  }

  // Increment a value in Redis or memory store
  async incr(key: string): Promise<number> {
    if (this.isUpstashConfigured) {
      // If Upstash is configured, use the REST API
      try {
        const response = await fetch(`${env.upstash.redis.url}/incr/${key}`, {
          headers: {
            Authorization: `Bearer ${env.upstash.redis.token}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Error incrementing key ${key} in Upstash Redis:`,
            await response.text()
          );
          return 0;
        }

        const data = await response.json();
        return data.result;
      } catch (error) {
        console.error(`Error incrementing in Upstash Redis:`, error);
        return 0;
      }
    } else {
      // Use in-memory store
      const item = this.memoryStore.get(key);

      if (!item) {
        this.memoryStore.set(key, { value: 1, expiry: null });
        return 1;
      }

      // Check for expiration
      if (item.expiry && item.expiry < Date.now()) {
        this.memoryStore.set(key, { value: 1, expiry: null });
        return 1;
      }

      const newValue = typeof item.value === "number" ? item.value + 1 : 1;
      this.memoryStore.set(key, { value: newValue, expiry: item.expiry });
      return newValue;
    }
  }

  // Delete a key from Redis or memory store
  async del(key: string): Promise<number> {
    if (this.isUpstashConfigured) {
      // If Upstash is configured, use the REST API
      try {
        const response = await fetch(`${env.upstash.redis.url}/del/${key}`, {
          headers: {
            Authorization: `Bearer ${env.upstash.redis.token}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Error deleting key ${key} from Upstash Redis:`,
            await response.text()
          );
          return 0;
        }

        const data = await response.json();
        return data.result;
      } catch (error) {
        console.error(`Error deleting from Upstash Redis:`, error);
        return 0;
      }
    } else {
      // Use in-memory store
      const existed = this.memoryStore.has(key);
      this.memoryStore.delete(key);
      return existed ? 1 : 0;
    }
  }
}

// Initialize Redis client singleton
const redis = RedisClient.getInstance();

// Global keys for system settings
const RATE_LIMIT_ENABLED_KEY = "system:rate_limit_enabled";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute
const MAX_FAILED_ATTEMPTS = 5; // Max 5 failed attempts before temporary lockout
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minute lockout after too many failed attempts
const MAX_ANALYSIS_PER_WINDOW = 10; // Max 10 risk analyses per minute

// Get the current rate limit enabled status
export async function isRateLimitEnabled(): Promise<boolean> {
  try {
    const value = await redis.get(RATE_LIMIT_ENABLED_KEY);
    // Default to true if the setting doesn't exist
    return value === null || value === "1";
  } catch (error) {
    console.error("Error checking rate limit enabled status:", error);
    // Default to true if there's an error checking
    return true;
  }
}

// Set the rate limit enabled status
export async function setRateLimitEnabled(enabled: boolean): Promise<boolean> {
  try {
    await redis.set(RATE_LIMIT_ENABLED_KEY, enabled ? "1" : "0");
    return true;
  } catch (error) {
    console.error("Error setting rate limit enabled status:", error);
    return false;
  }
}

// Check if a request should be rate limited
export async function checkRateLimit(
  requestIp: string,
  routePath: string
): Promise<boolean> {
  // First check if rate limiting is enabled
  const enabled = await isRateLimitEnabled();
  if (!enabled) {
    return true; // Skip rate limiting if disabled
  }

  const key = `ratelimit:${requestIp}:${routePath}`;

  try {
    // Check if client is locked out
    const lockoutKey = `lockout:${requestIp}:${routePath}`;
    const isLockedOut = await redis.get(lockoutKey);

    if (isLockedOut) {
      return false; // Request should be rate limited
    }

    // Get current count or initialize
    const currentCount = await redis.get(key);

    if (!currentCount) {
      await redis.set(key, 1, { ex: RATE_LIMIT_WINDOW / 1000 });
      return true; // Request can proceed
    }

    const count = parseInt(String(currentCount));

    if (count >= MAX_REQUESTS_PER_WINDOW) {
      return false; // Request should be rate limited
    }

    // Increment count and return
    await redis.incr(key);
    return true; // Request can proceed
  } catch (error) {
    console.error("Rate limit check error:", error);
    return true; // Allow in case of rate limiter failure
  }
}

// Record failed authentication attempts
export async function recordFailedAttempt(
  requestIp: string,
  routePath: string
): Promise<boolean> {
  // Check if rate limiting is enabled
  const enabled = await isRateLimitEnabled();
  if (!enabled) {
    return false; // Skip rate limiting if disabled
  }

  const key = `failed:${requestIp}:${routePath}`;

  try {
    // Get current failed attempts or initialize
    const currentCount = await redis.get(key);

    if (!currentCount) {
      await redis.set(key, 1, { ex: 60 * 60 }); // Keep failed attempts for 1 hour
      return false; // Not locked out yet
    }

    const count = parseInt(String(currentCount));
    await redis.incr(key);

    // Lock out if too many attempts
    if (count + 1 >= MAX_FAILED_ATTEMPTS) {
      const lockoutKey = `lockout:${requestIp}:${routePath}`;
      await redis.set(lockoutKey, 1, { ex: LOCKOUT_TIME / 1000 });
      return true; // Locked out
    }

    return false; // Not locked out yet
  } catch (error) {
    console.error("Failed attempt record error:", error);
    return false;
  }
}

// Reset failed attempts after successful login
export async function resetFailedAttempts(
  requestIp: string,
  routePath: string
): Promise<void> {
  const key = `failed:${requestIp}:${routePath}`;

  try {
    await redis.del(key);
  } catch (error) {
    console.error("Reset failed attempts error:", error);
  }
}

// Get IP from request
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1"; // Fallback for development
}

// Detect suspicious input patterns that might indicate attacks
export function isSuspiciousInput(input: string): boolean {
  // Check for SQL injection patterns
  const sqlPatterns =
    /(\b(union|select|insert|update|delete|from|where|drop|alter|create|table|database)\b)|(['"].*;.*--|\/\*|\*\/|@@)/i;

  // Check for XSS patterns
  const xssPatterns =
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)|javascript:/i;

  // Check for command injection
  const commandPatterns =
    /[\n\r]|\b(ping|wget|curl|bash|cmd|powershell|echo|rm -rf)\b/i;

  // Check for suspicious input patterns like just dots, repeated characters, or too many symbols
  const suspiciousPatterns = /^[.,-_*]+$|(.)\1{5,}/;

  return (
    sqlPatterns.test(input) ||
    xssPatterns.test(input) ||
    commandPatterns.test(input) ||
    suspiciousPatterns.test(input)
  );
}

// Check if comment appears to be spam
export function isSpam(text: string): boolean {
  // Check for spam indicators
  const hasExcessiveUrls = (text.match(/https?:\/\//g) || []).length > 3;
  const hasRepeatedText = /((.{4,})\2{2,})/i.test(text);
  const hasSpamKeywords =
    /\b(viagra|cialis|free money|earn money|casino|lottery|prize|winner|buy now)\b/i.test(
      text
    );

  return hasExcessiveUrls || hasRepeatedText || hasSpamKeywords;
}

// Check comment rate limiting specifically
export async function checkCommentRateLimit(userId: string): Promise<boolean> {
  // Check if rate limiting is enabled
  const enabled = await isRateLimitEnabled();
  if (!enabled) {
    return true; // Skip rate limiting if disabled
  }

  const key = `comment-limit:${userId}`;

  try {
    // Get current count or initialize
    const currentCount = await redis.get(key);

    if (!currentCount) {
      await redis.set(key, 1, { ex: 60 }); // 1 minute window
      return true; // Under limit
    }

    const count = parseInt(String(currentCount));

    if (count >= 5) {
      // Max 5 comments per minute
      return false; // Rate limited
    }

    // Increment count
    await redis.incr(key);
    return true; // Under limit
  } catch (error) {
    console.error("Comment rate limit check error:", error);
    return true; // Allow in case of rate limiter failure
  }
}

export async function checkAnalysisRateLimit(userId: string): Promise<boolean> {
  // Check if rate limiting is enabled
  const enabled = await isRateLimitEnabled();
  if (!enabled) {
    return true; // Skip rate limiting if disabled
  }

  try {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

    const response = await databases.listDocuments(db, riskAnalysisCollection, [
      Query.equal("userId", userId),
      Query.greaterThan("created", windowStart),
      Query.limit(MAX_ANALYSIS_PER_WINDOW + 1),
    ]);

    return response.total < MAX_ANALYSIS_PER_WINDOW;
  } catch (error) {
    console.error("Error checking analysis rate limit:", error);
    return false;
  }
}
