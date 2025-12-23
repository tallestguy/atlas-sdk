// src/services/PeopleService.ts
import {
  Person,
  PersonQueryOptions,
  CreatePersonRequest,
  ApplicationSubmissionRequest,
  EmailMarketingContact,
  TeamMemberProfile,
  PersonApplication,
  PersonWebsiteRelationship,
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

export class PeopleService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Create a new person
   */
  async create(data: CreatePersonRequest): Promise<ApiResponse<Person>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/people/create`,
        data,
      );

      this.cache.delete(generateCacheKey("people", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a person by ID
   */
  async getById(id: string): Promise<ApiResponse<Person>> {
    if (!id) {
      throw new AtlasValidationError("Person ID is required");
    }

    const cacheKey = generateCacheKey("person-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Person>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/people/${id}`,
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
   * Get a person by email
   */
  async getByEmail(email: string): Promise<ApiResponse<Person>> {
    if (!email) {
      throw new AtlasValidationError("Email is required");
    }

    const cacheKey = generateCacheKey("person-email", { email });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Person>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/people/email?email=${encodeURIComponent(email)}`,
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
   * Get all people with optional filtering
   */
  async list(
    options: PersonQueryOptions = {},
  ): Promise<ApiResponse<Person[]>> {
    const cacheKey = generateCacheKey("people", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Person[]>>(cacheKey);
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
        `${this.config.apiUrl}/people?${queryParams}`,
      )) as ApiResponse<Person[]>;

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
   * Update a person
   */
  async update(
    id: string,
    data: Partial<Person>,
  ): Promise<ApiResponse<Person>> {
    if (!id) {
      throw new AtlasValidationError("Person ID is required");
    }

    try {
      const response = await this.http.put(
        `${this.config.apiUrl}/people/${id}`,
        data,
      );

      this.cache.delete(generateCacheKey("person-id", { id }));
      this.cache.delete(generateCacheKey("people", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a person
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("Person ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/people/${id}`,
      );

      this.cache.delete(generateCacheKey("person-id", { id }));
      this.cache.delete(generateCacheKey("people", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit an application
   */
  async submitApplication(
    data: ApplicationSubmissionRequest,
  ): Promise<ApiResponse<PersonApplication>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/people/application`,
        data,
      );

      this.cache.delete(generateCacheKey("applications", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get team members for a website
   */
  async getTeamMembers(
    websiteId: string,
    options: PersonQueryOptions = {},
  ): Promise<ApiResponse<TeamMemberProfile[]>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("team-members", { websiteId, ...options });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<TeamMemberProfile[]>>(cacheKey);
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
        `${this.config.apiUrl}/people/${websiteId}/team-members?${queryParams}`,
      )) as ApiResponse<TeamMemberProfile[]>;

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
   * Get applications for a website
   */
  async getApplications(
    websiteId: string,
    options: PersonQueryOptions = {},
  ): Promise<ApiResponse<PersonApplication[]>> {
    if (!websiteId) {
      throw new AtlasValidationError("Website ID is required");
    }

    const cacheKey = generateCacheKey("applications", { websiteId, ...options });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<PersonApplication[]>>(cacheKey);
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
        `${this.config.apiUrl}/people/${websiteId}/applications?${queryParams}`,
      )) as ApiResponse<PersonApplication[]>;

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
   * Get email marketing list
   */
  async getEmailMarketingList(): Promise<
    ApiResponse<EmailMarketingContact[]>
  > {
    const cacheKey = generateCacheKey("email-marketing-list", {});

    if (this.config.cache) {
      const cached =
        this.cache.get<ApiResponse<EmailMarketingContact[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/people/marketing/email-list`,
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
   * Upsert website relationship
   */
  async upsertWebsiteRelationship(
    data: Omit<PersonWebsiteRelationship, "id" | "created_at" | "updated_at">,
  ): Promise<ApiResponse<PersonWebsiteRelationship>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/people/website-relationship`,
        data,
      );

      this.cache.delete(
        generateCacheKey("team-members", { websiteId: data.website_id }),
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync person from Carerix
   */
  async syncFromCarerix(
    carerixId: string,
  ): Promise<ApiResponse<{ person: Person; synced: boolean }>> {
    if (!carerixId) {
      throw new AtlasValidationError("Carerix ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/people/sync/carerix`,
        { carerix_id: carerixId },
      );

      this.cache.clear();
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload file for a person
   */
  async uploadFile(
    personId: string,
    file: File,
  ): Promise<ApiResponse<unknown>> {
    if (!personId) {
      throw new AtlasValidationError("Person ID is required");
    }

    if (!file) {
      throw new AtlasValidationError("File is required");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.http.postFormData(
        `${this.config.apiUrl}/people/${personId}/files`,
        formData,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get files for a person
   */
  async getFiles(personId: string): Promise<ApiResponse<unknown[]>> {
    if (!personId) {
      throw new AtlasValidationError("Person ID is required");
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/people/${personId}/files`,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a file from a person
   */
  async deleteFile(
    personId: string,
    fileId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    if (!personId) {
      throw new AtlasValidationError("Person ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/people/${personId}/files/${fileId}`,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set profile photo for a person
   */
  async setProfilePhoto(
    personId: string,
    fileId: string,
  ): Promise<ApiResponse<Person>> {
    if (!personId) {
      throw new AtlasValidationError("Person ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/people/${personId}/profile-photo`,
        { file_id: fileId },
      );

      this.cache.delete(generateCacheKey("person-id", { id: personId }));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set resume for a person
   */
  async setResume(
    personId: string,
    fileId: string,
  ): Promise<ApiResponse<Person>> {
    if (!personId) {
      throw new AtlasValidationError("Person ID is required");
    }

    if (!fileId) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/people/${personId}/resume`,
        { file_id: fileId },
      );

      this.cache.delete(generateCacheKey("person-id", { id: personId }));

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

