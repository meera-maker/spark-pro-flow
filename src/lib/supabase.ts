import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'senior-cs' | 'cs' | 'design-head' | 'designer' | 'qc' | 'admin'
          department: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'senior-cs' | 'cs' | 'design-head' | 'designer' | 'qc' | 'admin'
          department?: string | null
          avatar_url?: string | null
          is_active?: boolean
        }
        Update: {
          full_name?: string | null
          role?: 'senior-cs' | 'cs' | 'design-head' | 'designer' | 'qc' | 'admin'
          department?: string | null
          avatar_url?: string | null
          is_active?: boolean
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          company: string | null
          address: string | null
          billing_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          email: string
          phone?: string | null
          company?: string | null
          address?: string | null
          billing_rate?: number
        }
        Update: {
          name?: string
          email?: string
          phone?: string | null
          company?: string | null
          address?: string | null
          billing_rate?: number
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          client_id: string | null
          current_status: string
          current_assignee: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number
          billing_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          client_id?: string | null
          current_status?: string
          current_assignee?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          estimated_hours?: number | null
        }
        Update: {
          title?: string
          description?: string | null
          client_id?: string | null
          current_status?: string
          current_assignee?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          estimated_hours?: number | null
        }
      }
      workflow_steps: {
        Row: {
          id: string
          project_id: string
          status: string
          assigned_to: string | null
          assigned_by: string | null
          comments: string | null
          hours_logged: number
          timestamp: string
        }
        Insert: {
          project_id: string
          status: string
          assigned_to?: string | null
          assigned_by?: string | null
          comments?: string | null
          hours_logged?: number
        }
        Update: {
          comments?: string | null
          hours_logged?: number
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          project_id: string
          type: 'assignment' | 'revision' | 'approval' | 'completion'
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          project_id: string
          type: 'assignment' | 'revision' | 'approval' | 'completion'
          message: string
        }
        Update: {
          is_read?: boolean
        }
      }
      time_entries: {
        Row: {
          id: string
          project_id: string
          user_id: string
          description: string | null
          hours: number
          hourly_rate: number | null
          date: string
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          description?: string | null
          hours: number
          hourly_rate?: number | null
          date?: string
        }
        Update: {
          description?: string | null
          hours?: number
          hourly_rate?: number | null
          date?: string
        }
      }
    }
  }
}