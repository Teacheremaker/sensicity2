import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wlenjqnoeunxwiptxiuw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsZW5qcW5vZXVueHdpcHR4aXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTI2NjQsImV4cCI6MjA2NzU4ODY2NH0.tRDW7Uh6dPSzjozCbAkGxqvsHKOqZi2GxYPp6hSDrG0'; // Remplacez par votre vraie clé

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          is_active: boolean;
          role_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          is_active?: boolean;
          role_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          is_active?: boolean;
          role_id?: number;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: number;
          name: string;
          description: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
        };
      };
      equipements: {
        Row: {
          id: string;
          name: string;
          type: 'camera' | 'server' | 'switch' | 'other';
          model: string;
          status: 'active' | 'maintenance' | 'out_of_service';
          latitude: number;
          longitude: number;
          installation_date: string;
          last_maintenance: string | null;
          conformity_status: 'compliant' | 'non_compliant' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'camera' | 'server' | 'switch' | 'other';
          model: string;
          status?: 'active' | 'maintenance' | 'out_of_service';
          latitude: number;
          longitude: number;
          installation_date: string;
          last_maintenance?: string | null;
          conformity_status?: 'compliant' | 'non_compliant' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'camera' | 'server' | 'switch' | 'other';
          model?: string;
          status?: 'active' | 'maintenance' | 'out_of_service';
          latitude?: number;
          longitude?: number;
          installation_date?: string;
          last_maintenance?: string | null;
          conformity_status?: 'compliant' | 'non_compliant' | 'pending';
          updated_at?: string;
        };
      };
      maintenance_history: {
        Row: {
          id: number;
          equipment_id: string;
          maintenance_date: string;
          description: string;
          performed_by: string;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          equipment_id: string;
          maintenance_date: string;
          description: string;
          performed_by: string;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          equipment_id?: string;
          maintenance_date?: string;
          description?: string;
          performed_by?: string;
          cost?: number | null;
        };
      };
      authorizations: {
        Row: {
          id: number;
          type: string;
          reference: string;
          issue_date: string;
          expiry_date: string;
          description: string;
          status: 'valid' | 'expired' | 'pending';
          equipment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          type: string;
          reference: string;
          issue_date: string;
          expiry_date: string;
          description: string;
          status?: 'valid' | 'expired' | 'pending';
          equipment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          type?: string;
          reference?: string;
          issue_date?: string;
          expiry_date?: string;
          description?: string;
          status?: 'valid' | 'expired' | 'pending';
          equipment_id?: string | null;
          updated_at?: string;
        };
      };
      logbook_entries: {
        Row: {
          id: number;
          timestamp: string;
          type: 'incident' | 'observation' | 'requisition';
          description: string;
          user_id: string;
          equipment_id: string | null;
          is_judicial_requisition: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          timestamp: string;
          type: 'incident' | 'observation' | 'requisition';
          description: string;
          user_id: string;
          equipment_id?: string | null;
          is_judicial_requisition?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          timestamp?: string;
          type?: 'incident' | 'observation' | 'requisition';
          description?: string;
          user_id?: string;
          equipment_id?: string | null;
          is_judicial_requisition?: boolean;
        };
      };
      access_requests: {
        Row: {
          id: number;
          request_type: 'access' | 'rectification' | 'deletion';
          requester_name: string;
          requester_email: string;
          request_date: string;
          due_date: string;
          status: 'open' | 'in_progress' | 'closed' | 'refused';
          description: string;
          response_details: string | null;
          processed_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          request_type: 'access' | 'rectification' | 'deletion';
          requester_name: string;
          requester_email: string;
          request_date: string;
          due_date: string;
          status?: 'open' | 'in_progress' | 'closed' | 'refused';
          description: string;
          response_details?: string | null;
          processed_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          request_type?: 'access' | 'rectification' | 'deletion';
          requester_name?: string;
          requester_email?: string;
          request_date?: string;
          due_date?: string;
          status?: 'open' | 'in_progress' | 'closed' | 'refused';
          description?: string;
          response_details?: string | null;
          processed_by_user_id?: string | null;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: number;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          version: number;
          related_equipment_id: string | null;
          related_authorization_id: number | null;
          uploaded_by_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          version?: number;
          related_equipment_id?: string | null;
          related_authorization_id?: number | null;
          uploaded_by_user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          version?: number;
          related_equipment_id?: string | null;
          related_authorization_id?: number | null;
          uploaded_by_user_id?: string;
          updated_at?: string;
        };
      };
      user_dashboard_configs: {
        Row: {
          id: number;
          user_id: string;
          config_json: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          config_json: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          config_json?: any;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: number;
          user_id: string;
          action: string;
          details: string;
          resource_type: string;
          resource_id: string;
          timestamp: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          action: string;
          details: string;
          resource_type: string;
          resource_id: string;
          timestamp?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          action?: string;
          details?: string;
          resource_type?: string;
          resource_id?: string;
          timestamp?: string;
        };
      };
    };
  };
}