// TypeScript types for Supabase database schema
// Generate updated types with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          subscription_tier: string
          settings: Json
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          subscription_tier?: string
          settings?: Json
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          subscription_tier?: string
          settings?: Json
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_tenants: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          role: string
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          role?: string
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          role?: string
          permissions?: Json
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: 'income' | 'expense'
          parent_id: string | null
          color: string | null
          icon: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type: 'income' | 'expense'
          parent_id?: string | null
          color?: string | null
          icon?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          type?: 'income' | 'expense'
          parent_id?: string | null
          color?: string | null
          icon?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: 'cash' | 'bank' | 'card' | 'wallet' | 'investment'
          currency: string
          initial_balance: number
          current_balance: number
          account_number: string | null
          institution_name: string | null
          color: string | null
          icon: string | null
          notes: string | null
          is_active: boolean
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type: 'cash' | 'bank' | 'card' | 'wallet' | 'investment'
          currency?: string
          initial_balance?: number
          current_balance?: number
          account_number?: string | null
          institution_name?: string | null
          color?: string | null
          icon?: string | null
          notes?: string | null
          is_active?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          type?: 'cash' | 'bank' | 'card' | 'wallet' | 'investment'
          currency?: string
          initial_balance?: number
          current_balance?: number
          account_number?: string | null
          institution_name?: string | null
          color?: string | null
          icon?: string | null
          notes?: string | null
          is_active?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: 'customer' | 'supplier' | 'both' | null
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type?: 'customer' | 'supplier' | 'both' | null
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          type?: 'customer' | 'supplier' | 'both' | null
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          tenant_id: string
          name: string
          code: string | null
          description: string | null
          budget: number | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          code?: string | null
          description?: string | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          code?: string | null
          description?: string | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          tenant_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          date: string
          account_id: string
          to_account_id: string | null
          category_id: string | null
          contact_id: string | null
          project_id: string | null
          description: string | null
          notes: string | null
          reference_number: string | null
          tags: string[] | null
          is_recurring: boolean
          recurring_rule: Json | null
          parent_transaction_id: string | null
          is_reconciled: boolean
          reconciled_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          date: string
          account_id: string
          to_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          project_id?: string | null
          description?: string | null
          notes?: string | null
          reference_number?: string | null
          tags?: string[] | null
          is_recurring?: boolean
          recurring_rule?: Json | null
          parent_transaction_id?: string | null
          is_reconciled?: boolean
          reconciled_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          date?: string
          account_id?: string
          to_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          project_id?: string | null
          description?: string | null
          notes?: string | null
          reference_number?: string | null
          tags?: string[] | null
          is_recurring?: boolean
          recurring_rule?: Json | null
          parent_transaction_id?: string | null
          is_reconciled?: boolean
          reconciled_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          tenant_id: string
          transaction_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          transaction_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          transaction_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          tenant_id: string
          name: string
          category_id: string
          amount: number
          period: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          category_id: string
          amount: number
          period: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          category_id?: string
          amount?: number
          period?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_templates: {
        Row: {
          id: string
          tenant_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          account_id: string
          category_id: string | null
          description: string | null
          frequency: string
          interval: number
          start_date: string
          end_date: string | null
          next_occurrence: string
          last_generated_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          account_id: string
          category_id?: string | null
          description?: string | null
          frequency: string
          interval?: number
          start_date: string
          end_date?: string | null
          next_occurrence: string
          last_generated_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          account_id?: string
          category_id?: string | null
          description?: string | null
          frequency?: string
          interval?: number
          start_date?: string
          end_date?: string | null
          next_occurrence?: string
          last_generated_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      dashboard_kpis: {
        Row: {
          tenant_id: string
          month: string
          total_income: number
          total_expense: number
          net_flow: number
          transaction_count: number
          categories_used: number
        }
      }
    }
    Functions: {
      get_user_tenant_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      has_tenant_access: {
        Args: { tenant_uuid: string }
        Returns: boolean
      }
      has_tenant_role: {
        Args: { tenant_uuid: string; required_role: string }
        Returns: boolean
      }
      is_tenant_admin: {
        Args: { tenant_uuid: string }
        Returns: boolean
      }
      refresh_dashboard_kpis: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
