// src/services/AFASService.ts
import {
  AFASEmployee,
  AFASTimeEntry,
  AFASEmployeeQueryOptions,
  AFASTimeEntryQueryOptions,
  AFASSyncStatistics,
  AFASConnectionTest,
  AFASConfig,
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

export class AFASService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Sync all employees from AFAS
   */
  async syncEmployees(): Promise<
    ApiResponse<{ job_id: string; status: string }>
  > {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/afas/employees/sync`,
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync a single employee by ID
   */
  async syncEmployeeById(
    employeeId: string,
  ): Promise<ApiResponse<AFASEmployee>> {
    if (!employeeId) {
      throw new AtlasValidationError("Employee ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/afas/employees/sync/${employeeId}`,
      );

      this.cache.delete(
        generateCacheKey("afas-employee-id", { employeeId }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all employees
   */
  async getEmployees(
    options: AFASEmployeeQueryOptions = {},
  ): Promise<ApiResponse<AFASEmployee[]>> {
    const cacheKey = generateCacheKey("afas-employees", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<AFASEmployee[]>>(cacheKey);
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
        `${this.config.apiUrl}/afas/employees?${queryParams}`,
      )) as ApiResponse<AFASEmployee[]>;

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
   * Get an employee by ID
   */
  async getEmployeeById(employeeId: string): Promise<ApiResponse<AFASEmployee>> {
    if (!employeeId) {
      throw new AtlasValidationError("Employee ID is required");
    }

    const cacheKey = generateCacheKey("afas-employee-id", { employeeId });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<AFASEmployee>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/afas/employees/${employeeId}`,
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
   * Get employee sync statistics
   */
  async getEmployeeSyncStatistics(): Promise<
    ApiResponse<AFASSyncStatistics>
  > {
    const cacheKey = generateCacheKey("afas-employee-statistics", {});

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<AFASSyncStatistics>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/afas/employees/statistics`,
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
   * Sync all time entries from AFAS
   */
  async syncTimeEntries(): Promise<
    ApiResponse<{ job_id: string; status: string }>
  > {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/afas/time-entries/sync`,
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all time entries
   */
  async getTimeEntries(
    options: AFASTimeEntryQueryOptions = {},
  ): Promise<ApiResponse<AFASTimeEntry[]>> {
    const cacheKey = generateCacheKey("afas-time-entries", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<AFASTimeEntry[]>>(cacheKey);
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
        `${this.config.apiUrl}/afas/time-entries?${queryParams}`,
      )) as ApiResponse<AFASTimeEntry[]>;

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
   * Get a time entry by identity
   */
  async getTimeEntryById(identity: string): Promise<ApiResponse<AFASTimeEntry>> {
    if (!identity) {
      throw new AtlasValidationError("Time entry identity is required");
    }

    const cacheKey = generateCacheKey("afas-time-entry-id", { identity });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<AFASTimeEntry>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/afas/time-entries/${identity}`,
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
   * Get time entry sync statistics
   */
  async getTimeEntrySyncStatistics(): Promise<
    ApiResponse<AFASSyncStatistics>
  > {
    const cacheKey = generateCacheKey("afas-time-entry-statistics", {});

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<AFASSyncStatistics>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/afas/time-entries/statistics`,
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
   * Cleanup time entries
   */
  async cleanupTimeEntries(): Promise<
    ApiResponse<{ deleted: number; errors?: any[] }>
  > {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/afas/time-entries/cleanup`,
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Test AFAS connection
   */
  async testConnection(): Promise<ApiResponse<AFASConnectionTest>> {
    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/afas/test-connection`,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get AFAS configuration
   */
  async getConfig(): Promise<ApiResponse<AFASConfig>> {
    const cacheKey = generateCacheKey("afas-config", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<AFASConfig>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/afas/config`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, this.config.cacheDuration * 5);
      }

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

