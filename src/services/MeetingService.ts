// src/services/MeetingService.ts
import {
  MeetingSummary,
  MeetingDetail,
  Participant,
  AgendaItem,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  CopyMeetingRequest,
  AddParticipantRequest,
  AddParticipantByEmailRequest,
  UpdateAgendaItemRequest,
  ReorderAgendaItemsRequest,
  MeetingQueryOptions,
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

export class MeetingService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  // ============================================================
  // Meeting CRUD
  // ============================================================

  /**
   * Create a new meeting
   */
  async create(
    data: CreateMeetingRequest,
  ): Promise<ApiResponse<MeetingDetail>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings`,
        data,
      );

      this.cache.delete(generateCacheKey("meetings", {}));
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List meetings with filtering & pagination
   */
  async list(
    options: MeetingQueryOptions = {},
  ): Promise<ApiResponse<MeetingSummary[]>> {
    const cacheKey = generateCacheKey("meetings", options);

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<MeetingSummary[]>>(cacheKey);
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
        `${this.config.apiUrl}/meetings?${queryParams}`,
      )) as ApiResponse<MeetingSummary[]>;

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
   * Get full meeting detail with participants & agenda items
   */
  async getById(id: string): Promise<ApiResponse<MeetingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    const cacheKey = generateCacheKey("meeting-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<MeetingDetail>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/meetings/${id}`,
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
   * Update meeting fields
   */
  async update(
    id: string,
    data: UpdateMeetingRequest,
  ): Promise<ApiResponse<MeetingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.patch(
        `${this.config.apiUrl}/meetings/${id}`,
        data,
      );

      this.cache.delete(generateCacheKey("meeting-id", { id }));
      this.cache.delete(generateCacheKey("meetings", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a meeting (sets status to "cancelled")
   */
  async cancel(id: string): Promise<ApiResponse<MeetingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings/${id}/cancel`,
        {},
      );

      this.cache.delete(generateCacheKey("meeting-id", { id }));
      this.cache.delete(generateCacheKey("meetings", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete a meeting (sets status to "completed")
   */
  async complete(id: string): Promise<ApiResponse<MeetingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings/${id}/complete`,
        {},
      );

      this.cache.delete(generateCacheKey("meeting-id", { id }));
      this.cache.delete(generateCacheKey("meetings", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Copy meeting to a new date (preserves participants)
   */
  async copy(
    id: string,
    data: CopyMeetingRequest,
  ): Promise<ApiResponse<MeetingDetail>> {
    if (!id) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings/${id}/copy`,
        data,
      );

      this.cache.delete(generateCacheKey("meetings", {}));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // PDF
  // ============================================================

  /**
   * Generate agenda PDF
   */
  async generateAgendaPdf(
    id: string,
  ): Promise<ApiResponse<{ url: string }>> {
    if (!id) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings/${id}/agenda-pdf`,
        {},
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Participants
  // ============================================================

  /**
   * List participants for a meeting
   */
  async getParticipants(
    meetingId: string,
  ): Promise<ApiResponse<Participant[]>> {
    if (!meetingId) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    const cacheKey = generateCacheKey("meeting-participants", {
      id: meetingId,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<Participant[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/meetings/${meetingId}/participants`,
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
   * Add participant by person ID
   */
  async addParticipant(
    meetingId: string,
    data: AddParticipantRequest,
  ): Promise<ApiResponse<Participant>> {
    if (!meetingId) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings/${meetingId}/participants`,
        data,
      );

      this.cache.delete(generateCacheKey("meeting-id", { id: meetingId }));
      this.cache.delete(
        generateCacheKey("meeting-participants", { id: meetingId }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add participant by email (find-or-create)
   */
  async addParticipantByEmail(
    meetingId: string,
    data: AddParticipantByEmailRequest,
  ): Promise<ApiResponse<Participant>> {
    if (!meetingId) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings/${meetingId}/participants/by-email`,
        data,
      );

      this.cache.delete(generateCacheKey("meeting-id", { id: meetingId }));
      this.cache.delete(
        generateCacheKey("meeting-participants", { id: meetingId }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove participant
   */
  async removeParticipant(
    meetingId: string,
    personId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    if (!meetingId) {
      throw new AtlasValidationError("Meeting ID is required");
    }
    if (!personId) {
      throw new AtlasValidationError("Person ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/meetings/${meetingId}/participants/${personId}`,
      );

      this.cache.delete(generateCacheKey("meeting-id", { id: meetingId }));
      this.cache.delete(
        generateCacheKey("meeting-participants", { id: meetingId }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // Agenda Items
  // ============================================================

  /**
   * List agenda items for a meeting
   */
  async getAgendaItems(
    meetingId: string,
  ): Promise<ApiResponse<AgendaItem[]>> {
    if (!meetingId) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    const cacheKey = generateCacheKey("meeting-agenda-items", {
      id: meetingId,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<AgendaItem[]>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/meetings/${meetingId}/agenda-items`,
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
   * Update an agenda item
   */
  async updateAgendaItem(
    itemId: string,
    data: UpdateAgendaItemRequest,
  ): Promise<ApiResponse<AgendaItem>> {
    if (!itemId) {
      throw new AtlasValidationError("Agenda item ID is required");
    }

    try {
      const response = await this.http.patch(
        `${this.config.apiUrl}/meetings/agenda-items/${itemId}`,
        data,
      );

      this.cache.clear();

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Accept a proposed agenda item
   */
  async acceptAgendaItem(itemId: string): Promise<ApiResponse<AgendaItem>> {
    if (!itemId) {
      throw new AtlasValidationError("Agenda item ID is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/meetings/agenda-items/${itemId}/accept`,
        {},
      );

      this.cache.clear();

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove an agenda item
   */
  async removeAgendaItem(
    itemId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    if (!itemId) {
      throw new AtlasValidationError("Agenda item ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/meetings/agenda-items/${itemId}`,
      );

      this.cache.clear();

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reorder agenda items
   */
  async reorderAgendaItems(
    meetingId: string,
    data: ReorderAgendaItemsRequest,
  ): Promise<ApiResponse<AgendaItem[]>> {
    if (!meetingId) {
      throw new AtlasValidationError("Meeting ID is required");
    }

    try {
      const response = await this.http.put(
        `${this.config.apiUrl}/meetings/${meetingId}/agenda-items/reorder`,
        data,
      );

      this.cache.delete(generateCacheKey("meeting-id", { id: meetingId }));
      this.cache.delete(
        generateCacheKey("meeting-agenda-items", { id: meetingId }),
      );

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
