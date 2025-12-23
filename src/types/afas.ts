import { PaginationOptions } from "./content";

/**
 * AFAS Employee model
 */
export interface AFASEmployee {
  employee_id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  department?: string;
  job_title?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;

  // Sync tracking
  last_synced_at?: string;
  sync_status?: "pending" | "completed" | "failed";

  // Raw AFAS data
  afas_data?: Record<string, unknown>;

  // Metadata
  created_at?: string;
  updated_at?: string;
}

/**
 * AFAS Time Entry model
 */
export interface AFASTimeEntry {
  identity: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  hours: number;
  
  // Project information
  project_id?: string;
  project_name?: string;
  debtor_id?: string;
  debtor_name?: string;
  
  // Time entry details
  description?: string;
  billable?: boolean;
  approved?: boolean;

  // Sync tracking
  last_synced_at?: string;
  sync_status?: "pending" | "completed" | "failed";

  // Raw AFAS data
  afas_data?: Record<string, unknown>;

  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface AFASEmployeeQueryOptions extends PaginationOptions {
  is_active?: boolean;
  department?: string;
  search?: string;
}

export interface AFASTimeEntryQueryOptions extends PaginationOptions {
  employee_id?: string;
  project_id?: string;
  debtor_id?: string;
  date_from?: string;
  date_to?: string;
  billable?: boolean;
  approved?: boolean;
}

export interface AFASSyncStatistics {
  total_synced: number;
  last_sync_date?: string;
  failed_syncs: number;
  pending_syncs: number;
}

export interface AFASConnectionTest {
  connected: boolean;
  message: string;
  api_version?: string;
}

export interface AFASConfig {
  base_url?: string;
  token?: string;
  is_configured: boolean;
}

