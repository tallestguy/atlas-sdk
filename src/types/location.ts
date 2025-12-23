import { PaginationOptions } from "./content";

/**
 * Location model
 */
export interface Location {
  id?: string;
  carerix_id: string;
  carerix_data?: Record<string, unknown>;

  // Basic information
  name: string;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;

  // Geographic coordinates
  latitude?: number;
  longitude?: number;
  coordinates_source?: "manual" | "google_maps" | "carerix";

  // Organization hierarchy
  parent_location_id?: string;
  parent_location_name?: string;
  is_debtor?: boolean;

  // Agency information
  agency_id?: string;
  agency_name?: string;

  // Contact information
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;

  // Status tracking
  is_active?: boolean;
  last_activity_date?: string;
  is_stale?: boolean;

  // Sync information
  last_synced_at?: string;
  sync_job_id?: string;
  sync_status?: "pending" | "completed" | "failed";

  // Enrichment tracking
  enrichment_status?: "pending" | "completed" | "failed" | "not_needed";
  last_enriched_at?: string;

  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface LocationQueryOptions extends PaginationOptions {
  agency_name?: string;
  is_active?: boolean;
  is_debtor?: boolean;
  city?: string;
  country?: string;
  sync_job_id?: string;
  missing_coordinates?: boolean;
  is_stale?: boolean;
  search?: string;
}

export interface LocationStatistics {
  total_locations: number;
  active_locations: number;
  locations_with_coordinates: number;
  locations_missing_coordinates: number;
  stale_locations: number;
  locations_by_agency: Record<string, number>;
  locations_by_country: Record<string, number>;
}

export interface LocationEnrichmentRequest {
  force?: boolean;
}

export interface LocationEnrichmentResult {
  success: boolean;
  location_id: string;
  enriched_fields: string[];
  errors?: string[];
}

export interface BulkEnrichmentResult {
  total_processed: number;
  successful: number;
  failed: number;
  results: LocationEnrichmentResult[];
}
