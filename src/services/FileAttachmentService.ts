// src/services/FileAttachmentService.ts
import {
  FileAttachment,
  FileUploadRequest,
  UpdateFileMetadata,
  FileQueryOptions,
  ApiResponse,
  AtlasClientConfig,
} from "../types";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import { buildQueryParams, generateCacheKey } from "../utils/query";
import { AtlasError, AtlasValidationError } from "../errors";

export class FileAttachmentService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Upload a file
   */
  async upload(request: FileUploadRequest): Promise<ApiResponse<FileAttachment>> {
    if (!request.file) {
      throw new AtlasValidationError("File is required");
    }

    if (!request.entity_type) {
      throw new AtlasValidationError("Entity type is required");
    }

    if (!request.entity_id) {
      throw new AtlasValidationError("Entity ID is required");
    }

    try {
      const formData = new FormData();
      formData.append("file", request.file);
      formData.append("entity_type", request.entity_type);
      formData.append("entity_id", request.entity_id);

      if (request.filename) {
        formData.append("filename", request.filename);
      }

      if (request.file_category) {
        formData.append("file_category", request.file_category);
      }

      if (request.file_purpose) {
        formData.append("file_purpose", request.file_purpose);
      }

      if (request.is_public !== undefined) {
        formData.append("is_public", String(request.is_public));
      }

      if (request.alt_text) {
        formData.append("alt_text", request.alt_text);
      }

      if (request.caption) {
        formData.append("caption", request.caption);
      }

      if (request.metadata) {
        formData.append("metadata", JSON.stringify(request.metadata));
      }

      const response = await this.http.postFormData(
        `${this.config.apiUrl}/file-attachments/upload`,
        formData,
      );

      // Invalidate entity files cache
      this.cache.delete(
        generateCacheKey("files-by-entity", {
          entityType: request.entity_type,
          entityId: request.entity_id,
        }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload raw file data
   * For direct binary uploads (useful in Node.js environments)
   */
  async uploadRaw(
    fileBuffer: Buffer,
    metadata: Omit<FileUploadRequest, "file">,
  ): Promise<ApiResponse<FileAttachment>> {
    if (!fileBuffer) {
      throw new AtlasValidationError("File buffer is required");
    }

    if (!metadata.entity_type) {
      throw new AtlasValidationError("Entity type is required");
    }

    if (!metadata.entity_id) {
      throw new AtlasValidationError("Entity ID is required");
    }

    try {
      // Set headers for raw upload
      const headers: Record<string, string> = {
        "Content-Type": "application/octet-stream",
        "X-Entity-Type": metadata.entity_type,
        "X-Entity-Id": metadata.entity_id,
      };

      if (metadata.filename) {
        headers["X-Filename"] = metadata.filename;
      }

      if (metadata.file_category) {
        headers["X-File-Category"] = metadata.file_category;
      }

      if (metadata.file_purpose) {
        headers["X-File-Purpose"] = metadata.file_purpose;
      }

      if (metadata.is_public !== undefined) {
        headers["X-Is-Public"] = String(metadata.is_public);
      }

      const response = await this.http.post(
        `${this.config.apiUrl}/file-attachments/upload/raw`,
        fileBuffer,
        headers,
      );

      // Invalidate entity files cache
      this.cache.delete(
        generateCacheKey("files-by-entity", {
          entityType: metadata.entity_type,
          entityId: metadata.entity_id,
        }),
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a file by ID
   */
  async getById(id: string): Promise<ApiResponse<FileAttachment>> {
    if (!id) {
      throw new AtlasValidationError("File ID is required");
    }

    const cacheKey = generateCacheKey("file-attachment-id", { id });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<FileAttachment>>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/file-attachments/${id}`,
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
   * Get files by entity
   */
  async getByEntity(
    entityType: string,
    entityId: string,
    options: FileQueryOptions = {},
  ): Promise<ApiResponse<FileAttachment[]>> {
    if (!entityType) {
      throw new AtlasValidationError("Entity type is required");
    }

    if (!entityId) {
      throw new AtlasValidationError("Entity ID is required");
    }

    const cacheKey = generateCacheKey("files-by-entity", {
      entityType,
      entityId,
      ...options,
    });

    if (this.config.cache) {
      const cached = this.cache.get<ApiResponse<FileAttachment[]>>(cacheKey);
      if (cached) return cached;
    }

    const queryParams = buildQueryParams(options);

    try {
      const response = await this.http.get(
        `${this.config.apiUrl}/file-attachments/entity/${entityType}/${entityId}?${queryParams}`,
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
   * Update file metadata
   */
  async updateMetadata(
    id: string,
    data: UpdateFileMetadata,
  ): Promise<ApiResponse<FileAttachment>> {
    if (!id) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.patch(
        `${this.config.apiUrl}/file-attachments/${id}`,
        data,
      );

      this.cache.delete(generateCacheKey("file-attachment-id", { id }));

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a file
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!id) {
      throw new AtlasValidationError("File ID is required");
    }

    try {
      const response = await this.http.delete(
        `${this.config.apiUrl}/file-attachments/${id}`,
      );

      this.cache.delete(generateCacheKey("file-attachment-id", { id }));
      // Clear all entity files cache as we don't know which entity this file belongs to
      this.cache.clear();

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

