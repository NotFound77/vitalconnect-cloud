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
      doctor_profiles: {
        Row: {
          created_at: string | null
          experience: number
          id: string
          imr_license: string
          imr_verified: boolean | null
          profile_id: string
          specialization: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          experience: number
          id?: string
          imr_license: string
          imr_verified?: boolean | null
          profile_id: string
          specialization: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          experience?: number
          id?: string
          imr_license?: string
          imr_verified?: boolean | null
          profile_id?: string
          specialization?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string
          diagnosis: string
          doctor_profile_id: string
          follow_up_date: string | null
          id: string
          notes: string | null
          patient_profile_id: string
          symptoms: string[] | null
          updated_at: string
          visit_date: string
          vital_signs: Json | null
        }
        Insert: {
          created_at?: string
          diagnosis: string
          doctor_profile_id: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_profile_id: string
          symptoms?: string[] | null
          updated_at?: string
          visit_date?: string
          vital_signs?: Json | null
        }
        Update: {
          created_at?: string
          diagnosis?: string
          doctor_profile_id?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_profile_id?: string
          symptoms?: string[] | null
          updated_at?: string
          visit_date?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_medical_records_doctor"
            columns: ["doctor_profile_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medical_records_patient"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          notification_time: string
          patient_profile_id: string
          prescription_item_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          notification_time: string
          patient_profile_id: string
          prescription_item_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          notification_time?: string
          patient_profile_id?: string
          prescription_item_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_medication_notifications_patient"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_notifications_prescription_item"
            columns: ["prescription_item_id"]
            isOneToOne: false
            referencedRelation: "prescription_items"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          contraindications: string[] | null
          created_at: string
          description: string | null
          dosage_form: string
          generic_name: string | null
          id: string
          manufacturer: string | null
          name: string
          side_effects: string[] | null
          strength: string
          updated_at: string
        }
        Insert: {
          contraindications?: string[] | null
          created_at?: string
          description?: string | null
          dosage_form: string
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          side_effects?: string[] | null
          strength: string
          updated_at?: string
        }
        Update: {
          contraindications?: string[] | null
          created_at?: string
          description?: string | null
          dosage_form?: string
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          side_effects?: string[] | null
          strength?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          aadhaar_number: string | null
          aadhaar_verified: boolean | null
          address: string
          age: number
          created_at: string | null
          date_of_birth: string
          id: string
          profile_id: string
          sex: string
          updated_at: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          aadhaar_verified?: boolean | null
          address: string
          age: number
          created_at?: string | null
          date_of_birth: string
          id?: string
          profile_id: string
          sex: string
          updated_at?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          aadhaar_verified?: boolean | null
          address?: string
          age?: number
          created_at?: string | null
          date_of_birth?: string
          id?: string
          profile_id?: string
          sex?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacist_profiles: {
        Row: {
          created_at: string | null
          id: string
          operating_hours: string
          pharmacy_name: string
          pmc_license: string
          pmc_verified: boolean | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          operating_hours: string
          pharmacy_name: string
          pmc_license: string
          pmc_verified?: boolean | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          operating_hours?: string
          pharmacy_name?: string
          pmc_license?: string
          pmc_verified?: boolean | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacist_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_inventory: {
        Row: {
          batch_number: string | null
          created_at: string
          current_stock: number
          expiry_date: string | null
          id: string
          maximum_stock_level: number
          medication_id: string
          minimum_stock_level: number
          pharmacist_profile_id: string
          supplier: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          id?: string
          maximum_stock_level?: number
          medication_id: string
          minimum_stock_level?: number
          pharmacist_profile_id: string
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          id?: string
          maximum_stock_level?: number
          medication_id?: string
          minimum_stock_level?: number
          pharmacist_profile_id?: string
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pharmacy_inventory_medication"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pharmacy_inventory_pharmacist"
            columns: ["pharmacist_profile_id"]
            isOneToOne: false
            referencedRelation: "pharmacist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          created_at: string
          dispensed_at: string | null
          dispensed_by_pharmacist_id: string | null
          dispensed_quantity: number | null
          dosage_instructions: string
          duration_days: number | null
          frequency: string
          id: string
          medication_id: string
          prescription_id: string
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by_pharmacist_id?: string | null
          dispensed_quantity?: number | null
          dosage_instructions: string
          duration_days?: number | null
          frequency: string
          id?: string
          medication_id: string
          prescription_id: string
          quantity: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by_pharmacist_id?: string | null
          dispensed_quantity?: number | null
          dosage_instructions?: string
          duration_days?: number | null
          frequency?: string
          id?: string
          medication_id?: string
          prescription_id?: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_prescription_items_medication"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prescription_items_pharmacist"
            columns: ["dispensed_by_pharmacist_id"]
            isOneToOne: false
            referencedRelation: "pharmacist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prescription_items_prescription"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_profile_id: string
          id: string
          issued_date: string
          medical_record_id: string
          notes: string | null
          patient_profile_id: string
          prescription_number: string
          status: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          doctor_profile_id: string
          id?: string
          issued_date?: string
          medical_record_id: string
          notes?: string | null
          patient_profile_id: string
          prescription_number: string
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          doctor_profile_id?: string
          id?: string
          issued_date?: string
          medical_record_id?: string
          notes?: string | null
          patient_profile_id?: string
          prescription_number?: string
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_prescriptions_doctor"
            columns: ["doctor_profile_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prescriptions_medical_record"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prescriptions_patient"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          name: string
          phone: string
          qr_code: string | null
          updated_at: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          name: string
          phone: string
          qr_code?: string | null
          updated_at?: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string
          phone?: string
          qr_code?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "patient" | "doctor" | "pharmacist"
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
      user_type: ["patient", "doctor", "pharmacist"],
    },
  },
} as const
