// ============================================================
// Meeting Types
// ============================================================

export type MeetingStatus = "draft" | "scheduled" | "in_progress" | "completed" | "cancelled";
export type ParticipantRole = "organizer" | "required" | "optional";
export type GoalType = "decision" | "opinion" | "informative";
export type AgendaItemStatus = "proposed" | "accepted" | "discussed";

// --- Summary (list view) ---

export interface MeetingSummary {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  status: MeetingStatus;
  participant_count: number;
  agenda_item_count: number;
  created_at: string;
  agenda_distributed_at: string | null;
}

// --- Detail (single view) ---

export interface MeetingDetail {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  reminder_schedule: number[];
  agenda_deadline_hours_before: number;
  status: MeetingStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  agenda_distributed_at: string | null;
  participants: Participant[];
  agenda_items: AgendaItem[];
}

// --- Participant ---

export interface Participant {
  id: string;
  person_id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  submission_token: string;
  token_expires_at: string | null;
}

// --- Agenda Item ---

export interface AgendaItem {
  id: string;
  topic: string;
  rationale: string | null;
  approach: string | null;
  goal_type: GoalType;
  estimated_minutes: number | null;
  position: number | null;
  status: AgendaItemStatus;
  submitted_by: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// --- Submission Context (public, token-based) ---

export interface SubmissionContext {
  meeting: {
    id: string;
    title: string;
    scheduled_at: string;
    location: string | null;
    deadline: string | null;
    is_accepting: boolean;
  };
  participant: {
    name: string;
    role: ParticipantRole;
  };
  existing_items: Array<{
    topic: string;
    goal_type: GoalType;
    submitted_by: string;
  }>;
}

// --- Request Types ---

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  reminder_schedule?: number[];
  agenda_deadline_hours_before?: number;
  status?: MeetingStatus;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  location?: string;
  reminder_schedule?: number[];
  agenda_deadline_hours_before?: number;
  status?: MeetingStatus;
}

export interface CopyMeetingRequest {
  scheduled_at: string;
  title?: string;
  location?: string;
  duration_minutes?: number;
  reminder_schedule?: number[];
  agenda_deadline_hours_before?: number;
}

export interface AddParticipantRequest {
  person_id: string;
  role?: ParticipantRole;
}

export interface AddParticipantByEmailRequest {
  email: string;
  firstname: string;
  lastname: string;
  role?: ParticipantRole;
}

export interface UpdateAgendaItemRequest {
  topic?: string;
  rationale?: string;
  approach?: string;
  goal_type?: GoalType;
  estimated_minutes?: number;
  status?: AgendaItemStatus;
  position?: number;
}

export interface SubmitAgendaItemRequest {
  topic: string;
  rationale?: string;
  approach?: string;
  goal_type: GoalType;
  estimated_minutes?: number;
}

export interface ReorderAgendaItemsRequest {
  item_ids: string[];
}

// --- Query Options ---

export interface MeetingQueryOptions {
  page?: number;
  limit?: number;
  status?: MeetingStatus;
  from_date?: string;
  to_date?: string;
}
