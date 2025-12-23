// src/services/TimeEntriesService.ts
import {
  HoursByPeriod,
  EmployeeHoursStatistics,
  ProjectHoursStatistics,
  DebtorHoursStatistics,
  AverageHoursStatistics,
  UniqueEmployeesStatistics,
  EmployeeWithMissingHours,
  TimeEntrySummary,
  TimeEntryQueryOptions,
  ApiResponse,
  AtlasClientConfig,
} from "../types";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import { buildQueryParams, generateCacheKey } from "../utils/query";
import { AtlasError } from "../errors";

export class TimeEntriesService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Get aggregated hours by period
   */
  async getAggregatedHoursByPeriod(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<HoursByPeriod[]>> {
    const cacheKey = generateCacheKey("time-entries-hours-by-period", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<HoursByPeriod[]>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/hours-by-period?${queryParams}`,
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
   * Get employee hours by period
   */
  async getEmployeeHoursByPeriod(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<EmployeeHoursStatistics[]>> {
    const cacheKey = generateCacheKey("time-entries-employee-hours", options);

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<EmployeeHoursStatistics[]>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/employee/hours-by-period?${queryParams}`,
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
   * Get project hours by period
   */
  async getProjectHoursByPeriod(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<ProjectHoursStatistics[]>> {
    const cacheKey = generateCacheKey("time-entries-project-hours", options);

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<ProjectHoursStatistics[]>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/project/hours-by-period?${queryParams}`,
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
   * Get debtor hours by period
   */
  async getDebtorHoursByPeriod(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<DebtorHoursStatistics[]>> {
    const cacheKey = generateCacheKey("time-entries-debtor-hours", options);

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<DebtorHoursStatistics[]>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/debtor/hours-by-period?${queryParams}`,
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
   * Get average hours statistics
   */
  async getAverageHours(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<AverageHoursStatistics>> {
    const cacheKey = generateCacheKey("time-entries-average-hours", options);

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<AverageHoursStatistics>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/average-hours?${queryParams}`,
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
   * Get unique employees count and list
   */
  async getUniqueEmployees(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<UniqueEmployeesStatistics>> {
    const cacheKey = generateCacheKey("time-entries-unique-employees", options);

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<UniqueEmployeesStatistics>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/unique-employees?${queryParams}`,
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
   * Get employees with missing hours
   */
  async getEmployeesWithMissingHours(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<EmployeeWithMissingHours[]>> {
    const cacheKey = generateCacheKey("time-entries-missing-hours", options);

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<EmployeeWithMissingHours[]>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/missing-hours?${queryParams}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        // Shorter cache for missing hours
        this.cache.set(cacheKey, response, Math.min(this.config.cacheDuration, 1));
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get time entry summary
   */
  async getSummary(
    options: TimeEntryQueryOptions = {},
  ): Promise<ApiResponse<TimeEntrySummary>> {
    const cacheKey = generateCacheKey("time-entries-summary", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<TimeEntrySummary>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/time-entries/statistics/summary?${queryParams}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, this.config.cacheDuration);
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

