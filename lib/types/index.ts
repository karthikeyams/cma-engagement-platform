// ============================================================
// CMA Member Engagement Platform — Shared TypeScript Interfaces
// ============================================================

// ─── ENUM-LIKE UNION TYPES ───────────────────────────────────

export type MemberTier = "active" | "passive" | "at_risk" | "lapsed";

export type PreferredChannel = "email" | "whatsapp" | "sms";

export type InterestTag =
  | "gita_study"
  | "satsang"
  | "youth_programs"
  | "cultural_events"
  | "seva"
  | "vedanta_class"
  | "devi_bhava"
  | "bhajan";

export type EventType =
  | "satsang"
  | "youth"
  | "cultural"
  | "study_group"
  | "seva"
  | "retreat"
  | "other";

export type EventStatus = "upcoming" | "active" | "completed" | "cancelled";

export type RSVPStatus = "registered" | "confirmed" | "waitlisted" | "cancelled";

export type AgentType =
  | "event_reminder"
  | "feedback_collection"
  | "announcement"
  | "volunteer_coordination"
  | "engagement_insight"
  | "onboarding";

export type MessageDirection = "outbound" | "inbound";

export type MessageStatus = "pending" | "sent" | "delivered" | "received" | "failed";

export type MessageChannel = "email" | "whatsapp" | "sms";

export type SevaOpportunityStatus = "open" | "filled" | "cancelled";

export type SevaCommitmentStatus =
  | "invited"
  | "confirmed"
  | "declined"
  | "completed"
  | "no_show";

// ─── TABLE INTERFACES ────────────────────────────────────────

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interests: InterestTag[] | null;
  preferred_channel: PreferredChannel;
  engagement_score: number;
  tier: MemberTier;
  joined_at: string;
  last_active_at: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  type: EventType | null;
  capacity: number | null;
  status: EventStatus;
  created_at: string;
}

export interface RSVP {
  id: string;
  member_id: string;
  event_id: string;
  status: RSVPStatus;
  registered_at: string;
  confirmed_at: string | null;
  updated_at: string;
}

export interface Feedback {
  id: string;
  member_id: string;
  event_id: string;
  rating: number | null;
  highlights: string | null;
  suggestions: string | null;
  would_recommend: boolean | null;
  submitted_at: string;
}

export interface AgentMessage {
  id: string;
  agent_type: AgentType;
  member_id: string | null;
  event_id: string | null;
  channel: MessageChannel;
  direction: MessageDirection;
  subject: string | null;
  content: string;
  status: MessageStatus;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface SevaOpportunity {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  skills_needed: string[] | null;
  slots: number;
  filled_slots: number;
  status: SevaOpportunityStatus;
  created_at: string;
}

export interface SevaCommitment {
  id: string;
  member_id: string;
  opportunity_id: string;
  status: SevaCommitmentStatus;
  confirmed_at: string | null;
  created_at: string;
}

// ─── DATABASE TYPE MAP (for Supabase client typing) ──────────

export interface Database {
  public: {
    Tables: {
      members: {
        Row: Member;
        Insert: Omit<Member, "id" | "created_at" | "joined_at" | "last_active_at"> & {
          id?: string;
          joined_at?: string;
          last_active_at?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Member, "id">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Event, "id">>;
      };
      rsvps: {
        Row: RSVP;
        Insert: Omit<RSVP, "id" | "registered_at" | "updated_at"> & {
          id?: string;
          registered_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<RSVP, "id">>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, "id" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Omit<Feedback, "id">>;
      };
      agent_messages: {
        Row: AgentMessage;
        Insert: Omit<AgentMessage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AgentMessage, "id">>;
      };
      seva_opportunities: {
        Row: SevaOpportunity;
        Insert: Omit<SevaOpportunity, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SevaOpportunity, "id">>;
      };
      seva_commitments: {
        Row: SevaCommitment;
        Insert: Omit<SevaCommitment, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SevaCommitment, "id">>;
      };
    };
  };
}

// ─── AGENT PAYLOAD TYPES ─────────────────────────────────────

export interface AgentRunResult {
  success: boolean;
  agentType: AgentType;
  messagesQueued: number;
  errors: string[];
}

export interface MemberWithRSVPs extends Member {
  rsvps: RSVP[];
}

export interface EventWithRSVPCount extends Event {
  rsvp_count: number;
  confirmed_count: number;
}
