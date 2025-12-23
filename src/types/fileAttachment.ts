/**
 * Valid entity types that can have file attachments
 */
export type EntityType =
  | "content"
  | "location"
  | "person"
  | "publication"
  | "website"
  | "time_entry";

/**
 * File categorization types
 */
export type FileCategory =
  | "image"
  | "document"
  | "logo"
  | "attachment"
  | "generated_pdf"
  | "spreadsheet"
  | "video"
  | "audio";

/**
 * File lifecycle status
 */
export type FileStatus = "uploading" | "active" | "archived" | "deleted";

/**
 * File attachment model
 */
export interface FileAttachment {
  id?: string;

  // File metadata
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_extension: string;

  // Storage information
  storage_bucket?: string;
  storage_path: string;
  storage_url?: string;

  // Polymorphic relationship
  entity_type: EntityType;
  entity_id: string;

  // File categorization
  file_category?: FileCategory;
  file_purpose?: string;
  display_order?: number;

  // File properties (for images)
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;

  // Status and metadata
  status?: FileStatus;
  is_public?: boolean;
  metadata?: Record<string, unknown>;

  // Audit trail
  created_at?: Date | string;
  updated_at?: Date | string;
  created_by?: string;
  uploaded_by?: string;
  api_key_id?: string;
  created_via?: "user" | "api_key";
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File | Buffer;
  entity_type: EntityType;
  entity_id: string;
  filename?: string;
  file_category?: FileCategory;
  file_purpose?: string;
  is_public?: boolean;
  alt_text?: string;
  caption?: string;
  metadata?: Record<string, unknown>;
}

/**
 * File metadata update
 */
export interface UpdateFileMetadata {
  alt_text?: string;
  caption?: string;
  file_category?: FileCategory;
  file_purpose?: string;
  display_order?: number;
  is_public?: boolean;
  metadata?: Record<string, unknown>;
  status?: FileStatus;
}

/**
 * File query options
 */
export interface FileQueryOptions {
  entity_type?: EntityType;
  entity_id?: string;
  file_category?: FileCategory;
  is_public?: boolean;
  status?: FileStatus;
}

