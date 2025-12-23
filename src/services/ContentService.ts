// src/services/ContentService.ts
import {
  ContentItem,
  ContentQueryOptions,
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

export class ContentService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * List content with optional filtering and pagination
   * @param options Query options for filtering and pagination
   * @returns Paginated list of content items
   */
  async list(
    options: ContentQueryOptions = {},
  ): Promise<ApiResponse<ContentItem[]>> {
    const cacheKey = generateCacheKey("content", options);

    // Check cache first
    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<ContentItem[]>>(cacheKey);
      if (cached) return cached;
    }

    // Process pagination options (handle page -> offset conversion)
    const paginationInfo = processPaginationOptions(options);

    const queryParams = buildQueryParams({
      website_id: this.config.websiteId,
      ...options,
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
      page: undefined, // Remove page from query params since API uses offset
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/content?${queryParams}`,
      )) as ApiResponse<ContentItem[]>;

      // Enrich response with complete pagination info
      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      // Cache the response
      if (this.config.cache) {
        this.cache.set(cacheKey, enrichedResponse, this.config.cacheDuration!);
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single content item by its slug
   *
   * ⚠️ **NOT YET IMPLEMENTED** - This endpoint is not yet available in the Atlas API
   *
   * @param slug The unique slug identifier
   * @returns Content item or null if not found
   * @todo API implementation pending - endpoint `/content/slug/{slug}` not available
   * @throws {AtlasError} Will throw an error until API endpoint is implemented
   * @since 1.0.0
   * @experimental This method is experimental and may change
   */
  async getBySlug(slug: string): Promise<ApiResponse<ContentItem | null>> {
    if (!slug) {
      throw new AtlasValidationError("Slug is required");
    }

    const cacheKey = generateCacheKey("content-slug", { slug });

    // Check cache first
    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<ContentItem | null>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/content/website/${this.config.websiteId}/slug/${slug}`,
      );

      // Cache the response
      if (this.config.cache) {
        this.cache.set(cacheKey, response, this.config.cacheDuration!);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single content item by its ID
   * @param id The unique content identifier
   * @returns Content item or null if not found
   */
  async getById(id: string): Promise<ApiResponse<ContentItem | null>> {
    if (!id) {
      throw new AtlasValidationError("Content ID is required");
    }

    const cacheKey = generateCacheKey("content-id", { id });

    // Check cache first
    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<ContentItem | null>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/content/${id}`,
      );

      // Cache the response
      if (this.config.cache) {
        this.cache.set(cacheKey, response, this.config.cacheDuration!);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new content item
   * @param data Content data to create
   * @returns Created content item
   */
  async create(
    data: Omit<ContentItem, "id" | "created_at" | "updated_at">,
  ): Promise<ApiResponse<ContentItem>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/content`,
        data,
      );

      // Invalidate list cache since we've added new content
      this.cache.delete(generateCacheKey("content", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing content item
   * @param id Content ID to update
   * @param data Updated content data
   * @returns Updated content item
   */
  async update(
    id: string,
    data: Partial<ContentItem>,
  ): Promise<ApiResponse<ContentItem>> {
    if (!id) {
      throw new AtlasValidationError("Content ID is required");
    }

    try {
      const response = await this.http.put(
        `${this.config.apiUrl}/content/${id}`,
        data,
      );

      // Invalidate caches
      this.cache.delete(generateCacheKey("content-id", { id }));
      this.cache.delete(generateCacheKey("content", {}));

      // If slug is in the data, invalidate that cache too
      if (data.slug) {
        this.cache.delete(
          generateCacheKey("content-slug", { slug: data.slug }),
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a content item
   * @param id Content ID to delete
   * @returns Success response
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("Content ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/content/${id}`,
      );

      // Invalidate caches
      this.cache.delete(generateCacheKey("content-id", { id }));
      this.cache.delete(generateCacheKey("content", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Private helper method
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
