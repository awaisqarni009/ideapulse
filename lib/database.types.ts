export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'user' | 'moderator' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type CycleStatus = 'upcoming' | 'active' | 'evaluating' | 'completed';
export type IdeaCategory =
  'artificial_intelligence' | 'developer_tools' | 'sustainability' | 'health_wellness' | 'fintech';
export type IdeaStatus = 'draft' | 'published' | 'withdrawn' | 'archived';
export type VoteStatus = 'active' | 'retracted' | 'voided';
export type AbuseKind =
  | 'self_vote_attempt'
  | 'duplicate_vote_attempt'
  | 'vote_quota_exceeded'
  | 'closed_idea_vote_attempt'
  | 'rate_limit_submission'
  | 'unconfirmed_write_attempt';
export type ReportReason =
  'spam' | 'harassment' | 'hate_speech' | 'plagiarism' | 'impersonation' | 'off_topic' | 'other';
export type AdminActionType =
  | 'suspend_user'
  | 'ban_user'
  | 'reinstate_user'
  | 'remove_idea'
  | 'restore_idea'
  | 'void_vote'
  | 'adjust_cycle'
  | 'manual_reward';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          status: AccountStatus;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          ideas_count: number;
          votes_cast_count: number;
          votes_received_count: number;
          rewards_won_count: number;
          suspended_until: string | null;
          suspension_reason: string | null;
          last_idea_at: string | null;
          last_vote_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          status?: AccountStatus;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          ideas_count?: number;
          votes_cast_count?: number;
          votes_received_count?: number;
          rewards_won_count?: number;
          suspended_until?: string | null;
          suspension_reason?: string | null;
          last_idea_at?: string | null;
          last_vote_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          status?: AccountStatus;
          username?: string;
          display_name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          ideas_count?: number;
          votes_cast_count?: number;
          votes_received_count?: number;
          rewards_won_count?: number;
          suspended_until?: string | null;
          suspension_reason?: string | null;
          last_idea_at?: string | null;
          last_vote_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cycles: {
        Row: {
          id: string;
          sequence_number: number;
          status: CycleStatus;
          starts_at: string;
          ends_at: string;
          vote_threshold: number;
          daily_vote_limit: number;
          reward_slots: number;
          reward_pool_cents: number;
          finalized_at: string | null;
          total_ideas: number;
          qualifying_ideas: number;
          total_votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sequence_number: number;
          status?: CycleStatus;
          starts_at: string;
          ends_at: string;
          vote_threshold?: number;
          daily_vote_limit?: number;
          reward_slots?: number;
          reward_pool_cents?: number;
          finalized_at?: string | null;
          total_ideas?: number;
          qualifying_ideas?: number;
          total_votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sequence_number?: number;
          status?: CycleStatus;
          starts_at?: string;
          ends_at?: string;
          vote_threshold?: number;
          daily_vote_limit?: number;
          reward_slots?: number;
          reward_pool_cents?: number;
          finalized_at?: string | null;
          total_ideas?: number;
          qualifying_ideas?: number;
          total_votes?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      ideas: {
        Row: {
          id: string;
          author_id: string;
          cycle_id: string;
          slug: string;
          title: string;
          summary: string;
          body: string;
          category: IdeaCategory;
          status: IdeaStatus;
          vote_count: number;
          verified_vote_count: number;
          qualified_at: string | null;
          locked_at: string | null;
          withdrawn_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          cycle_id: string;
          slug?: string;
          title: string;
          summary: string;
          body: string;
          category: IdeaCategory;
          status?: IdeaStatus;
          vote_count?: number;
          verified_vote_count?: number;
          qualified_at?: string | null;
          locked_at?: string | null;
          withdrawn_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          cycle_id?: string;
          slug?: string;
          title?: string;
          summary?: string;
          body?: string;
          category?: IdeaCategory;
          status?: IdeaStatus;
          vote_count?: number;
          verified_vote_count?: number;
          qualified_at?: string | null;
          locked_at?: string | null;
          withdrawn_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ideas_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ideas_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'cycles';
            referencedColumns: ['id'];
          },
        ];
      };
      votes: {
        Row: {
          id: string;
          idea_id: string;
          idea_author_id: string;
          voter_id: string;
          cycle_id: string;
          status: VoteStatus;
          is_verified: boolean;
          retracted_at: string | null;
          voided_at: string | null;
          void_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          idea_author_id: string;
          voter_id: string;
          cycle_id: string;
          status?: VoteStatus;
          is_verified?: boolean;
          retracted_at?: string | null;
          voided_at?: string | null;
          void_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          idea_author_id?: string;
          voter_id?: string;
          cycle_id?: string;
          status?: VoteStatus;
          is_verified?: boolean;
          retracted_at?: string | null;
          voided_at?: string | null;
          void_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'cycles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_idea_author_fk';
            columns: ['idea_id', 'idea_author_id'];
            isOneToOne: false;
            referencedRelation: 'ideas';
            referencedColumns: ['id', 'author_id'];
          },
          {
            foreignKeyName: 'votes_voter_id_fkey';
            columns: ['voter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rewards: {
        Row: {
          id: string;
          cycle_id: string;
          idea_id: string;
          recipient_id: string;
          rank: number;
          amount_cents: number;
          status: 'announced' | 'claimed' | 'fulfilled';
          claimed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          idea_id: string;
          recipient_id: string;
          rank: number;
          amount_cents: number;
          status?: 'announced' | 'claimed' | 'fulfilled';
          claimed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cycle_id?: string;
          idea_id?: string;
          recipient_id?: string;
          rank?: number;
          amount_cents?: number;
          status?: 'announced' | 'claimed' | 'fulfilled';
          claimed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rewards_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'cycles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rewards_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'ideas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rewards_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      abuse_events: {
        Row: {
          id: string;
          actor_id: string | null;
          kind: AbuseKind;
          error_code: string;
          target_table: string | null;
          target_id: string | null;
          detail: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          kind: AbuseKind;
          error_code: string;
          target_table?: string | null;
          target_id?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          kind?: AbuseKind;
          error_code?: string;
          target_table?: string | null;
          target_id?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'abuse_events_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_table: string;
          target_id: string;
          reason: ReportReason;
          detail: string | null;
          resolved_at: string | null;
          resolver_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_table: string;
          target_id: string;
          reason: ReportReason;
          detail?: string | null;
          resolved_at?: string | null;
          resolver_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_table?: string;
          target_id?: string;
          reason?: ReportReason;
          detail?: string | null;
          resolved_at?: string | null;
          resolver_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_resolver_id_fkey';
            columns: ['resolver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          action: AdminActionType;
          target_table: string;
          target_id: string;
          reason: string | null;
          detail: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: AdminActionType;
          target_table: string;
          target_id: string;
          reason?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: AdminActionType;
          target_table?: string;
          target_id?: string;
          reason?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_actions_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      idea_public_stats: {
        Row: {
          id: string;
          author_id: string;
          cycle_id: string;
          slug: string;
          title: string;
          summary: string;
          body: string;
          category: IdeaCategory;
          status: IdeaStatus;
          vote_count: number;
          verified_vote_count: number;
          is_qualified: boolean;
          votes_to_qualify: number;
          qualified_at: string | null;
          locked_at: string | null;
          created_at: string;
          author_username: string;
          author_display_name: string;
          author_avatar_url: string | null;
          cycle_rank: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      active_cycle_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_admin: {
        Args: {
          uid?: string;
        };
        Returns: boolean;
      };
      account_is_writable: {
        Args: {
          uid?: string;
        };
        Returns: boolean;
      };
      voter_is_verified: {
        Args: {
          uid: string;
        };
        Returns: boolean;
      };
      log_abuse: {
        Args: {
          p_actor: string;
          p_kind: AbuseKind;
          p_code: string;
          p_table?: string;
          p_target?: string;
          p_detail?: Json;
        };
        Returns: void;
      };
      cast_vote: {
        Args: {
          p_idea_id: string;
        };
        Returns: Json;
      };
      retract_vote: {
        Args: {
          p_vote_id: string;
        };
        Returns: Json;
      };
      open_next_cycle: {
        Args: {
          p_duration_days?: number;
        };
        Returns: string;
      };
      finalize_cycle: {
        Args: {
          p_cycle_id: string;
        };
        Returns: Json;
      };
      rotate_cycle: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
    Enums: {
      account_status: AccountStatus;
      user_role: UserRole;
      cycle_status: CycleStatus;
      idea_category: IdeaCategory;
      idea_status: IdeaStatus;
      vote_status: VoteStatus;
      abuse_kind: AbuseKind;
      report_reason: ReportReason;
      admin_action_type: AdminActionType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
