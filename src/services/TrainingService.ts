// src/services/TrainingService.ts
import {
  TrainingSummary,
  TrainingDetail,
  TrainingSession,
  CreateTrainingRequest,
  UpdateTrainingRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  TrainingQueryOptions,
  SessionQueryOptions,
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

export class TrainingService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  // ============================================================
  // Training CRUD
  // ============================================================

  /**
   * Create a new training
   * Supports trainer_id OR trainer_email (find-or-create flow)
   */
  async create(
    data: CreateTrainingRequest,
  ): Promise<ApiResponse<TrainingDetail>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/trainings`,
        data,
      );

      this.cache.delete(generateCacheKey("trainings", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List trainings with filtering & pagination
   */
  async list(
    options: TrainingQueryOptions = {},
  ): Promise<ApiResponse<TrainingSummary[]>> {
    const cacheKey = generateCacheKey("trainings", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<TrainingSummary[]>>(cacheKey);
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
        `${this.config.apiUrl}/trainings?${queryParams}`,
      )) as ApiResponse<TrainingSummary[]>;

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
   * Get full training detail with sessions
   */
  async getById(id: string): Promise<ApiResponse<TrainingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Training ID is required");
    }

    const cacheKey = generateCacheKey("training-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<TrainingDetail>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/trainings/${id}`,
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
   * Update training fields
   */
  async update(
    id: string,
    data: UpdateTrainingRequest,
  ): Promise<ApiResponse<TrainingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Training ID is required");
    }

    try {
      const response = await this.http.patch(
        `${this.config.apiUrl}/trainings/${id}`,
        data,
      );

      this.cache.delete(generateCacheKey("training-id", { id }));
      this.cache.delete(generateCacheKey("trainings", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Soft-delete (set is_active = false)
   */
  async deactivate(id: string): Promise<ApiResponse<TrainingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Training ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/trainings/${id}/deactivate`,
        {},
      );

      this.cache.delete(generateCacheKey("training-id", { id }));
      this.cache.delete(generateCacheKey("trainings", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Session CRUD
  // ============================================================

  /**
   * Create a session for a training
   */
  async createSession(
    trainingId: string,
    data: CreateSessionRequest,
  ): Promise<ApiResponse<TrainingSession>> {
    if (!trainingId) {
      throw new AtlasValidationError("Training ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/trainings/${trainingId}/sessions`,
        data,
      );

      this.cache.delete(generateCacheKey("training-id", { id: trainingId }));
      this.cache.delete(
        generateCacheKey("training-sessions", { id: trainingId }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List sessions for a training
   */
  async getSessions(
    trainingId: string,
    options: SessionQueryOptions = {},
  ): Promise<ApiResponse<TrainingSession[]>> {
    if (!trainingId) {
      throw new AtlasValidationError("Training ID is required");
    }

    const cacheKey = generateCacheKey("training-sessions", {
      id: trainingId,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<TrainingSession[]>>(cacheKey);
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
        `${this.config.apiUrl}/trainings/${trainingId}/sessions?${queryParams}`,
      )) as ApiResponse<TrainingSession[]>;

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
   * Update a session
   * NOTE: Route does NOT include trainingId
   */
  async updateSession(
    id: string,
    data: UpdateSessionRequest,
  ): Promise<ApiResponse<TrainingSession>> {
    if (!id) {
      throw new AtlasValidationError("Session ID is required");
    }

    try {
      const response = await this.http.patch(
        `${this.config.apiUrl}/trainings/sessions/${id}`,
        data,
      );

      this.cache.clear();

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a session
   * NOTE: Route does NOT include trainingId
   */
  async deleteSession(
    id: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("Session ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/trainings/sessions/${id}`,
      );

      this.cache.clear();

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
