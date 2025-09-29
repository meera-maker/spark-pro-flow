import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create supabase client or mock if not connected
let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not found. Please ensure Supabase is properly connected in your Lovable project.')
  console.error('Missing:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  })
  
  // Create a comprehensive mock client for when Supabase isn't connected
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not connected') }),
      onAuthStateChange: (callback: any) => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      }),
      signInWithPassword: (credentials: any) => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
      signUp: (credentials: any) => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not connected') }),
      admin: {
        createUser: (userData: any) => Promise.resolve({ data: null, error: new Error('Supabase not connected') })
      }
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: new Error('Supabase not connected') }),
          limit: (count: number) => Promise.resolve({ data: [], error: new Error('Supabase not connected') })
        }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: new Error('Supabase not connected') }),
        limit: (count: number) => Promise.resolve({ data: [], error: new Error('Supabase not connected') })
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Supabase not connected') })
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: new Error('Supabase not connected') })
      })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

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