
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aziende: {
        Row: {
          created_at: string
          denominazione: string
          id_azienda: string
          id_cliente_associato: string | null
          partita_iva: string
        }
        Insert: {
          created_at?: string
          denominazione: string
          id_azienda?: string
          id_cliente_associato?: string | null
          partita_iva: string
        }
        Update: {
          created_at?: string
          denominazione?: string
          id_azienda?: string
          id_cliente_associato?: string | null
          partita_iva?: string
        }
        Relationships: [
          {
            foreignKeyName: "aziende_id_cliente_associato_fkey"
            columns: ["id_cliente_associato"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id_cliente"]
          }
        ]
      }
      clienti: {
        Row: {
          created_at: string
          id_cliente: string
          nome_completo: string
          nome_utente: string
          password: string
        }
        Insert: {
          created_at?: string
          id_cliente?: string
          nome_completo: string
          nome_utente: string
          password: string
        }
        Update: {
          created_at?: string
          id_cliente?: string
          nome_completo?: string
          nome_utente?: string
          password?: string
        }
        Relationships: []
      }
      documenti: {
        Row: {
          created_at: string
          descrizione: string
          id_documento: string
          link_pdf: string
          partita_iva_azienda: string
        }
        Insert: {
          created_at?: string
          descrizione: string
          id_documento?: string
          link_pdf: string
          partita_iva_azienda: string
        }
        Update: {
          created_at?: string
          descrizione?: string
          id_documento?: string
          link_pdf?: string
          partita_iva_azienda?: string
        }
        Relationships: [
          {
            foreignKeyName: "documenti_partita_iva_azienda_fkey"
            columns: ["partita_iva_azienda"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["partita_iva"]
          }
        ]
      }
      scadenze_f24: {
        Row: {
          created_at: string
          descrizione: string
          id_f24: string
          importo: number
          importo_pagato: number | null
          link_pdf: string | null
          partita_iva_azienda: string
          stato: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descrizione: string
          id_f24?: string
          importo: number
          importo_pagato?: number | null
          link_pdf?: string | null
          partita_iva_azienda: string
          stato?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descrizione?: string
          id_f24?: string
          importo?: number
          importo_pagato?: number | null
          link_pdf?: string | null
          partita_iva_azienda?: string
          stato?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scadenze_f24_partita_iva_azienda_fkey"
            columns: ["partita_iva_azienda"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["partita_iva"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
