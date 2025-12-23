// src/services/SchedulerService.ts
import {
  SchedulerStatus,
  SchedulerHealth,
  JobTriggerResult,
  ApiResponse,
  AtlasClientConfig,
} from "../types";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import { generateCacheKey } from "../utils/query";
import { AtlasError, AtlasValidationError } from "../errors";

export class SchedulerService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Get scheduler status
   */
  async getStatus(): Promise<ApiResponse<SchedulerStatus>> {
    const cacheKey = generateCacheKey("scheduler-status", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SchedulerStatus>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/scheduler/status`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        // Short cache for scheduler status
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 0.5));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get scheduler health
   */
  async getHealth(): Promise<ApiResponse<SchedulerHealth>> {
    const cacheKey = generateCacheKey("scheduler-health", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SchedulerHealth>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/scheduler/health`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        // Short cache for scheduler health
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 0.5));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trigger a scheduled job manually
   */
  async triggerJob(jobName: string): Promise<ApiResponse<JobTriggerResult>> {
    if (!jobName) {
      throw new AtlasValidationError("Job name is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/scheduler/jobs/${jobName}/trigger`,
      );

      // Clear relevant caches as the job might affect data
      this.cache.clear();

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): AtlasError {
    if (error instanceof AtlasError) {
      return error;
    }

    return new AtlasError(
      error.message || "An unknown error occurred",
      "UNKNOWN_ERROR",
    );
  }
}

