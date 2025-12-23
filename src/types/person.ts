import { PaginationOptions } from "./content";

/**
 * Person model
 */
export interface Person {
  id?: string;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  place?: string;
  profession_study?: string;
  has_required_education?: boolean;
  notes?: string;

  // Lifecycle
  person_status?:
    | "prospect"
    | "applicant"
    | "candidate"
    | "employee"
    | "contractor"
    | "member"
    | "alumni"
    | "inactive";
  is_team_member?: boolean;
  status_changed_at?: Date | string;

  // External systems
  carerix_candidate_id?: string;
  afas_employee_id?: string;
  afas_employee_end_date?: Date | string;

  // Sync status
  carerix_sync_status?: "pending" | "completed" | "failed";
  afas_sync_status?: "not_applicable" | "pending" | "completed" | "failed";
  carerix_synced_at?: Date | string;
  afas_synced_at?: Date | string;

  // Communication
  email_marketing_consent?: boolean;
  network_updates_consent?: boolean;

  // Analytics
  person_score?: number;

  // Metadata
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface PersonWebsiteRelationship {
  id?: string;
  person_id: string;
  website_id: string;
  relationship_type:
    | "applicant"
    | "team_member"
    | "content_contributor"
    | "featured_member";
  is_featured?: boolean;
  bio?: string;
  role_title?: string;
  profile_picture_url?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface PersonApplication {
  id?: string;
  person_id: string;
  website_id: string;
  publication_id?: string;
  publication_carerix_id?: string;
  message?: string;
  application_status?: "pending" | "synced" | "failed";
  carerix_match_id?: string;

  // Analytics
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;

  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface PersonQueryOptions extends PaginationOptions {
  person_status?: Person["person_status"];
  is_team_member?: boolean;
  email?: string;
  search?: string;
  orderBy?: "created_at" | "updated_at" | "firstname" | "lastname" | "email";
  orderDirection?: "asc" | "desc";
}

export interface CreatePersonRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  place?: string;
  profession_study?: string;
  person_status?: Person["person_status"];
  email_marketing_consent?: boolean;
  network_updates_consent?: boolean;
}

export interface ApplicationSubmissionRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  place?: string;
  profession_study?: string;
  message?: string;
  website_id: string;
  publication_id?: string;
  publication_carerix_id?: string;
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  email_marketing_consent?: boolean;
}

export interface EmailMarketingContact {
  email: string;
  firstname: string;
  lastname: string;
  person_status: string;
}

export interface TeamMemberProfile {
  person: Person;
  relationship: PersonWebsiteRelationship;
}

