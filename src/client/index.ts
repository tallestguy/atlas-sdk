// src/client/index.ts
import { AtlasClient } from "./AtlasClient";
import { AtlasClientConfig } from "../types";

let atlasClientInstance: AtlasClient | null = null;

/**
 * Create or update the Atlas client singleton instance
 */
export function createAtlasClient(config: AtlasClientConfig): AtlasClient {
  if (!atlasClientInstance) {
    atlasClientInstance = new AtlasClient(config);
  } else {
    // Update existing instance configuration
    atlasClientInstance.updateConfig(config);
  }

  return atlasClientInstance;
}

/**
 * Get the current Atlas client instance
 */
export function getAtlasClient(): AtlasClient | null {
  return atlasClientInstance;
}

/**
 * Reset the Atlas client singleton (useful for testing)
 */
export function resetAtlasClient(): void {
  atlasClientInstance = null;
}
