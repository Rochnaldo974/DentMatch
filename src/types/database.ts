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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          accepted_at: string | null
          applicant_user_id: string
          confirmed_availability: boolean
          created_at: string
          expected_compensation: string | null
          id: string
          job_post_id: string
          message: string | null
          note: string | null
          rejected_at: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          updated_at: string
          viewed_at: string | null
          withdrawn_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          applicant_user_id: string
          confirmed_availability?: boolean
          created_at?: string
          expected_compensation?: string | null
          id?: string
          job_post_id: string
          message?: string | null
          note?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
          viewed_at?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          applicant_user_id?: string
          confirmed_availability?: boolean
          created_at?: string
          expected_compensation?: string | null
          id?: string
          job_post_id?: string
          message?: string | null
          note?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
          viewed_at?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availabilities: {
        Row: {
          available: boolean
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          recurring_days: string[]
          start_date: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          recurring_days?: string[]
          start_date?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          recurring_days?: string[]
          start_date?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinet_equipment: {
        Row: {
          cabinet_id: string
          equipment_code: string
        }
        Insert: {
          cabinet_id: string
          equipment_code: string
        }
        Update: {
          cabinet_id?: string
          equipment_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_equipment_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinet_photos: {
        Row: {
          cabinet_id: string
          created_at: string
          display_order: number
          id: string
          photo_type: string
          storage_path: string
        }
        Insert: {
          cabinet_id: string
          created_at?: string
          display_order?: number
          id?: string
          photo_type: string
          storage_path: string
        }
        Update: {
          cabinet_id?: string
          created_at?: string
          display_order?: number
          id?: string
          photo_type?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_photos_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinet_profiles: {
        Row: {
          accessibility: boolean | null
          address_line_1: string | null
          address_line_2: string | null
          assistants_count: number | null
          city: string | null
          created_at: string
          department: string | null
          description: string | null
          email: string | null
          environment_type: string | null
          finess: string | null
          id: string
          languages: string[]
          latitude: number | null
          longitude: number | null
          manager_email: string | null
          manager_role: string | null
          name: string
          parking: boolean | null
          phone: string | null
          postal_code: string | null
          practitioners_count: number | null
          profile_completion: number
          public_transport: string | null
          region: string | null
          replacement_frequency: string | null
          replacement_types_sought: string[]
          search_radius_km: number | null
          siret: string | null
          software: string | null
          structure_type: string | null
          territory: string | null
          treatment_rooms_count: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          accessibility?: boolean | null
          address_line_1?: string | null
          address_line_2?: string | null
          assistants_count?: number | null
          city?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          email?: string | null
          environment_type?: string | null
          finess?: string | null
          id?: string
          languages?: string[]
          latitude?: number | null
          longitude?: number | null
          manager_email?: string | null
          manager_role?: string | null
          name?: string
          parking?: boolean | null
          phone?: string | null
          postal_code?: string | null
          practitioners_count?: number | null
          profile_completion?: number
          public_transport?: string | null
          region?: string | null
          replacement_frequency?: string | null
          replacement_types_sought?: string[]
          search_radius_km?: number | null
          siret?: string | null
          software?: string | null
          structure_type?: string | null
          territory?: string | null
          treatment_rooms_count?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          accessibility?: boolean | null
          address_line_1?: string | null
          address_line_2?: string | null
          assistants_count?: number | null
          city?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          email?: string | null
          environment_type?: string | null
          finess?: string | null
          id?: string
          languages?: string[]
          latitude?: number | null
          longitude?: number | null
          manager_email?: string | null
          manager_role?: string | null
          name?: string
          parking?: boolean | null
          phone?: string | null
          postal_code?: string | null
          practitioners_count?: number | null
          profile_completion?: number
          public_transport?: string | null
          region?: string | null
          replacement_frequency?: string | null
          replacement_types_sought?: string[]
          search_radius_km?: number | null
          siret?: string | null
          software?: string | null
          structure_type?: string | null
          territory?: string | null
          treatment_rooms_count?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          created_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          job_post_id: string | null
          placement_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_post_id?: string | null
          placement_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_post_id?: string | null
          placement_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          expires_at: string | null
          id: string
          is_simulated: boolean
          mime_type: string | null
          original_name: string
          owner_type: string
          owner_user_id: string
          rejection_reason: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          expires_at?: string | null
          id?: string
          is_simulated?: boolean
          mime_type?: string | null
          original_name?: string
          owner_type: string
          owner_user_id: string
          rejection_reason?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          expires_at?: string | null
          id?: string
          is_simulated?: boolean
          mime_type?: string | null
          original_name?: string
          owner_type?: string
          owner_user_id?: string
          rejection_reason?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_post_skills: {
        Row: {
          job_post_id: string
          specialty_id: string
        }
        Insert: {
          job_post_id: string
          specialty_id: string
        }
        Update: {
          job_post_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_post_skills_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_post_skills_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          accommodation_provided: boolean
          application_deadline: string | null
          cabinet_id: string
          city: string | null
          compensation_details: string | null
          compensation_type: string | null
          compensation_value: number | null
          contract_type: string | null
          created_at: string
          created_by: string
          department: string | null
          description: string | null
          end_date: string | null
          equipment: string[]
          expected_procedures: string | null
          experience_required: string | null
          filled_positions_count: number
          full_time: boolean | null
          id: string
          languages: string[]
          positions_count: number
          postal_code: string | null
          practical_info: string | null
          published_at: string | null
          region: string | null
          replaced_practitioner: string | null
          replacement_reason: string | null
          replacement_type: string | null
          schedule_text: string | null
          software: string | null
          specialty_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["job_post_status"]
          territory: string | null
          title: string
          travel_covered: boolean
          updated_at: string
          urgent: boolean
          working_days: string[]
        }
        Insert: {
          accommodation_provided?: boolean
          application_deadline?: string | null
          cabinet_id: string
          city?: string | null
          compensation_details?: string | null
          compensation_type?: string | null
          compensation_value?: number | null
          contract_type?: string | null
          created_at?: string
          created_by: string
          department?: string | null
          description?: string | null
          end_date?: string | null
          equipment?: string[]
          expected_procedures?: string | null
          experience_required?: string | null
          filled_positions_count?: number
          full_time?: boolean | null
          id?: string
          languages?: string[]
          positions_count?: number
          postal_code?: string | null
          practical_info?: string | null
          published_at?: string | null
          region?: string | null
          replaced_practitioner?: string | null
          replacement_reason?: string | null
          replacement_type?: string | null
          schedule_text?: string | null
          software?: string | null
          specialty_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_post_status"]
          territory?: string | null
          title?: string
          travel_covered?: boolean
          updated_at?: string
          urgent?: boolean
          working_days?: string[]
        }
        Update: {
          accommodation_provided?: boolean
          application_deadline?: string | null
          cabinet_id?: string
          city?: string | null
          compensation_details?: string | null
          compensation_type?: string | null
          compensation_value?: number | null
          contract_type?: string | null
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string | null
          end_date?: string | null
          equipment?: string[]
          expected_procedures?: string | null
          experience_required?: string | null
          filled_positions_count?: number
          full_time?: boolean | null
          id?: string
          languages?: string[]
          positions_count?: number
          postal_code?: string | null
          practical_info?: string | null
          published_at?: string | null
          region?: string | null
          replaced_practitioner?: string | null
          replacement_reason?: string | null
          replacement_type?: string | null
          schedule_text?: string | null
          software?: string | null
          specialty_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_post_status"]
          territory?: string | null
          title?: string
          travel_covered?: boolean
          updated_at?: string
          urgent?: boolean
          working_days?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobility_areas: {
        Row: {
          area_type: string
          area_value: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          area_type: string
          area_value: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          area_type?: string
          area_value?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobility_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          metadata: Json
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          administrative_checklist: Json
          application_id: string
          cabinet_id: string
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string
          created_at: string
          end_date: string | null
          id: string
          job_post_id: string
          replacement_user_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["placement_status"]
          updated_at: string
        }
        Insert: {
          administrative_checklist?: Json
          application_id: string
          cabinet_id: string
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string
          created_at?: string
          end_date?: string | null
          id?: string
          job_post_id: string
          replacement_user_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["placement_status"]
          updated_at?: string
        }
        Update: {
          administrative_checklist?: Json
          application_id?: string
          cabinet_id?: string
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string
          created_at?: string
          end_date?: string | null
          id?: string
          job_post_id?: string
          replacement_user_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["placement_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_replacement_user_id_fkey"
            columns: ["replacement_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_specialties: {
        Row: {
          specialty_id: string
          user_id: string
        }
        Insert: {
          specialty_id: string
          user_id: string
        }
        Update: {
          specialty_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_specialties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          onboarding_completed: boolean
          onboarding_step: number
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id: string
          last_name?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      replacement_profiles: {
        Row: {
          accepts_travel_with_accommodation: boolean | null
          address_line: string | null
          attachment_institution: string | null
          availability_preferences: string[]
          bio: string | null
          birth_date: string | null
          city: string | null
          cps_last_digits: string | null
          created_at: string
          csct_date: string | null
          current_practice_mode: string | null
          desired_equipment: string[]
          excluded_procedures: string | null
          experience_years: number | null
          fifth_year_validated: boolean | null
          graduation_year: number | null
          has_cps: boolean | null
          has_csct: boolean | null
          has_driving_license: boolean | null
          has_exercise_authorization: boolean | null
          has_vehicle: boolean | null
          hospital_name: string | null
          hospital_status: boolean | null
          id: string
          internship_year: string | null
          languages: string[]
          license_expiration_date: string | null
          mastered_procedures: string | null
          max_travel_duration: string | null
          min_compensation: string | null
          min_days_count: number | null
          mobility_radius_km: number | null
          national_mobility: boolean | null
          needs_accommodation: boolean | null
          ordinal_department: string | null
          ordinal_number: string | null
          postal_code: string | null
          preferred_environment: string | null
          prefers_daily_rate: boolean | null
          prefers_retrocession: boolean | null
          professional_email: string | null
          professional_status:
            | Database["public"]["Enums"]["professional_status"]
            | null
          profile_completion: number
          public_visibility: Json
          rcp_expiration_date: string | null
          rcp_insurer: string | null
          replacement_preferences: string[]
          resident_specialty: string | null
          rpps_number: string | null
          software_used: string[]
          student_year: string | null
          territory: string | null
          university: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepts_travel_with_accommodation?: boolean | null
          address_line?: string | null
          attachment_institution?: string | null
          availability_preferences?: string[]
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          cps_last_digits?: string | null
          created_at?: string
          csct_date?: string | null
          current_practice_mode?: string | null
          desired_equipment?: string[]
          excluded_procedures?: string | null
          experience_years?: number | null
          fifth_year_validated?: boolean | null
          graduation_year?: number | null
          has_cps?: boolean | null
          has_csct?: boolean | null
          has_driving_license?: boolean | null
          has_exercise_authorization?: boolean | null
          has_vehicle?: boolean | null
          hospital_name?: string | null
          hospital_status?: boolean | null
          id?: string
          internship_year?: string | null
          languages?: string[]
          license_expiration_date?: string | null
          mastered_procedures?: string | null
          max_travel_duration?: string | null
          min_compensation?: string | null
          min_days_count?: number | null
          mobility_radius_km?: number | null
          national_mobility?: boolean | null
          needs_accommodation?: boolean | null
          ordinal_department?: string | null
          ordinal_number?: string | null
          postal_code?: string | null
          preferred_environment?: string | null
          prefers_daily_rate?: boolean | null
          prefers_retrocession?: boolean | null
          professional_email?: string | null
          professional_status?:
            | Database["public"]["Enums"]["professional_status"]
            | null
          profile_completion?: number
          public_visibility?: Json
          rcp_expiration_date?: string | null
          rcp_insurer?: string | null
          replacement_preferences?: string[]
          resident_specialty?: string | null
          rpps_number?: string | null
          software_used?: string[]
          student_year?: string | null
          territory?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepts_travel_with_accommodation?: boolean | null
          address_line?: string | null
          attachment_institution?: string | null
          availability_preferences?: string[]
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          cps_last_digits?: string | null
          created_at?: string
          csct_date?: string | null
          current_practice_mode?: string | null
          desired_equipment?: string[]
          excluded_procedures?: string | null
          experience_years?: number | null
          fifth_year_validated?: boolean | null
          graduation_year?: number | null
          has_cps?: boolean | null
          has_csct?: boolean | null
          has_driving_license?: boolean | null
          has_exercise_authorization?: boolean | null
          has_vehicle?: boolean | null
          hospital_name?: string | null
          hospital_status?: boolean | null
          id?: string
          internship_year?: string | null
          languages?: string[]
          license_expiration_date?: string | null
          mastered_procedures?: string | null
          max_travel_duration?: string | null
          min_compensation?: string | null
          min_days_count?: number | null
          mobility_radius_km?: number | null
          national_mobility?: boolean | null
          needs_accommodation?: boolean | null
          ordinal_department?: string | null
          ordinal_number?: string | null
          postal_code?: string | null
          preferred_environment?: string | null
          prefers_daily_rate?: boolean | null
          prefers_retrocession?: boolean | null
          professional_email?: string | null
          professional_status?:
            | Database["public"]["Enums"]["professional_status"]
            | null
          profile_completion?: number
          public_visibility?: Json
          rcp_expiration_date?: string | null
          rcp_insurer?: string | null
          replacement_preferences?: string[]
          resident_specialty?: string | null
          rpps_number?: string | null
          software_used?: string[]
          student_year?: string | null
          territory?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "replacement_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_job_posts: {
        Row: {
          created_at: string
          job_post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          job_post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          job_post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_job_posts_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_job_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          code: string
          created_at: string
          id: string
          is_specialized: boolean
          label: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_specialized?: boolean
          label: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_specialized?: boolean
          label?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          in_app_notifications: boolean
          marketing_emails: boolean
          privacy: Json
          search_criteria: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          marketing_emails?: boolean
          privacy?: Json
          search_criteria?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          marketing_emails?: boolean
          privacy?: Json
          search_criteria?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_candidate_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          experience_years: number | null
          first_name: string | null
          languages: string[] | null
          last_name_initial: string | null
          mobility_radius_km: number | null
          national_mobility: boolean | null
          professional_status:
            | Database["public"]["Enums"]["professional_status"]
            | null
          territory: string | null
          user_id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "replacement_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_application: {
        Args: { p_application_id: string; p_mark_filled?: boolean }
        Returns: Json
      }
      current_cabinet_id: { Args: never; Returns: string }
      delete_own_account: { Args: never; Returns: undefined }
      get_or_create_application_conversation: {
        Args: { p_application_id: string }
        Returns: string
      }
      invite_candidate: {
        Args: { p_job_post_id: string; p_candidate_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_conversation_member: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_event_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      shares_application_with: { Args: { p_user_id: string }; Returns: boolean }
      shares_conversation_with: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "submitted"
        | "viewed"
        | "shortlisted"
        | "accepted"
        | "rejected"
        | "withdrawn"
      document_status:
        | "missing"
        | "uploaded"
        | "pending"
        | "verified"
        | "rejected"
      job_post_status:
        | "draft"
        | "published"
        | "filled"
        | "expired"
        | "archived"
        | "cancelled"
        | "suspended"
      placement_status: "confirmed" | "completed" | "cancelled"
      professional_status: "qualified_dentist" | "student" | "resident"
      user_role: "cabinet" | "replacement_dentist" | "admin"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
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
      application_status: [
        "submitted",
        "viewed",
        "shortlisted",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      document_status: [
        "missing",
        "uploaded",
        "pending",
        "verified",
        "rejected",
      ],
      job_post_status: [
        "draft",
        "published",
        "filled",
        "expired",
        "archived",
        "cancelled",
        "suspended",
      ],
      placement_status: ["confirmed", "completed", "cancelled"],
      professional_status: ["qualified_dentist", "student", "resident"],
      user_role: ["cabinet", "replacement_dentist", "admin"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
