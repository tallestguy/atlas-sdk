// src/services/WebsiteService.ts
import {
  Website,
  WebsiteQueryOptions,
  WebsiteFile,
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

export class WebsiteService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Create a new website
   */
  async create(
    data: Omit<Website, "id" | "created_at" | "updated_at">,
  ): Promise<ApiResponse<Website>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/website/create`,
        data,
      );

      this.cache.delete(generateCacheKey("websites", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a website by ID
   */
  async getById(id: string): Promise<ApiResponse<Website>> {
    if (!id) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("website-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Website>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/website/${id}`,
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
   * Get all websites
   */
  async list(
    options: WebsiteQueryOptions = {},
  ): Promise<ApiResponse<Website[]>> {
    const cacheKey = generateCacheKey("websites", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Website[]>>(cacheKey);
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
        `${this.config.apiUrl}/website?${queryParams}`,
      )) as ApiResponse<Website[]>;

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
   * Update a website
   */
  async update(
    id: string,
    data: Partial<Website>,
  ): Promise<ApiResponse<Website>> {
    if (!id) {
      throw new AtlasValidationError("Website ID is required");
    }

    try {
      const response = await this.http.put(
        `${this.config.apiUrl}/website/${id}`,
        data,
      );

      this.cache.delete(generateCacheKey("website-id", { id }));
      this.cache.delete(generateCacheKey("websites", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a website
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("Website ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/website/${id}`,
      );

      this.cache.delete(generateCacheKey("website-id", { id }));
      this.cache.delete(generateCacheKey("websites", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get content for a website
   */
  async getContent(
    websiteId: string,
    options: Record<string, unknown> = {},
  ): Promise<ApiResponse<unknown[]>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("website-content", {
      websiteId,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<unknown[]>>(cacheKey);
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
        `${this.config.apiUrl}/website/${websiteId}/content?${queryParams}`,
      )) as ApiResponse<unknown[]>;

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
   * Get files for a website
   */
  async getFiles(
    websiteId: string,
    type: "public" | "private" | "all" = "all",
  ): Promise<ApiResponse<WebsiteFile[]>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("website-files", { websiteId, type });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<WebsiteFile[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/website/${websiteId}/files?type=${type}`,
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
   * Upload a file to a website
   * Note: This is a simplified version. In browser environments, you'll need to use FormData
   */
  async uploadFile(
    websiteId: string,
    file: File,
  ): Promise<ApiResponse<WebsiteFile>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    if (!file) {
      throw new AtlasValidationError("File is required");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.http.postFormData(
        `${this.config.apiUrl}/website/${websiteId}/files`,
        formData,
      );

      // Invalidate file cache
      this.cache.delete(generateCacheKey("website-files", { websiteId }));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a file from a website
   */
  async deleteFile(
    websiteId: string,
    fileId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/website/${websiteId}/files/${fileId}`,
      );

      // Invalidate file cache
      this.cache.delete(generateCacheKey("website-files", { websiteId }));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set website logo
   */
  async setLogo(
    websiteId: string,
    fileId: string,
  ): Promise<ApiResponse<Website>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/website/${websiteId}/logo`,
        { file_id: fileId },
      );

      this.cache.delete(generateCacheKey("website-id", { id: websiteId }));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set website favicon
   */
  async setFavicon(
    websiteId: string,
    fileId: string,
  ): Promise<ApiResponse<Website>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/website/${websiteId}/favicon`,
        { file_id: fileId },
      );

      this.cache.delete(generateCacheKey("website-id", { id: websiteId }));

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

