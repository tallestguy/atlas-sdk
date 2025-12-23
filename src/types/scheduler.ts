/**
 * Scheduler types for job management
 */

export interface ScheduledJob {
  name: string;
  schedule: string; // Cron expression
  next_run?: string;
  last_run?: string;
  is_enabled: boolean;
  description?: string;
}

export interface SchedulerStatus {
  is_running: boolean;
  uptime?: number;
  jobs: ScheduledJob[];
  total_jobs: number;
  active_jobs: number;
}

export interface SchedulerHealth {
  status: "healthy" | "degraded" | "unhealthy";
  checks: Array<{
    name: string;
    status: "pass" | "fail";
    message?: string;
  }>;
  last_check: string;
}

export interface JobTriggerResult {
  success: boolean;
  job_name: string;
  triggered_at: string;
  message?: string;
  error?: string;
}

