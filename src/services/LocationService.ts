// src/services/LocationService.ts
import {
  Location,
  LocationQueryOptions,
  LocationStatistics,
  LocationEnrichmentResult,
  BulkEnrichmentResult,
  ApiResponse,
  AtlasClientConfig,
  PaginationOptions,
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

export class LocationService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient
  ) {}

  /**
   * Create a new location
   */
  async create(
    data: Omit<Location, "id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<Location>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/locations`,
        data
      );

      this.cache.delete(generateCacheKey("locations", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk create locations
   */
  async bulkCreate(
    locations: Omit<Location, "id" | "created_at" | "updated_at">[]
  ): Promise<ApiResponse<{ created: number; failed: number; errors?: any[] }>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/locations/bulk`,
        { locations }
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a location by ID
   */
  async getById(id: string): Promise<ApiResponse<Location>> {
    if (!id) {
      throw new AtlasValidationError("Location ID is required");
    }

    const cacheKey = generateCacheKey("location-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/locations/${id}`
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
   * Get a location by Carerix ID
   */
  async getByCarerixId(carerixId: string): Promise<ApiResponse<Location>> {
    if (!carerixId) {
      throw new AtlasValidationError("Carerix ID is required");
    }

    const cacheKey = generateCacheKey("location-carerix", { carerixId });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/locations/carerix/${carerixId}`
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
   * Get all locations with optional filtering
   */
  async list(
    options: LocationQueryOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    const cacheKey = generateCacheKey("locations", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
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
        `${this.config.apiUrl}/locations?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Search locations
   */
  async search(
    options: LocationQueryOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    const cacheKey = generateCacheKey("locations-search", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
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
        `${this.config.apiUrl}/locations/search?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Get active locations
   */
  async getActive(
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    const cacheKey = generateCacheKey("locations-active", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/locations/active?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Get locations by agency
   */
  async getByAgency(
    agencyName: string,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    if (!agencyName) {
      throw new AtlasValidationError("Agency name is required");
    }

    const cacheKey = generateCacheKey("locations-agency", {
      agencyName,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/locations/agency/${encodeURIComponent(
          agencyName
        )}?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Get debtor locations
   */
  async getDebtorLocations(
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    const cacheKey = generateCacheKey("locations-debtor", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/locations/debtor?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Get locations missing coordinates
   */
  async getMissingCoordinates(
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    const cacheKey = generateCacheKey("locations-missing-coords", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/locations/missing-coordinates?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Get stale locations
   */
  async getStale(
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    const cacheKey = generateCacheKey("locations-stale", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/locations/stale?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Get locations by sync job
   */
  async getBySyncJob(
    syncJobId: string,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Location[]>> {
    if (!syncJobId) {
      throw new AtlasValidationError("Sync job ID is required");
    }

    const cacheKey = generateCacheKey("locations-sync-job", {
      syncJobId,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/locations/sync-job/${syncJobId}?${queryParams}`
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page
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
   * Update a location
   */
  async update(
    id: string,
    data: Partial<Location>
  ): Promise<ApiResponse<Location>> {
    if (!id) {
      throw new AtlasValidationError("Location ID is required");
    }

    try {
      const response = await this.http.put(
        `${this.config.apiUrl}/locations/${id}`,
        data
      );

      this.cache.delete(generateCacheKey("location-id", { id }));
      this.cache.delete(generateCacheKey("locations", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a location
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("Location ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/locations/${id}`
      );

      this.cache.delete(generateCacheKey("location-id", { id }));
      this.cache.delete(generateCacheKey("locations", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync locations from Carerix
   */
  async syncFromCarerix(options?: {
    force?: boolean;
  }): Promise<ApiResponse<{ job_id: string; status: string }>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/locations/sync`,
        options
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Enrich a location with additional data
   */
  async enrich(
    id: string,
    force: boolean = false
  ): Promise<ApiResponse<LocationEnrichmentResult>> {
    if (!id) {
      throw new AtlasValidationError("Location ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/locations/${id}/enrich`,
        { force }
      );

      this.cache.delete(generateCacheKey("location-id", { id }));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk enrich locations
   */
  async bulkEnrich(
    locationIds: string[],
    force: boolean = false
  ): Promise<ApiResponse<BulkEnrichmentResult>> {
    if (!locationIds || locationIds.length === 0) {
      throw new AtlasValidationError("Location IDs are required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/locations/bulk/enrich`,
        { location_ids: locationIds, force }
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get location statistics
   */
  async getStatistics(): Promise<ApiResponse<LocationStatistics>> {
    const cacheKey = generateCacheKey("locations-statistics", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<LocationStatistics>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/locations/statistics`
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
   * Cleanup inactive locations
   */
  async cleanupInactive(): Promise<
    ApiResponse<{ deleted: number; errors?: any[] }>
  > {
    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/locations/cleanup/inactive`
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload file for a location
   */
  async uploadFile(locationId: string, file: File): Promise<ApiResponse<any>> {
    if (!locationId) {
      throw new AtlasValidationError("Location ID is required");
    }

    if (!file) {
      throw new AtlasValidationError("File is required");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.http.postFormData(
        `${this.config.apiUrl}/locations/${locationId}/files`,
        formData
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get files for a location
   */
  async getFiles(locationId: string): Promise<ApiResponse<any[]>> {
    if (!locationId) {
      throw new AtlasValidationError("Location ID is required");
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/locations/${locationId}/files`
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a file from a location
   */
  async deleteFile(
    locationId: string,
    fileId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    if (!locationId) {
      throw new AtlasValidationError("Location ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/locations/${locationId}/files/${fileId}`
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set featured image for a location
   */
  async setFeaturedImage(
    locationId: string,
    fileId: string
  ): Promise<ApiResponse<Location>> {
    if (!locationId) {
      throw new AtlasValidationError("Location ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/locations/${locationId}/featured-image`,
        { file_id: fileId }
      );

      this.cache.delete(generateCacheKey("location-id", { id: locationId }));

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
      "UNKNOWN_ERROR"
    );
  }
}
