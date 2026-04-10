export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      course_classes: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          active: boolean;
          teacher_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          active?: boolean;
          teacher_id?: string | null;
        };
        Update: {
          name?: string;
          active?: boolean;
          teacher_id?: string | null;
        };
      };
      students: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string;
          address: string | null;
          address_number: string | null;
          apartment: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          instagram: string | null;
          email: string | null;
          birth_date: string | null;
          cpf: string | null;
          rg: string | null;
          phone: string | null;
          profession: string | null;
          class_name: string | null;
          schedule: string | null;
          teacher_name: string | null;
          payment_notes: string | null;
          current_book: string | null;
          source: string | null;
          is_active: boolean;
          language: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name: string;
          address?: string | null;
          address_number?: string | null;
          apartment?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          instagram?: string | null;
          email?: string | null;
          birth_date?: string | null;
          cpf?: string | null;
          rg?: string | null;
          phone?: string | null;
          profession?: string | null;
          class_name?: string | null;
          schedule?: string | null;
          teacher_name?: string | null;
          payment_notes?: string | null;
          current_book?: string | null;
          source?: string | null;
          is_active?: boolean;
          language?: string;
        };
        Update: {
          full_name?: string;
          address?: string | null;
          address_number?: string | null;
          apartment?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          instagram?: string | null;
          email?: string | null;
          birth_date?: string | null;
          cpf?: string | null;
          rg?: string | null;
          phone?: string | null;
          profession?: string | null;
          class_name?: string | null;
          schedule?: string | null;
          teacher_name?: string | null;
          payment_notes?: string | null;
          current_book?: string | null;
          source?: string | null;
          is_active?: boolean;
          language?: string;
        };
      };
      student_guardians: {
        Row: {
          id: string;
          student_id: string;
          created_at: string;
          updated_at: string;
          guardian_type: "primary" | "secondary";
          full_name: string;
          cpf: string | null;
          profession: string | null;
          company: string | null;
          phone: string | null;
          work_phone: string | null;
          email: string | null;
          instagram: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          created_at?: string;
          updated_at?: string;
          guardian_type: "primary" | "secondary";
          full_name: string;
          cpf?: string | null;
          profession?: string | null;
          company?: string | null;
          phone?: string | null;
          work_phone?: string | null;
          email?: string | null;
          instagram?: string | null;
        };
        Update: {
          guardian_type?: "primary" | "secondary";
          full_name?: string;
          cpf?: string | null;
          profession?: string | null;
          company?: string | null;
          phone?: string | null;
          work_phone?: string | null;
          email?: string | null;
          instagram?: string | null;
        };
      };
      student_financial_contacts: {
        Row: {
          id: string;
          student_id: string;
          created_at: string;
          updated_at: string;
          full_name: string;
          cpf: string | null;
          address: string | null;
          profession: string | null;
          company: string | null;
          phone: string | null;
          work_phone: string | null;
          email: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          created_at?: string;
          updated_at?: string;
          full_name: string;
          cpf?: string | null;
          address?: string | null;
          profession?: string | null;
          company?: string | null;
          phone?: string | null;
          work_phone?: string | null;
          email?: string | null;
        };
        Update: {
          full_name?: string;
          cpf?: string | null;
          address?: string | null;
          profession?: string | null;
          company?: string | null;
          phone?: string | null;
          work_phone?: string | null;
          email?: string | null;
        };
      };
      student_payment_plans: {
        Row: {
          id: string;
          student_id: string;
          created_at: string;
          updated_at: string;
          payment_type:
            | "enrollment"
            | "enrollment_first_installment"
            | "installments"
            | "full_course"
            | "course_material"
            | "down_payment"
            | "enrollment_fee"
            | "re_enrollment_fee"
            | "monthly_payment";
          title: string;
          total_amount: string;
          is_installment: boolean;
          installment_count: number;
          default_payment_method: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          created_at?: string;
          updated_at?: string;
          payment_type:
            | "enrollment"
            | "enrollment_first_installment"
            | "installments"
            | "full_course"
            | "course_material"
            | "down_payment"
            | "enrollment_fee"
            | "re_enrollment_fee"
            | "monthly_payment";
          title: string;
          total_amount: string;
          is_installment?: boolean;
          installment_count?: number;
          default_payment_method?: string | null;
          notes?: string | null;
        };
        Update: {
          title?: string;
          total_amount?: string;
          is_installment?: boolean;
          installment_count?: number;
          default_payment_method?: string | null;
          notes?: string | null;
          payment_type?:
            | "enrollment"
            | "enrollment_first_installment"
            | "installments"
            | "full_course"
            | "course_material"
            | "down_payment"
            | "enrollment_fee"
            | "re_enrollment_fee"
            | "monthly_payment";
        };
      };
      student_payment_installments: {
        Row: {
          id: string;
          payment_plan_id: string;
          student_id: string;
          created_at: string;
          updated_at: string;
          installment_number: number;
          amount: string;
          payment_method: string | null;
          due_date: string | null;
          paid_at: string | null;
          status: "pending" | "resolved";
          description: string | null;
        };
        Insert: {
          id?: string;
          payment_plan_id: string;
          student_id: string;
          created_at?: string;
          updated_at?: string;
          installment_number: number;
          amount: string;
          payment_method?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          status?: "pending" | "resolved";
          description?: string | null;
        };
        Update: {
          installment_number?: number;
          amount?: string;
          payment_method?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          status?: "pending" | "resolved";
          description?: string | null;
        };
      };
      teachers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          active?: boolean;
        };
        Update: {
          name?: string;
          active?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
