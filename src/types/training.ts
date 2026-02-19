// ============================================================
// Training Types
// ============================================================

export type SessionStatus = "planned" | "confirmed" | "completed" | "cancelled";

// --- Summary (list view) ---

export interface TrainingSummary {
  id: string;
  title: string;
  trainer_id: string;
  trainer_name: string;
  co_trainer_id: string | null;
  co_trainer_name: string | null;
  trainer_organisation: string | null;
  points: number | null;
  is_active: boolean;
  created_at: string;
}

// --- Detail (single view, includes sessions) ---

export interface TrainingDetail {
  id: string;
  title: string;
  description: string | null;
  trainer_id: string;
  trainer_name: string;
  co_trainer_id: string | null;
  co_trainer_name: string | null;
  trainer_organisation: string | null;
  points: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  sessions: TrainingSession[];
}

// --- Session ---

export interface TrainingSession {
  id: string;
  training_id: string;
  start_date: string;
  end_date: string;
  location: string | null;
  region: string | null;
  max_participants: number | null;
  is_fully_booked: boolean;
  communication_start_date: string | null;
  invitation_sent: boolean;
  reminder_sent: boolean;
  published: boolean;
  status: SessionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// --- Public DTOs (returned by /public/trainings) ---

export interface PublicTraining {
  title: string;
  description: string | null;
  trainer_name: string;
  co_trainer_name: string | null;
  trainer_organisation: string | null;
  points: number | null;
  sessions: PublicTrainingSession[];
}

export interface PublicTrainingSession {
  start_date: string;
  end_date: string;
  location: string | null;
  region: string | null;
  is_fully_booked: boolean;
  status: string;
}

// --- Request Types ---

export interface CreateTrainingRequest {
  title: string;
  description?: string;
  trainer_id?: string;
  trainer_email?: string;
  trainer_firstname?: string;
  trainer_lastname?: string;
  co_trainer_id?: string;
  co_trainer_email?: string;
  co_trainer_firstname?: string;
  co_trainer_lastname?: string;
  trainer_organisation?: string;
  points?: number;
}

export interface UpdateTrainingRequest {
  title?: string;
  description?: string;
  trainer_id?: string;
  co_trainer_id?: string | null;
  trainer_organisation?: string;
  points?: number | null;
  is_active?: boolean;
}

export interface CreateSessionRequest {
  start_date: string;
  end_date: string;
  location?: string;
  region?: string;
  max_participants?: number;
  communication_start_date?: string;
  notes?: string;
  status?: SessionStatus;
  published?: boolean;
}

export interface UpdateSessionRequest {
  start_date?: string;
  end_date?: string;
  location?: string;
  region?: string;
  max_participants?: number | null;
  is_fully_booked?: boolean;
  communication_start_date?: string | null;
  invitation_sent?: boolean;
  reminder_sent?: boolean;
  published?: boolean;
  status?: SessionStatus;
  notes?: string | null;
}

// --- Query Options ---

export interface TrainingQueryOptions {
  page?: number;
  limit?: number;
  name?: string;
  trainer_id?: string;
  is_active?: boolean;
}

export interface SessionQueryOptions {
  page?: number;
  limit?: number;
  status?: SessionStatus;
  published?: boolean;
  from_date?: string;
  to_date?: string;
}

// --- Public query options ---

export interface PublicTrainingQueryOptions {
  region?: string;
  name?: string;
  from?: string;
  to?: string;
}
