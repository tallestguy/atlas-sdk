export * from "./types";
export * from "./errors";
export { createAtlasClient } from "./client";
export { AtlasClient } from "./client/AtlasClient";

// Pre-configured singleton instance
import { createAtlasClient } from "./client";
import { AtlasClientConfig } from "./types";

// Default configuration - can be overridden via environment variables
const defaultConfig: AtlasClientConfig = {
  apiUrl: process.env.ATLAS_API_URL || "https://api.atlas.example.com",
  websiteId: process.env.ATLAS_WEBSITE_ID || "",
  apiKey: process.env.ATLAS_API_KEY,
  cache: true,
  cacheDuration: 5,
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};

export const atlas = createAtlasClient(defaultConfig);
