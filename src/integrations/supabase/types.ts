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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          level: number | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      course_lesson_materials: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content_html: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          is_published: boolean | null
          slug: string
          sort_order: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_file_url: string | null
          video_url: string | null
        }
        Insert: {
          content_html?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          is_published?: boolean | null
          slug: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Update: {
          content_html?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          is_published?: boolean | null
          slug?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          content_html: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          discount_price: number | null
          duration_minutes: number | null
          id: string
          instructor_avatar_url: string | null
          instructor_bio: string | null
          instructor_name: string | null
          is_published: boolean | null
          lessons_count: number | null
          price: number
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content_html?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          duration_minutes?: number | null
          id?: string
          instructor_avatar_url?: string | null
          instructor_bio?: string | null
          instructor_name?: string | null
          is_published?: boolean | null
          lessons_count?: number | null
          price?: number
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content_html?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          duration_minutes?: number | null
          id?: string
          instructor_avatar_url?: string | null
          instructor_bio?: string | null
          instructor_name?: string | null
          is_published?: boolean | null
          lessons_count?: number | null
          price?: number
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          slug: string
          sort_order: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_file_url: string | null
          video_url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          slug: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          slug?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          course_id: string | null
          created_at: string
          id: string
          payment_method: string | null
          plan_id: string | null
          prompt_id: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          prompt_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          prompt_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          slug: string
          sort_order: number | null
          subscription_type: Database["public"]["Enums"]["subscription_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          slug: string
          sort_order?: number | null
          subscription_type: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          slug?: string
          sort_order?: number | null
          subscription_type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_access_expires_at: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          has_agency_access: boolean | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          referral_code: string | null
          referral_earnings: number | null
          referred_by: string | null
          subscription_expires_at: string | null
          subscription_type:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agency_access_expires_at?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_agency_access?: boolean | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          subscription_expires_at?: string | null
          subscription_type?:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agency_access_expires_at?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_agency_access?: boolean | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          subscription_expires_at?: string | null
          subscription_type?:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          prompt_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          prompt_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_files_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          prompt_id: string
          sort_order: number | null
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          prompt_id: string
          sort_order?: number | null
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          prompt_id?: string
          sort_order?: number | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_media_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_ratings: {
        Row: {
          created_at: string
          id: string
          prompt_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_ratings_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          change_notes: string | null
          content: string
          created_at: string
          id: string
          prompt_id: string
          version: number
        }
        Insert: {
          change_notes?: string | null
          content: string
          created_at?: string
          id?: string
          prompt_id: string
          version: number
        }
        Update: {
          change_notes?: string | null
          content?: string
          created_at?: string
          id?: string
          prompt_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          average_rating: number | null
          category_id: string | null
          content: string
          copy_count: number | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          examples: string | null
          id: string
          instructions: string | null
          is_agency_only: boolean | null
          is_premium: boolean | null
          is_published: boolean | null
          price: number | null
          rating_count: number | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
          version: number | null
          view_count: number | null
        }
        Insert: {
          average_rating?: number | null
          category_id?: string | null
          content: string
          copy_count?: number | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          examples?: string | null
          id?: string
          instructions?: string | null
          is_agency_only?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          rating_count?: number | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
          version?: number | null
          view_count?: number | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string | null
          content?: string
          copy_count?: number | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          examples?: string | null
          id?: string
          instructions?: string | null
          is_agency_only?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          rating_count?: number | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          version?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          id: string
          key: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      referral_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_transactions_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_transactions_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          card_holder: string | null
          card_number: string | null
          created_at: string
          id: string
          plan_id: string | null
          profile_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          card_holder?: string | null
          card_number?: string | null
          created_at?: string
          id?: string
          plan_id?: string | null
          profile_id: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          card_holder?: string | null
          card_number?: string | null
          created_at?: string
          id?: string
          plan_id?: string | null
          profile_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_withdrawals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_withdrawals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscription_reminders: {
        Row: {
          expires_at: string | null
          id: string
          profile_id: string
          reminder_type: string
          sent_at: string
          subscription_type: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          profile_id: string
          reminder_type: string
          sent_at?: string
          subscription_type: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          profile_id?: string
          reminder_type?: string
          sent_at?: string
          subscription_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_reminders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string | null
          metadata: Json | null
          severity: string
          source: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string
          source: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string
          source?: string
        }
        Relationships: []
      }
      user_courses: {
        Row: {
          access_expires_at: string | null
          course_id: string
          id: string
          payment_id: string | null
          purchased_at: string
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          course_id: string
          id?: string
          payment_id?: string | null
          purchased_at?: string
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          course_id?: string
          id?: string
          payment_id?: string | null
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_courses_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed_at: string
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_prompts: {
        Row: {
          id: string
          prompt_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          prompt_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          prompt_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      subscription_reminder_report: {
        Row: {
          days_until_expiry: number | null
          email: string | null
          expires_at: string | null
          full_name: string | null
          reminder_type: string | null
          sent_at: string | null
          subscription_type:
            | Database["public"]["Enums"]["subscription_type"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_key: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      enroll_after_payment: { Args: { p_course_id: string }; Returns: Json }
      expire_subscriptions: { Args: never; Returns: Json }
      export_reminders_csv: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_reminder_type?: string
          p_subscription_type?: string
        }
        Returns: {
          email: string
          expires_at: string
          full_name: string
          reminder_type: string
          sent_at: string
          subscription_type: string
        }[]
      }
      generate_referral_code: { Args: never; Returns: string }
      get_course_enrolled_counts: {
        Args: { course_ids: string[] }
        Returns: {
          course_id: string
          enrolled_count: number
        }[]
      }
      get_course_progress: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: Json
      }
      get_public_stats: { Args: never; Returns: Json }
      get_reminder_summary: { Args: never; Returns: Json }
      get_subscription_reminders: {
        Args: never
        Returns: {
          email: string
          expires_at: string
          full_name: string
          profile_id: string
          reminder_type: string
          subscription_type: string
          user_id: string
        }[]
      }
      has_active_subscription: { Args: { p_user_id: string }; Returns: boolean }
      has_agency_access: { Args: { p_user_id: string }; Returns: boolean }
      has_purchased_prompt: {
        Args: { p_prompt_id: string; p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_prompt_copy_count: {
        Args: { prompt_id: string }
        Returns: undefined
      }
      increment_prompt_view_count: {
        Args: { prompt_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      difficulty_level: "beginner" | "intermediate" | "advanced" | "expert"
      payment_status: "pending" | "approved" | "rejected"
      subscription_type:
        | "free"
        | "single"
        | "monthly"
        | "yearly"
        | "lifetime"
        | "vip"
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
      app_role: ["admin", "moderator", "user"],
      difficulty_level: ["beginner", "intermediate", "advanced", "expert"],
      payment_status: ["pending", "approved", "rejected"],
      subscription_type: [
        "free",
        "single",
        "monthly",
        "yearly",
        "lifetime",
        "vip",
      ],
    },
  },
} as const
