export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      abuse_events: {
        Row: {
          actor_id: string | null;
          created_at: string;
          detail: Json;
          error_code: string;
          id: number;
          ip_hash: string | null;
          kind: Database['public']['Enums']['abuse_kind'];
          target_id: string | null;
          target_table: string | null;
          user_agent: string | null;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          detail?: Json;
          error_code: string;
          id?: number;
          ip_hash?: string | null;
          kind: Database['public']['Enums']['abuse_kind'];
          target_id?: string | null;
          target_table?: string | null;
          user_agent?: string | null;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          detail?: Json;
          error_code?: string;
          id?: number;
          ip_hash?: string | null;
          kind?: Database['public']['Enums']['abuse_kind'];
          target_id?: string | null;
          target_table?: string | null;
          user_agent?: string | null;
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
      admin_actions: {
        Row: {
          action: string;
          admin_id: string;
          after_state: Json | null;
          before_state: Json | null;
          created_at: string;
          id: number;
          reason: string;
          target_id: string;
          target_table: string;
        };
        Insert: {
          action: string;
          admin_id: string;
          after_state?: Json | null;
          before_state?: Json | null;
          created_at?: string;
          id?: number;
          reason: string;
          target_id: string;
          target_table: string;
        };
        Update: {
          action?: string;
          admin_id?: string;
          after_state?: Json | null;
          before_state?: Json | null;
          created_at?: string;
          id?: number;
          reason?: string;
          target_id?: string;
          target_table?: string;
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
      cycle_heartbeats: {
        Row: {
          action: string;
          created_at: string;
          cycle_id: string | null;
          details: Json | null;
          id: string;
          status: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          cycle_id?: string | null;
          details?: Json | null;
          id?: string;
          status: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          cycle_id?: string | null;
          details?: Json | null;
          id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cycle_heartbeats_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'cycles';
            referencedColumns: ['id'];
          },
        ];
      };
      cycles: {
        Row: {
          created_at: string;
          cycle_number: number;
          daily_vote_limit: number;
          ends_at: string;
          finalization_note: string | null;
          finalized_at: string | null;
          id: string;
          qualified_count: number | null;
          reward_slots: number;
          starts_at: string;
          status: Database['public']['Enums']['cycle_status'];
          submission_cooldown: string;
          total_ideas: number | null;
          total_votes: number | null;
          vote_threshold: number;
        };
        Insert: {
          created_at?: string;
          cycle_number: number;
          daily_vote_limit?: number;
          ends_at: string;
          finalization_note?: string | null;
          finalized_at?: string | null;
          id?: string;
          qualified_count?: number | null;
          reward_slots?: number;
          starts_at: string;
          status?: Database['public']['Enums']['cycle_status'];
          submission_cooldown?: string;
          total_ideas?: number | null;
          total_votes?: number | null;
          vote_threshold?: number;
        };
        Update: {
          created_at?: string;
          cycle_number?: number;
          daily_vote_limit?: number;
          ends_at?: string;
          finalization_note?: string | null;
          finalized_at?: string | null;
          id?: string;
          qualified_count?: number | null;
          reward_slots?: number;
          starts_at?: string;
          status?: Database['public']['Enums']['cycle_status'];
          submission_cooldown?: string;
          total_ideas?: number | null;
          total_votes?: number | null;
          vote_threshold?: number;
        };
        Relationships: [];
      };
      ideas: {
        Row: {
          author_id: string;
          body: string;
          category: string;
          created_at: string;
          cycle_id: string;
          id: string;
          locked_at: string | null;
          qualified_at: string | null;
          removal_reason: string | null;
          removed_at: string | null;
          report_count: number;
          slug: string;
          status: Database['public']['Enums']['idea_status'];
          summary: string;
          tags: string[];
          title: string;
          updated_at: string;
          verified_vote_count: number;
          vote_count: number;
          withdrawn_at: string | null;
        };
        Insert: {
          author_id: string;
          body: string;
          category: string;
          created_at?: string;
          cycle_id: string;
          id?: string;
          locked_at?: string | null;
          qualified_at?: string | null;
          removal_reason?: string | null;
          removed_at?: string | null;
          report_count?: number;
          slug?: string;
          status?: Database['public']['Enums']['idea_status'];
          summary: string;
          tags?: string[];
          title: string;
          updated_at?: string;
          verified_vote_count?: number;
          vote_count?: number;
          withdrawn_at?: string | null;
        };
        Update: {
          author_id?: string;
          body?: string;
          category?: string;
          created_at?: string;
          cycle_id?: string;
          id?: string;
          locked_at?: string | null;
          qualified_at?: string | null;
          removal_reason?: string | null;
          removed_at?: string | null;
          report_count?: number;
          slug?: string;
          status?: Database['public']['Enums']['idea_status'];
          summary?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
          verified_vote_count?: number;
          vote_count?: number;
          withdrawn_at?: string | null;
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
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          cycles_won: number;
          display_name: string;
          id: string;
          ideas_count: number;
          last_idea_at: string | null;
          last_vote_at: string | null;
          role: Database['public']['Enums']['user_role'];
          status: Database['public']['Enums']['account_status'];
          suspended_until: string | null;
          suspension_reason: string | null;
          updated_at: string;
          username: string;
          username_changed_at: string | null;
          votes_cast_count: number;
          votes_received_count: number;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          cycles_won?: number;
          display_name: string;
          id: string;
          ideas_count?: number;
          last_idea_at?: string | null;
          last_vote_at?: string | null;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['account_status'];
          suspended_until?: string | null;
          suspension_reason?: string | null;
          updated_at?: string;
          username: string;
          username_changed_at?: string | null;
          votes_cast_count?: number;
          votes_received_count?: number;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          cycles_won?: number;
          display_name?: string;
          id?: string;
          ideas_count?: number;
          last_idea_at?: string | null;
          last_vote_at?: string | null;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['account_status'];
          suspended_until?: string | null;
          suspension_reason?: string | null;
          updated_at?: string;
          username?: string;
          username_changed_at?: string | null;
          votes_cast_count?: number;
          votes_received_count?: number;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          detail: string | null;
          id: string;
          idea_id: string;
          reason: string;
          reporter_id: string;
          resolution: string | null;
          resolved_at: string | null;
        };
        Insert: {
          created_at?: string;
          detail?: string | null;
          id?: string;
          idea_id: string;
          reason: string;
          reporter_id: string;
          resolution?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          created_at?: string;
          detail?: string | null;
          id?: string;
          idea_id?: string;
          reason?: string;
          reporter_id?: string;
          resolution?: string | null;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'idea_public_stats';
            referencedColumns: ['idea_id'];
          },
          {
            foreignKeyName: 'reports_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'ideas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rewards: {
        Row: {
          announced_at: string | null;
          claimed_at: string | null;
          created_at: string;
          cycle_id: string;
          description: string | null;
          fulfilled_at: string | null;
          id: string;
          idea_id: string;
          payout_amount: number | null;
          payout_currency: string | null;
          payout_kind: string;
          qualified_at: string;
          rank: number;
          recipient_id: string;
          status: Database['public']['Enums']['reward_status'];
          title: string;
          verified_votes: number;
        };
        Insert: {
          announced_at?: string | null;
          claimed_at?: string | null;
          created_at?: string;
          cycle_id: string;
          description?: string | null;
          fulfilled_at?: string | null;
          id?: string;
          idea_id: string;
          payout_amount?: number | null;
          payout_currency?: string | null;
          payout_kind?: string;
          qualified_at: string;
          rank: number;
          recipient_id: string;
          status?: Database['public']['Enums']['reward_status'];
          title: string;
          verified_votes: number;
        };
        Update: {
          announced_at?: string | null;
          claimed_at?: string | null;
          created_at?: string;
          cycle_id?: string;
          description?: string | null;
          fulfilled_at?: string | null;
          id?: string;
          idea_id?: string;
          payout_amount?: number | null;
          payout_currency?: string | null;
          payout_kind?: string;
          qualified_at?: string;
          rank?: number;
          recipient_id?: string;
          status?: Database['public']['Enums']['reward_status'];
          title?: string;
          verified_votes?: number;
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
            referencedRelation: 'idea_public_stats';
            referencedColumns: ['idea_id'];
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
      suspicious_clusters: {
        Row: {
          account_a: string;
          account_b: string;
          created_at: string;
          cycle_id: string | null;
          id: string;
          jaccard_overlap: number;
          priority: string;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          shared_votes_count: number;
          signals: Json;
          status: string;
        };
        Insert: {
          account_a: string;
          account_b: string;
          created_at?: string;
          cycle_id?: string | null;
          id?: string;
          jaccard_overlap: number;
          priority?: string;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          shared_votes_count?: number;
          signals?: Json;
          status?: string;
        };
        Update: {
          account_a?: string;
          account_b?: string;
          created_at?: string;
          cycle_id?: string | null;
          id?: string;
          jaccard_overlap?: number;
          priority?: string;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          shared_votes_count?: number;
          signals?: Json;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'suspicious_clusters_account_a_fkey';
            columns: ['account_a'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'suspicious_clusters_account_b_fkey';
            columns: ['account_b'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'suspicious_clusters_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'cycles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'suspicious_clusters_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      votes: {
        Row: {
          created_at: string;
          cycle_id: string;
          id: string;
          idea_author_id: string;
          idea_id: string;
          is_verified: boolean;
          retracted_at: string | null;
          status: Database['public']['Enums']['vote_status'];
          void_reason: string | null;
          voided_at: string | null;
          voter_id: string;
        };
        Insert: {
          created_at?: string;
          cycle_id: string;
          id?: string;
          idea_author_id: string;
          idea_id: string;
          is_verified?: boolean;
          retracted_at?: string | null;
          status?: Database['public']['Enums']['vote_status'];
          void_reason?: string | null;
          voided_at?: string | null;
          voter_id: string;
        };
        Update: {
          created_at?: string;
          cycle_id?: string;
          id?: string;
          idea_author_id?: string;
          idea_id?: string;
          is_verified?: boolean;
          retracted_at?: string | null;
          status?: Database['public']['Enums']['vote_status'];
          void_reason?: string | null;
          voided_at?: string | null;
          voter_id?: string;
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
    };
    Views: {
      idea_public_stats: {
        Row: {
          cycle_id: string | null;
          cycle_rank: number | null;
          idea_id: string | null;
          is_qualified: boolean | null;
          verified_vote_count: number | null;
          vote_count: number | null;
          vote_threshold: number | null;
          votes_to_qualify: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ideas_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'cycles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      account_is_writable: { Args: { uid?: string }; Returns: boolean };
      active_cycle_id: { Args: never; Returns: string };
      admin_recount_cycle: {
        Args: { p_cycle_id: string; p_reason?: string };
        Returns: Json;
      };
      admin_suspend_account: {
        Args: { p_duration_days: number; p_reason: string; p_user_id: string };
        Returns: Json;
      };
      admin_void_vote: {
        Args: { p_reason: string; p_vote_id: string };
        Returns: Json;
      };
      cast_vote: { Args: { p_idea_id: string }; Returns: Json };
      check_cycle_health: { Args: never; Returns: Json };
      detect_voting_rings: { Args: { p_cycle_id?: string }; Returns: Json };
      finalize_cycle: { Args: { p_cycle_id?: string }; Returns: Json };
      get_feed_ideas: {
        Args: {
          p_category?: string;
          p_cursor_created_at?: string;
          p_cursor_id?: string;
          p_cursor_score?: number;
          p_cursor_votes?: number;
          p_limit?: number;
          p_search?: string;
          p_sort?: string;
          p_tag?: string;
        };
        Returns: {
          author_avatar_url: string;
          author_display_name: string;
          author_id: string;
          author_username: string;
          category: string;
          created_at: string;
          cycle_id: string;
          cycle_number: number;
          id: string;
          slug: string;
          status: Database['public']['Enums']['idea_status'];
          summary: string;
          tags: string[];
          title: string;
          trending_score: number;
          verified_vote_count: number;
          vote_count: number;
          vote_threshold: number;
        }[];
      };
      get_leaderboard: {
        Args: { p_cycle_id?: string; p_limit?: number };
        Returns: {
          author_avatar_url: string;
          author_display_name: string;
          author_id: string;
          author_username: string;
          created_at: string;
          cycle_id: string;
          cycle_rank: number;
          idea_id: string;
          is_qualified: boolean;
          slug: string;
          title: string;
          verified_vote_count: number;
          vote_count: number;
          vote_threshold: number;
          votes_to_qualify: number;
        }[];
      };
      is_admin: { Args: { uid?: string }; Returns: boolean };
      log_abuse: {
        Args: {
          p_actor: string;
          p_code: string;
          p_detail?: Json;
          p_kind: Database['public']['Enums']['abuse_kind'];
          p_table?: string;
          p_target?: string;
        };
        Returns: undefined;
      };
      moderate_idea_report: {
        Args: { p_action: string; p_idea_id: string; p_reason: string };
        Returns: Json;
      };
      open_next_cycle: { Args: never; Returns: string };
      retract_vote: { Args: { p_idea_id: string }; Returns: Json };
      rotate_cycle: { Args: never; Returns: Json };
      voter_is_verified: { Args: { uid: string }; Returns: boolean };
    };
    Enums: {
      abuse_kind:
        | 'self_vote_attempt'
        | 'duplicate_vote_attempt'
        | 'vote_quota_exceeded'
        | 'submit_quota_exceeded'
        | 'unconfirmed_write_attempt'
        | 'suspended_write_attempt'
        | 'closed_idea_vote_attempt'
        | 'rate_limit_tripped';
      account_status: 'active' | 'suspended' | 'deleted';
      cycle_status: 'scheduled' | 'active' | 'closing' | 'finalized' | 'recount_required';
      idea_status: 'published' | 'withdrawn' | 'under_review' | 'removed';
      reward_status: 'pending' | 'announced' | 'claimed' | 'fulfilled' | 'forfeited';
      user_role: 'member' | 'moderator' | 'admin';
      vote_status: 'active' | 'retracted' | 'voided';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      abuse_kind: [
        'self_vote_attempt',
        'duplicate_vote_attempt',
        'vote_quota_exceeded',
        'submit_quota_exceeded',
        'unconfirmed_write_attempt',
        'suspended_write_attempt',
        'closed_idea_vote_attempt',
        'rate_limit_tripped',
      ],
      account_status: ['active', 'suspended', 'deleted'],
      cycle_status: ['scheduled', 'active', 'closing', 'finalized', 'recount_required'],
      idea_status: ['published', 'withdrawn', 'under_review', 'removed'],
      reward_status: ['pending', 'announced', 'claimed', 'fulfilled', 'forfeited'],
      user_role: ['member', 'moderator', 'admin'],
      vote_status: ['active', 'retracted', 'voided'],
    },
  },
} as const;
