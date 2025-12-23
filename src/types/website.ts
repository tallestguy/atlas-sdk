import { PaginationOptions } from "./content";
import { FileCategory } from "./fileAttachment";

/**
 * Website model
 */
export interface Website {
  id?: string;
  name: string;
  url: string;
  description?: string;
  primary_language: string;
  secondary_languages?: string[];

  // Audience fields
  audience_primary_demographic?: string;
  audience_interests?: string[];
  audience_industry?: string;
  audience_region?: string;
  audience_tone_preference?:
    | "formal"
    | "casual"
    | "technical"
    | "friendly"
    | "authoritative";

  // Branding fields
  branding_voice?: string;
  branding_key_messages?: string[];
  branding_taboo_topics?: string[];
  branding_values?: string[];

  // Deployment fields
  deployment_provider?: "vercel" | "netlify" | "github" | "aws" | "custom";
  deployment_project_id?: string;
  deployment_team_id?: string;
  deployment_build_hook_url?: string;

  // Metadata
  created_at?: Date | string;
  updated_at?: Date | string;
  created_by: string;
  status?: "active" | "development" | "archived";
}

export interface WebsiteQueryOptions extends PaginationOptions {
  status?: "active" | "development" | "archived";
  created_by?: string;
  search?: string;
}

export interface WebsiteFileUploadOptions {
  file: File | Buffer;
  filename: string;
  mimeType: string;
  isPublic?: boolean;
  fileCategory?: FileCategory;
}

export interface WebsiteFile {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_url: string;
  is_public: boolean;
  file_category?: FileCategory;
  created_at: string;
  updated_at: string;
}

