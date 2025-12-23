import { PaginationOptions } from "./content";

/**
 * Deployment model
 */
export interface Deployment {
  id?: string;
  website_id: string;

  // Deployment details
  deployment_type: "content_update" | "site_update" | "full_rebuild";
  status: "pending" | "in_progress" | "completed" | "failed";

  // Provider details
  provider_name: "vercel" | "netlify" | "github" | "aws" | "custom";
  provider_deployment_id?: string;
  provider_build_id?: string;
  provider_logs_url?: string;
  provider_preview_url?: string;

  // Content being deployed
  related_content_ids?: string[];

  // Timing information
  triggered_at?: Date | string;
  started_at?: Date | string;
  completed_at?: Date | string;

  // Audit
  triggered_by: string;
  deployment_message?: string;
  errors?: string[];
}

export interface CreateDeploymentRequest {
  website_id: string;
  deployment_type: Deployment["deployment_type"];
  related_content_ids?: string[];
  deployment_message?: string;
}

export interface ScheduleDeploymentRequest extends CreateDeploymentRequest {
  scheduled_for: Date | string;
}

export interface DeploymentQueryOptions extends PaginationOptions {
  website_id?: string;
  status?: Deployment["status"];
  deployment_type?: Deployment["deployment_type"];
  provider_name?: Deployment["provider_name"];
  triggered_by?: string;
}

export interface DeploymentStats {
  total_deployments: number;
  pending_deployments: number;
  in_progress_deployments: number;
  completed_deployments: number;
  failed_deployments: number;
  average_deployment_time?: number;
  deployments_by_website: Record<string, number>;
  deployments_by_provider: Record<string, number>;
}

export interface DeploymentValidation {
  is_valid: boolean;
  missing_fields: string[];
  warnings: string[];
}

