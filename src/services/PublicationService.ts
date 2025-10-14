// src/services/PublicationService.ts
import {
  AtlasClientConfig,
  ApiResponse,
  PaginationOptions,
  Publication,
  PublicationQueryOptions,
  PublicationStatistics,
} from "../types";
import { MemoryCache, HttpClient } from "../core";

import {
  buildQueryParams,
  generateCacheKey,
  processPaginationOptions,
  enrichPaginationResponse,
} from "../utils";

import { AtlasError, AtlasValidationError } from "../errors";

export class PublicationService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * POST /publications - Create a new publication
   */
  async create(
    data: Omit<Publication, "id" | "created_at" | "updated_at">,
  ): Promise<ApiResponse<Publication>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/publications`,
        data,
      );

      this.cache.delete(generateCacheKey("publications", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /publications/bulk - Bulk create publications
   */
  async bulkCreate(
    publications: Omit<Publication, "id" | "created_at" | "updated_at">[],
  ): Promise<ApiResponse<{ created: number; failed: number; errors?: any[] }>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/publications/bulk`,
        { publications },
      );

      this.cache.delete(generateCacheKey("publications", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /publications/:id - Get a publication by ID
   */
  async getById(id: string): Promise<ApiResponse<Publication>> {
    if (!id) {
      throw new AtlasValidationError("Publication ID is required");
    }

    const cacheKey = generateCacheKey("publication-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/publications/${id}`,
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
   * GET /publications/carerix/:carerixId - Get a publication by Carerix ID
   */
  async getByCarerixId(carerixId: string): Promise<ApiResponse<Publication>> {
    if (!carerixId) {
      throw new AtlasValidationError("Carerix ID is required");
    }

    const cacheKey = generateCacheKey("publication-carerix", { carerixId });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/publications/carerix/${carerixId}`,
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
   * GET /publications/carerix/location/:carerixLocationId - Get publications by Carerix location ID
   */
  async getByCarerixLocationId(
    carerixLocationId: string,
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    if (!carerixLocationId) {
      throw new AtlasValidationError("Carerix location ID is required");
    }

    const cacheKey = generateCacheKey("publications-location", {
      carerixLocationId,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/publications/carerix/location/${carerixLocationId}?${queryParams}`,
      )) as ApiResponse<Publication[]>;

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
   * PUT /publications/:id - Update a publication
   */
  async update(
    id: string,
    data: Partial<Publication>,
  ): Promise<ApiResponse<Publication>> {
    if (!id) {
      throw new AtlasValidationError("Publication ID is required");
    }

    try {
      const response = await this.http.put(
        `${this.config.apiUrl}/publications/${id}`,
        data,
      );

      this.cache.delete(generateCacheKey("publication-id", { id }));
      this.cache.delete(generateCacheKey("publications", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE /publications/:id - Delete a publication
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("Publication ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/publications/${id}`,
      );

      this.cache.delete(generateCacheKey("publication-id", { id }));
      this.cache.delete(generateCacheKey("publications", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /publications/search - Search publications
   */
  async search(
    options: PublicationQueryOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    const cacheKey = generateCacheKey("publications-search", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication[]>>(cacheKey);
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
        `${this.config.apiUrl}/publications/search?${queryParams}`,
      )) as ApiResponse<Publication[]>;

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
   * GET /publications/active - Get all active publications
   */
  async getActive(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    const cacheKey = generateCacheKey("publications-active", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/publications/active?${queryParams}`,
      )) as ApiResponse<Publication[]>;

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
   * GET /publications/active/agency/:agencyName - Get active publications by agency
   */
  async getActiveByAgency(
    agency: string,
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    if (!agency) {
      throw new AtlasValidationError("Agency is required");
    }

    const cacheKey = generateCacheKey("publications-agency", {
      agency,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/publications/active/agency/${agency}?${queryParams}`,
      )) as ApiResponse<Publication[]>;

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
   * GET /publications/expired - Get expired publications
   */
  async getExpired(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    const cacheKey = generateCacheKey("publications-expired", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/publications/expired?${queryParams}`,
      )) as ApiResponse<Publication[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      // Shorter cache for expired items
      if (this.config.cache && this.config.cacheDuration) {
        const shortCache = Math.min(this.config.cacheDuration, 1);
        this.cache.set(cacheKey, enrichedResponse, shortCache);
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /publications/stale - Get stale publications
   */
  async getStale(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    const cacheKey = generateCacheKey("publications-stale", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/publications/stale?${queryParams}`,
      )) as ApiResponse<Publication[]>;

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
   * POST /publications/sync - Sync publications from Carerix
   */
  async syncFromCarerix(): Promise<
    ApiResponse<{ job_id: string; status: string }>
  > {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/publications/sync`,
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /publications/statistics - Get publication statistics
   */
  async getStatistics(): Promise<ApiResponse<PublicationStatistics>> {
    const cacheKey = generateCacheKey("publications-statistics", {});

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<PublicationStatistics>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/publications/statistics`,
      );

      // Longer cache for statistics
      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(cacheKey, response, this.config.cacheDuration * 2);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE /publications/cleanup/expired - Cleanup expired publications
   */
  async cleanupExpired(): Promise<
    ApiResponse<{ deleted: number; errors?: any[] }>
  > {
    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/publications/cleanup/expired`,
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /publications/:id/carerix-format - Transform publication to Carerix format
   */
  async transformToCarerixFormat(id: string): Promise<ApiResponse<any>> {
    if (!id) {
      throw new AtlasValidationError("Publication ID is required");
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/publications/${id}/carerix-format`,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Private helper method to handle errors consistently
   */
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
