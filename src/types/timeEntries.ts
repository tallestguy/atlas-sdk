/**
 * Time entry statistics and analytics
 */

export interface HoursByPeriod {
  period: string; // Date string (YYYY-MM-DD or YYYY-MM)
  hours: number;
  entries_count?: number;
}

export interface EmployeeHoursStatistics {
  employee_id: string;
  employee_name: string;
  total_hours: number;
  periods: HoursByPeriod[];
}

export interface ProjectHoursStatistics {
  project_id: string;
  project_name: string;
  total_hours: number;
  periods: HoursByPeriod[];
}

export interface DebtorHoursStatistics {
  debtor_id: string;
  debtor_name: string;
  total_hours: number;
  periods: HoursByPeriod[];
}

export interface AverageHoursStatistics {
  period: "week" | "month" | "quarter" | "year";
  average_hours: number;
  total_employees: number;
  total_hours: number;
}

export interface UniqueEmployeesStatistics {
  period_start: string;
  period_end: string;
  unique_employees: number;
  employee_ids: string[];
}

export interface EmployeeWithMissingHours {
  employee_id: string;
  employee_name: string;
  expected_hours: number;
  actual_hours: number;
  missing_hours: number;
  last_entry_date?: string;
}

export interface TimeEntrySummary {
  total_hours: number;
  total_entries: number;
  unique_employees: number;
  unique_projects: number;
  unique_debtors: number;
  period_start: string;
  period_end: string;
  billable_hours?: number;
  non_billable_hours?: number;
}

export interface TimeEntryQueryOptions {
  // Period filters
  start_date?: string;
  end_date?: string;
  period?: "week" | "month" | "quarter" | "year";

  // Entity filters
  employee_id?: string;
  project_id?: string;
  debtor_id?: string;

  // Grouping options
  group_by?: "day" | "week" | "month" | "quarter" | "year";

  // Other filters
  billable?: boolean;
  approved?: boolean;
}

