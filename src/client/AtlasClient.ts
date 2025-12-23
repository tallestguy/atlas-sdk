// src/client/AtlasClient.ts
import { AtlasClientConfig } from "../types/config";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import { ContentService } from "../services/ContentService";
import { PublicationService } from "../services/PublicationService";
import { WebsiteService } from "../services/WebsiteService";
import { PeopleService } from "../services/PeopleService";
import { LocationService } from "../services/LocationService";
import { AuthService } from "../services/AuthService";
import { DeploymentService } from "../services/DeploymentService";
import { SyncService } from "../services/SyncService";
import { AFASService } from "../services/AFASService";
import { TimeEntriesService } from "../services/TimeEntriesService";
import { FileAttachmentService } from "../services/FileAttachmentService";
import { SchedulerService } from "../services/SchedulerService";
import { AtlasValidationError } from "../errors";

export class AtlasClient {
  private config: AtlasClientConfig;
  private cache: MemoryCache;
  private http: HttpClient;

  // Service instances - publicly accessible
  public readonly content: ContentService;
  public readonly publications: PublicationService;
  public readonly websites: WebsiteService;
  public readonly people: PeopleService;
  public readonly locations: LocationService;
  public readonly auth: AuthService;
  public readonly deployments: DeploymentService;
  public readonly sync: SyncService;
  public readonly afas: AFASService;
  public readonly timeEntries: TimeEntriesService;
  public readonly files: FileAttachmentService;
  public readonly scheduler: SchedulerService;

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
    this.websites = new WebsiteService(this.config, this.cache, this.http);
    this.people = new PeopleService(this.config, this.cache, this.http);
    this.locations = new LocationService(this.config, this.cache, this.http);
    this.auth = new AuthService(this.config, this.cache, this.http);
    this.deployments = new DeploymentService(
      this.config,
      this.cache,
      this.http,
    );
    this.sync = new SyncService(this.config, this.cache, this.http);
    this.afas = new AFASService(this.config, this.cache, this.http);
    this.timeEntries = new TimeEntriesService(
      this.config,
      this.cache,
      this.http,
    );
    this.files = new FileAttachmentService(this.config, this.cache, this.http);
    this.scheduler = new SchedulerService(this.config, this.cache, this.http);
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
