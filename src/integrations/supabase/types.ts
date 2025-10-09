export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string | null
          duration_hours: number | null
          id: string
          login_time: string
          logout_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          login_time?: string
          logout_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          login_time?: string
          logout_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          id: string
          meta: Json | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          billing_address: string | null
          company: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          name: string
          payment_terms: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          billing_address?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          name: string
          payment_terms?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          billing_address?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          payment_terms?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          rate: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          project_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          payload: Json | null
          read_flag: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          payload?: Json | null
          read_flag?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          payload?: Json | null
          read_flag?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_workflow_log: {
        Row: {
          action: string
          created_at: string | null
          from_role: Database["public"]["Enums"]["workflow_role"] | null
          from_user_id: string | null
          id: string
          notes: string | null
          project_id: string | null
          to_role: Database["public"]["Enums"]["workflow_role"] | null
          to_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          from_role?: Database["public"]["Enums"]["workflow_role"] | null
          from_user_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          to_role?: Database["public"]["Enums"]["workflow_role"] | null
          to_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          from_role?: Database["public"]["Enums"]["workflow_role"] | null
          from_user_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          to_role?: Database["public"]["Enums"]["workflow_role"] | null
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_workflow_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          account: string | null
          additional_tasks: string | null
          brief: string
          business_unit: string | null
          client_email: string
          client_name: string
          content_hours: number | null
          coordinator_id: string | null
          copy_text: string | null
          created_at: string | null
          creative_type: string
          deadline: string
          design_end_time: string | null
          design_start_time: string | null
          designer_id: string | null
          designer_notes: string | null
          details: string | null
          drive_folder_url: string | null
          format: string | null
          id: string
          image_editing_manipulation: string | null
          image_purchase: string | null
          lead_id: string | null
          poc: string | null
          portal_link: string | null
          preview_expires_at: string | null
          preview_token: string | null
          project_code: string
          project_details: string | null
          qc_hours: number | null
          quantity: number | null
          revision_count: number | null
          scope_of_work: string | null
          serial_number: number | null
          status: string
          studio: string | null
          total_design_hours: number | null
          updated_at: string | null
          version_number: string | null
        }
        Insert: {
          account?: string | null
          additional_tasks?: string | null
          brief: string
          business_unit?: string | null
          client_email: string
          client_name: string
          content_hours?: number | null
          coordinator_id?: string | null
          copy_text?: string | null
          created_at?: string | null
          creative_type: string
          deadline: string
          design_end_time?: string | null
          design_start_time?: string | null
          designer_id?: string | null
          designer_notes?: string | null
          details?: string | null
          drive_folder_url?: string | null
          format?: string | null
          id?: string
          image_editing_manipulation?: string | null
          image_purchase?: string | null
          lead_id?: string | null
          poc?: string | null
          portal_link?: string | null
          preview_expires_at?: string | null
          preview_token?: string | null
          project_code: string
          project_details?: string | null
          qc_hours?: number | null
          quantity?: number | null
          revision_count?: number | null
          scope_of_work?: string | null
          serial_number?: number | null
          status?: string
          studio?: string | null
          total_design_hours?: number | null
          updated_at?: string | null
          version_number?: string | null
        }
        Update: {
          account?: string | null
          additional_tasks?: string | null
          brief?: string
          business_unit?: string | null
          client_email?: string
          client_name?: string
          content_hours?: number | null
          coordinator_id?: string | null
          copy_text?: string | null
          created_at?: string | null
          creative_type?: string
          deadline?: string
          design_end_time?: string | null
          design_start_time?: string | null
          designer_id?: string | null
          designer_notes?: string | null
          details?: string | null
          drive_folder_url?: string | null
          format?: string | null
          id?: string
          image_editing_manipulation?: string | null
          image_purchase?: string | null
          lead_id?: string | null
          poc?: string | null
          portal_link?: string | null
          preview_expires_at?: string | null
          preview_token?: string | null
          project_code?: string
          project_details?: string | null
          qc_hours?: number | null
          quantity?: number | null
          revision_count?: number | null
          scope_of_work?: string | null
          serial_number?: number | null
          status?: string
          studio?: string | null
          total_design_hours?: number | null
          updated_at?: string | null
          version_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coordinator"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revisions: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          note: string | null
          project_id: string | null
          status: string
          uploaded_by: string | null
          version_no: number
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          note?: string | null
          project_id?: string | null
          status?: string
          uploaded_by?: string | null
          version_no: number
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          note?: string | null
          project_id?: string | null
          status?: string
          uploaded_by?: string | null
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "revisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revisions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_responsibilities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          permissions: Json
          responsibilities: Json
          role: Database["public"]["Enums"]["workflow_role"]
          title: string
          updated_at: string | null
          workflow_actions: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          permissions?: Json
          responsibilities?: Json
          role: Database["public"]["Enums"]["workflow_role"]
          title: string
          updated_at?: string | null
          workflow_actions?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          permissions?: Json
          responsibilities?: Json
          role?: Database["public"]["Enums"]["workflow_role"]
          title?: string
          updated_at?: string | null
          workflow_actions?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          notification_pref: Json | null
          role: string
          timezone: string | null
          updated_at: string | null
          workflow_role: Database["public"]["Enums"]["workflow_role"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          notification_pref?: Json | null
          role: string
          timezone?: string | null
          updated_at?: string | null
          workflow_role?: Database["public"]["Enums"]["workflow_role"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notification_pref?: Json | null
          role?: string
          timezone?: string | null
          updated_at?: string | null
          workflow_role?: Database["public"]["Enums"]["workflow_role"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_role: {
        Args: { _required_role: string; _user_id: string }
        Returns: boolean
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_project_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_revision_version: {
        Args: { p_project_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "Admin" | "Lead" | "Designer" | "QC" | "CS" | "Sr_CS"
      workflow_role:
        | "Sr. CS"
        | "CS"
        | "Design Head"
        | "Designer"
        | "QC"
        | "Client Serving"
        | "Admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["Admin", "Lead", "Designer", "QC", "CS", "Sr_CS"],
      workflow_role: [
        "Sr. CS",
        "CS",
        "Design Head",
        "Designer",
        "QC",
        "Client Serving",
        "Admin",
      ],
    },
  },
} as const
