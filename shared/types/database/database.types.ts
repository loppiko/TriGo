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
      Drivers: {
        Row: {
          createdAt: string
          firstName: string
          id: string
          lastName: string
          phoneNumber: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          firstName: string
          id?: string
          lastName: string
          phoneNumber: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          firstName?: string
          id?: string
          lastName?: string
          phoneNumber?: string
          updatedAt?: string
        }
        Relationships: []
      }
      "Reservation-Addresses": {
        Row: {
          countryCode: string
          createdAt: string
          description: string
          freeformAddress: string
          id: string
          lat: number
          lon: number
          name: string
        }
        Insert: {
          countryCode: string
          createdAt?: string
          description: string
          freeformAddress: string
          id?: string
          lat: number
          lon: number
          name: string
        }
        Update: {
          countryCode?: string
          createdAt?: string
          description?: string
          freeformAddress?: string
          id?: string
          lat?: number
          lon?: number
          name?: string
        }
        Relationships: []
      }
      "Reservation-ClientData": {
        Row: {
          createdAt: string
          deviceId: string | null
          firstName: string
          id: string
          lastName: string
          phoneNumber: string
        }
        Insert: {
          createdAt?: string
          deviceId?: string | null
          firstName: string
          id?: string
          lastName: string
          phoneNumber: string
        }
        Update: {
          createdAt?: string
          deviceId?: string | null
          firstName?: string
          id?: string
          lastName?: string
          phoneNumber?: string
        }
        Relationships: []
      }
      Reservations: {
        Row: {
          assignedDriver: string | null
          clientData: string
          code: string
          createdAt: string
          createdBy: string | null
          destinationId: string
          distance: number
          id: string
          pickupAt: string
          pickupId: string
          pickupType: string
          status: string
          updatedAt: string
        }
        Insert: {
          assignedDriver?: string | null
          clientData?: string
          code: string
          createdAt?: string
          createdBy?: string | null
          destinationId?: string
          distance: number
          id?: string
          pickupAt: string
          pickupId?: string
          pickupType: string
          status: string
          updatedAt?: string
        }
        Update: {
          assignedDriver?: string | null
          clientData?: string
          code?: string
          createdAt?: string
          createdBy?: string | null
          destinationId?: string
          distance?: number
          id?: string
          pickupAt?: string
          pickupId?: string
          pickupType?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Reservations_assignedDriver_fkey"
            columns: ["assignedDriver"]
            isOneToOne: false
            referencedRelation: "Drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Reservations_clientData_fkey"
            columns: ["clientData"]
            isOneToOne: false
            referencedRelation: "Reservation-ClientData"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Reservations_destinationId_fkey"
            columns: ["destinationId"]
            isOneToOne: false
            referencedRelation: "Reservation-Addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Reservations_pickupId_fkey"
            columns: ["pickupId"]
            isOneToOne: false
            referencedRelation: "Reservation-Addresses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      createReservation: { Args: { payload: Json }; Returns: Json }
      getReservationByCodeAndPhoneNumber: {
        Args: { phonenumber: string; reservationcode: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
