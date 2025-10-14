import { PaginationOptions } from "./content";

// Publication type - based on your database schema
export interface Publication {
  id: string;
  carerix_id: string;
  content_intro?: string;
  content_company?: string;
  content_vacancy?: string;
  content_requirements?: string;
  content_offer?: string;
  agency_name: string;
  agency_id?: string;
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  title?: string;
  company_id?: string;
  company_name?: string;
  company_city?: string;
  parent_id?: string;
  parent_name?: string;
  label?: string;
  start_date?: string;
  end_date?: string;
  modified_date?: string;
  hours_per_week?: number;
  salary_min?: number;
  salary_max?: number;
  salary_min_formatted?: string;
  salary_max_formatted?: string;
  last_synced_at?: string;
  sync_job_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublicationQueryOptions extends PaginationOptions {
  agency_name?: string;
  owner_id?: string;
  company_id?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  salary_min?: number;
  salary_max?: number;
  hours_per_week_min?: number;
  hours_per_week_max?: number;
  sync_job_id?: string;
  search_term?: string;
  carerix_location_id?: string;
}

export interface PublicationStatistics {
  total_publications: number;
  active_publications: number;
  expired_publications: number;
  stale_publications: number;
  publications_by_agency: Record<string, number>;
  average_salary_min?: number;
  average_salary_max?: number;
  average_hours_per_week?: number;
}
