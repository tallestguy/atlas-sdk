import { PaginationOptions } from "./content";

/**
 * Sync job types
 */
export type SyncType = "locations" | "publications" | "people" | "full";

export type SyncStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Sync job model
 */
export interface SyncJob {
  id?: string;
  sync_type: SyncType;
  status: SyncStatus;

  // Job details
  started_at?: Date | string;
  completed_at?: Date | string;
  triggered_by?: string;

  // Results
  total_processed?: number;
  successful?: number;
  failed?: number;
  skipped?: number;

  // Dry run mode
  is_dry_run?: boolean;

  // Error tracking
  errors?: string[];
  error_details?: Record<string, any>[];

  // Metadata
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface SyncTriggerOptions {
  force?: boolean;
  dry_run?: boolean;
  filters?: Record<string, any>;
}

export interface SyncJobDetails extends SyncJob {
  detailed_results?: Array<{
    entity_id: string;
    entity_type: string;
    status: "success" | "failed" | "skipped";
    message?: string;
    error?: string;
  }>;
}

export interface SyncStatistics {
  total_sync_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  average_duration?: number;
  last_sync_date?: string;
  sync_frequency?: Record<string, number>;
}

export interface SyncQueryOptions extends PaginationOptions {
  sync_type?: SyncType;
  status?: SyncStatus;
  is_dry_run?: boolean;
  started_after?: string;
  started_before?: string;
}

