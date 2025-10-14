// src/client/AtlasClient.ts
import { AtlasClientConfig } from "../types/config";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import { ContentService } from "../services/ContentService";
import { PublicationService } from "../services/PublicationService";
import { AtlasValidationError } from "../errors";

export class AtlasClient {
  private config: AtlasClientConfig;
  private cache: MemoryCache;
  private http: HttpClient;

  // Service instances - publicly accessible
  public readonly content: ContentService;
  public readonly publications: PublicationService;

  constructor(config: AtlasClientConfig) {
    this.validateConfig(config);

    // Merge with defaults
    this.config = {
      timeout: 10000,
      cache: true,
      cacheDuration: 5,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };

    // Initialize core utilities
    this.cache = new MemoryCache();
    this.http = new HttpClient({
      timeout: this.config.timeout!,
      retries: this.config.retries!,
      retryDelay: this.config.retryDelay!,
      headers: this.getDefaultHeaders(),
    });

    // Initialize services with shared dependencies
    this.content = new ContentService(this.config, this.cache, this.http);
    this.publications = new PublicationService(
      this.config,
      this.cache,
      this.http,
    );
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update client configuration
   * Note: This does not reinitialize services, only updates the config object
   */
  updateConfig(newConfig: Partial<AtlasClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<AtlasClientConfig> {
    return { ...this.config };
  }

  /**
   * Validate configuration on initialization
   */
  private validateConfig(config: AtlasClientConfig): void {
    if (!config.apiUrl) {
      throw new AtlasValidationError("apiUrl is required");
    }
    if (!config.websiteId) {
      throw new AtlasValidationError("websiteId is required");
    }
  }

  /**
   * Get default headers for HTTP requests
   */
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }
}
