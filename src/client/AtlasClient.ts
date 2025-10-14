import {
  AtlasClientConfig,
  ContentItem,
  ContentQueryOptions,
  PaginationOptions,
  ApiResponse,
} from "../types";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import {
  buildQueryParams,
  generateCacheKey,
  processPaginationOptions,
  enrichPaginationResponse,
} from "../utils";
import { AtlasError, AtlasValidationError } from "../errors";

export class AtlasClient {
  private config: AtlasClientConfig;
  private cache: MemoryCache;
  private http: HttpClient;

  constructor(config: AtlasClientConfig) {
    this.validateConfig(config);

    this.config = {
      timeout: 10000,
      cache: true,
      cacheDuration: 5,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.cache = new MemoryCache();
    this.http = new HttpClient({
      timeout: this.config.timeout!,
      retries: this.config.retries!,
      retryDelay: this.config.retryDelay!,
      headers: this.getDefaultHeaders(),
    });
  }

  // Main API methods
  async getContent(
    options: ContentQueryOptions = {},
  ): Promise<ApiResponse<ContentItem[]>> {
    const cacheKey = generateCacheKey("content", options);

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
      // Remove page from query params since API uses offset
      page: undefined,
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

      if (this.config.cache) {
        this.cache.set(cacheKey, enrichedResponse, this.config.cacheDuration!);
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContentBySlug(
    slug: string,
  ): Promise<ApiResponse<ContentItem | null>> {
    if (!slug) {
      throw new AtlasValidationError("Slug is required");
    }

    const cacheKey = generateCacheKey("content-slug", { slug });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<ContentItem | null>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/content/slug/${slug}?website_id=${this.config.websiteId}`,
      );

      if (this.config.cache) {
        this.cache.set(cacheKey, response, this.config.cacheDuration!);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  updateConfig(newConfig: Partial<AtlasClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private methods
  private validateConfig(config: AtlasClientConfig): void {
    if (!config.apiUrl) {
      throw new AtlasValidationError("apiUrl is required");
    }
    if (!config.websiteId) {
      throw new AtlasValidationError("websiteId is required");
    }
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
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

  async getActivePublicationsByAgency(
    agency: string,
    options: PaginationOptions = {},
  ): Promise<ApiResponse<ContentItem[]>> {
    if (!agency) {
      throw new AtlasValidationError("Agency is required");
    }

    const cacheKey = generateCacheKey("publications-agency", {
      agency,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<ContentItem[]>>(cacheKey);
      if (cached) return cached;
    }

    // Process pagination options
    const paginationInfo = processPaginationOptions(options);

    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/publications/active/agency/${agency}?${queryParams}`,
      )) as ApiResponse<ContentItem[]>;

      // Enrich response with complete pagination info
      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache) {
        this.cache.set(cacheKey, enrichedResponse, this.config.cacheDuration!);
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
