// src/services/DeploymentService.ts
import {
  Deployment,
  CreateDeploymentRequest,
  ScheduleDeploymentRequest,
  DeploymentQueryOptions,
  DeploymentStats,
  DeploymentValidation,
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

export class DeploymentService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Create and trigger a new deployment
   */
  async create(
    data: CreateDeploymentRequest,
  ): Promise<ApiResponse<Deployment>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/deployment`,
        data,
      );

      this.cache.delete(generateCacheKey("deployments", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Schedule a deployment for later
   */
  async schedule(
    data: ScheduleDeploymentRequest,
  ): Promise<ApiResponse<Deployment>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/deployment/schedule`,
        data,
      );

      this.cache.delete(generateCacheKey("deployments", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a deployment by ID
   */
  async getById(id: string): Promise<ApiResponse<Deployment>> {
    if (!id) {
      throw new AtlasValidationError("Deployment ID is required");
    }

    const cacheKey = generateCacheKey("deployment-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Deployment>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/deployment/${id}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        // Short cache for deployments as they change frequently
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 1));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all deployments with optional filtering
   */
  async list(
    options: DeploymentQueryOptions = {},
  ): Promise<ApiResponse<Deployment[]>> {
    const cacheKey = generateCacheKey("deployments", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Deployment[]>>(cacheKey);
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
        `${this.config.apiUrl}/deployment?${queryParams}`,
      )) as ApiResponse<Deployment[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        // Short cache for deployments
        this.cache.set(
          cacheKey,
          enrichedResponse,
          Math.min(this.config.cacheDuration, 1),
        );
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update deployment status
   */
  async updateStatus(
    id: string,
    status: Deployment["status"],
  ): Promise<ApiResponse<Deployment>> {
    if (!id) {
      throw new AtlasValidationError("Deployment ID is required");
    }

    try {
      const response = await this.http.put(
        `${this.config.apiUrl}/deployment/${id}/status`,
        { status },
      );

      this.cache.delete(generateCacheKey("deployment-id", { id }));
      this.cache.delete(generateCacheKey("deployments", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a deployment
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("Deployment ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/deployment/${id}`,
      );

      this.cache.delete(generateCacheKey("deployment-id", { id }));
      this.cache.delete(generateCacheKey("deployments", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get the latest deployment for a website
   */
  async getLatest(websiteId: string): Promise<ApiResponse<Deployment>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("deployment-latest", { websiteId });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Deployment>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/deployment/website/${websiteId}/latest`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 1));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate deployment configuration for a website
   */
  async validateConfig(
    websiteId: string,
  ): Promise<ApiResponse<DeploymentValidation>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/deployment/website/${websiteId}/validate-config`,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get pending deployments
   */
  async getPending(): Promise<ApiResponse<Deployment[]>> {
    const cacheKey = generateCacheKey("deployments-pending", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Deployment[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/deployment/status/pending`,
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
   * Get in-progress deployments
   */
  async getInProgress(): Promise<ApiResponse<Deployment[]>> {
    const cacheKey = generateCacheKey("deployments-in-progress", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Deployment[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/deployment/status/in-progress`,
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
   * Get deployment statistics
   */
  async getStats(): Promise<ApiResponse<DeploymentStats>> {
    const cacheKey = generateCacheKey("deployment-stats", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<DeploymentStats>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/deployment/stats`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, this.config.cacheDuration);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trigger a scheduled deployment
   */
  async trigger(id: string): Promise<ApiResponse<Deployment>> {
    if (!id) {
      throw new AtlasValidationError("Deployment ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/deployment/${id}/trigger`,
      );

      this.cache.delete(generateCacheKey("deployment-id", { id }));
      this.cache.delete(generateCacheKey("deployments", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a deployment
   */
  async cancel(id: string): Promise<ApiResponse<Deployment>> {
    if (!id) {
      throw new AtlasValidationError("Deployment ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/deployment/${id}/cancel`,
      );

      this.cache.delete(generateCacheKey("deployment-id", { id }));
      this.cache.delete(generateCacheKey("deployments", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Retry a failed deployment
   */
  async retry(id: string): Promise<ApiResponse<Deployment>> {
    if (!id) {
      throw new AtlasValidationError("Deployment ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/deployment/${id}/retry`,
      );

      this.cache.delete(generateCacheKey("deployment-id", { id }));
      this.cache.delete(generateCacheKey("deployments", {}));

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

