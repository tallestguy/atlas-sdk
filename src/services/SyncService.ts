// src/services/SyncService.ts
import {
  SyncJob,
  SyncJobDetails,
  SyncStatistics,
  SyncTriggerOptions,
  SyncQueryOptions,
  ApiResponse,
  AtlasClientConfig,
} from "../types";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import {
  buildQueryParams,
  generateCacheKey,
  processPaginationOptions,
  enrichPaginationResponse,
} from "../utils/query";
import { AtlasError, AtlasValidationError } from "../errors";

export class SyncService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Trigger location sync from Carerix
   */
  async triggerLocationSync(
    options: SyncTriggerOptions = {},
  ): Promise<ApiResponse<SyncJob>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/sync/locations`,
        options,
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trigger location dry run sync
   */
  async triggerLocationDryRun(
    options: SyncTriggerOptions = {},
  ): Promise<ApiResponse<SyncJob>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/sync/locations/dry-run`,
        { ...options, dry_run: true },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trigger publication sync from Carerix
   */
  async triggerPublicationSync(
    options: SyncTriggerOptions = {},
  ): Promise<ApiResponse<SyncJob>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/sync/publications`,
        options,
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trigger publication dry run sync
   */
  async triggerPublicationDryRun(
    options: SyncTriggerOptions = {},
  ): Promise<ApiResponse<SyncJob>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/sync/publications/dry-run`,
        { ...options, dry_run: true },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get sync job status by ID
   */
  async getStatus(jobId: string): Promise<ApiResponse<SyncJob>> {
    if (!jobId) {
      throw new AtlasValidationError("Job ID is required");
    }

    const cacheKey = generateCacheKey("sync-status", { jobId });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SyncJob>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/sync/status/${jobId}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        // Short cache for sync status
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 0.5));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get latest sync status
   */
  async getLatestStatus(): Promise<ApiResponse<SyncJob>> {
    const cacheKey = generateCacheKey("sync-latest-status", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SyncJob>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/sync/status/latest`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 0.5));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get active sync jobs
   */
  async getActiveSyncJobs(): Promise<ApiResponse<SyncJob[]>> {
    const cacheKey = generateCacheKey("sync-active-jobs", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SyncJob[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/sync/status/active`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 0.5));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get sync history with optional filtering
   */
  async getHistory(
    options: SyncQueryOptions = {},
  ): Promise<ApiResponse<SyncJob[]>> {
    const cacheKey = generateCacheKey("sync-history", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SyncJob[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      ...options,
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
      page: undefined,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/sync/history?${queryParams}`,
      )) as ApiResponse<SyncJob[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, enrichedResponse, this.config.cacheDuration);
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get sync statistics
   */
  async getStatistics(): Promise<ApiResponse<SyncStatistics>> {
    const cacheKey = generateCacheKey("sync-statistics", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SyncStatistics>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/sync/statistics`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, this.config.cacheDuration * 2);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed sync job information
   */
  async getJobDetails(jobId: string): Promise<ApiResponse<SyncJobDetails>> {
    if (!jobId) {
      throw new AtlasValidationError("Job ID is required");
    }

    const cacheKey = generateCacheKey("sync-job-details", { jobId });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SyncJobDetails>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/sync/jobs/${jobId}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, this.config.cacheDuration);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): AtlasError {
    if (error instanceof AtlasError) {
      return error;
    }

    if (error instanceof Error) {
      return new AtlasError(error.message, "UNKNOWN_ERROR");
    }

    return new AtlasError("An unknown error occurred", "UNKNOWN_ERROR");
  }
}

