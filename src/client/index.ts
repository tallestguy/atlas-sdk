import { AtlasClient } from "./AtlasClient";
import { AtlasClientConfig } from "../types";

let atlasClientInstance: AtlasClient | null = null;

export function createAtlasClient(config: AtlasClientConfig): AtlasClient {
  if (!atlasClientInstance) {
    atlasClientInstance = new AtlasClient(config);
  } else {
    // Update existing instance configuration if needed
    atlasClientInstance.updateConfig(config);
  }

  return atlasClientInstance;
}

export function getAtlasClient(): AtlasClient | null {
  return atlasClientInstance;
}

export function resetAtlasClient(): void {
  atlasClientInstance = null;
}
