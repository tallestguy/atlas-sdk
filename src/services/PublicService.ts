// src/services/PublicService.ts
import {
  ContentItem,
  Location,
  Person,
  Website,
  Publication,
  SubmissionContext,
  AgendaItem,
  SubmitAgendaItemRequest,
  PublicTraining,
  PublicTrainingQueryOptions,
  PaginationOptions,
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

export class PublicService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  // ============================================================
  // Content
  // ============================================================

  /**
   * Get content by ID
   */
  async getContent(id: string): Promise<ApiResponse<ContentItem>> {
    if (!id) {
      throw new AtlasValidationError("Content ID is required");
    }

    const cacheKey = generateCacheKey("public-content-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<ContentItem>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/content/${id}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get content by slug
   */
  async getContentBySlug(slug: string): Promise<ApiResponse<ContentItem>> {
    if (!slug) {
      throw new AtlasValidationError("Content slug is required");
    }

    const cacheKey = generateCacheKey("public-content-slug", { slug });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<ContentItem>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/content/slug/${slug}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Locations
  // ============================================================

  /**
   * List active locations
   */
  async getLocations(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Location[]>> {
    const cacheKey = generateCacheKey("public-locations", options);

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
        `${this.config.apiUrl}/public/locations?${queryParams}`,
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          enrichedResponse,
          this.config.cacheDuration * 2,
        );
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get location by ID
   */
  async getLocation(id: string): Promise<ApiResponse<Location>> {
    if (!id) {
      throw new AtlasValidationError("Location ID is required");
    }

    const cacheKey = generateCacheKey("public-location-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Location>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/locations/${id}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get locations by agency
   */
  async getLocationsByAgency(
    agencyName: string,
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Location[]>> {
    if (!agencyName) {
      throw new AtlasValidationError("Agency name is required");
    }

    const cacheKey = generateCacheKey("public-locations-agency", {
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
        `${this.config.apiUrl}/public/locations/agency/${encodeURIComponent(
          agencyName,
        )}?${queryParams}`,
      )) as ApiResponse<Location[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          enrichedResponse,
          this.config.cacheDuration * 2,
        );
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // People
  // ============================================================

  /**
   * List people
   */
  async getPeople(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Person[]>> {
    const cacheKey = generateCacheKey("public-people", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Person[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/public/people?${queryParams}`,
      )) as ApiResponse<Person[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          enrichedResponse,
          this.config.cacheDuration * 2,
        );
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get person by ID
   */
  async getPerson(id: string): Promise<ApiResponse<Person>> {
    if (!id) {
      throw new AtlasValidationError("Person ID is required");
    }

    const cacheKey = generateCacheKey("public-person-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Person>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/people/${id}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get people by website
   */
  async getPeopleByWebsite(
    websiteId: string,
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Person[]>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("public-people-website", {
      websiteId,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Person[]>>(cacheKey);
      if (cached) return cached;
    }

    const paginationInfo = processPaginationOptions(options);
    const queryParams = buildQueryParams({
      limit: paginationInfo.limit,
      offset: paginationInfo.offset,
    });

    try {
      const response = (await this.http.get(
        `${this.config.apiUrl}/public/people/website/${websiteId}?${queryParams}`,
      )) as ApiResponse<Person[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          enrichedResponse,
          this.config.cacheDuration * 2,
        );
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Websites
  // ============================================================

  /**
   * List active websites
   */
  async getWebsites(): Promise<ApiResponse<Website[]>> {
    const cacheKey = generateCacheKey("public-websites", {});

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Website[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/websites`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get website by ID
   */
  async getWebsite(id: string): Promise<ApiResponse<Website>> {
    if (!id) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("public-website-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Website>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/websites/${id}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Publications
  // ============================================================

  /**
   * List publications
   */
  async getPublications(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    const cacheKey = generateCacheKey("public-publications", options);

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
        `${this.config.apiUrl}/public/publications?${queryParams}`,
      )) as ApiResponse<Publication[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          enrichedResponse,
          this.config.cacheDuration * 2,
        );
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get publication by ID
   */
  async getPublication(id: string): Promise<ApiResponse<Publication>> {
    if (!id) {
      throw new AtlasValidationError("Publication ID is required");
    }

    const cacheKey = generateCacheKey("public-publication-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Publication>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/publications/${id}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get publications by agency
   */
  async getPublicationsByAgency(
    agencyName: string,
    options: PaginationOptions = {},
  ): Promise<ApiResponse<Publication[]>> {
    if (!agencyName) {
      throw new AtlasValidationError("Agency name is required");
    }

    const cacheKey = generateCacheKey("public-publications-agency", {
      agencyName,
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
        `${this.config.apiUrl}/public/publications/agency/${encodeURIComponent(
          agencyName,
        )}?${queryParams}`,
      )) as ApiResponse<Publication[]>;

      const enrichedResponse = enrichPaginationResponse(
        response,
        paginationInfo.limit,
        paginationInfo.page,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          enrichedResponse,
          this.config.cacheDuration * 2,
        );
      }

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Meeting Agenda Submission (token-based)
  // ============================================================

  /**
   * Get submission context
   */
  async getSubmissionContext(
    token: string,
  ): Promise<ApiResponse<SubmissionContext>> {
    if (!token) {
      throw new AtlasValidationError("Submission token is required");
    }

    const cacheKey = generateCacheKey("public-submission-context", { token });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<SubmissionContext>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/meetings/agenda/${token}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit an agenda item
   */
  async submitAgendaItem(
    token: string,
    data: SubmitAgendaItemRequest,
  ): Promise<ApiResponse<AgendaItem>> {
    if (!token) {
      throw new AtlasValidationError("Submission token is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/public/meetings/agenda/${token}`,
        data,
      );

      this.cache.delete(
        generateCacheKey("public-submission-context", { token }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Trainings (public view)
  // ============================================================

  /**
   * Get published trainings with upcoming sessions
   */
  async getTrainings(
    options: PublicTrainingQueryOptions = {},
  ): Promise<ApiResponse<PublicTraining[]>> {
    const cacheKey = generateCacheKey("public-trainings", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<PublicTraining[]>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/public/trainings?${queryParams}`,
      );

      if (this.config.cache && this.config.cacheDuration) {
        this.cache.set(
          cacheKey,
          response,
          this.config.cacheDuration * 2,
        );
      }

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
