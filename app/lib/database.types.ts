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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'attendee' | 'organizer' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'attendee' | 'organizer' | 'admin'
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: 'attendee' | 'organizer' | 'admin'
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          title: string
          slug: string
          description: string | null
          category: string
          image_url: string | null
          venue: string
          address: string | null
          city: string
          country: string
          start_date: string
          end_date: string
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          organizer_id: string
          title: string
          slug: string
          description?: string | null
          category?: string
          image_url?: string | null
          venue: string
          address?: string | null
          city: string
          country?: string
          start_date: string
          end_date: string
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          is_featured?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          category?: string
          image_url?: string | null
          venue?: string
          address?: string | null
          city?: string
          country?: string
          start_date?: string
          end_date?: string
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          is_featured?: boolean
        }
      }
      ticket_tiers: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          currency: string
          total_quantity: number
          sold_quantity: number
          max_per_order: number
          sale_starts_at: string | null
          sale_ends_at: string | null
          is_visible: boolean
          created_at: string
        }
        Insert: {
          event_id: string
          name: string
          description?: string | null
          price?: number
          currency?: string
          total_quantity: number
          max_per_order?: number
          sale_starts_at?: string | null
          sale_ends_at?: string | null
          is_visible?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          total_quantity?: number
          max_per_order?: number
          sale_starts_at?: string | null
          sale_ends_at?: string | null
          is_visible?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          event_id: string
          order_number: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
          total_amount: number
          currency: string
          buyer_name: string
          buyer_email: string
          buyer_phone: string | null
          payment_method: string | null
          payment_ref: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          event_id: string
          order_number: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
          total_amount: number
          currency?: string
          buyer_name: string
          buyer_email: string
          buyer_phone?: string | null
          payment_method?: string | null
          payment_ref?: string | null
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
          payment_method?: string | null
          payment_ref?: string | null
        }
      }
      tickets: {
        Row: {
          id: string
          order_id: string
          event_id: string
          tier_id: string
          ticket_code: string
          holder_name: string
          holder_email: string
          status: 'valid' | 'used' | 'cancelled' | 'refunded'
          checked_in_at: string | null
          created_at: string
        }
        Insert: {
          order_id: string
          event_id: string
          tier_id: string
          ticket_code: string
          holder_name: string
          holder_email: string
          status?: 'valid' | 'used' | 'cancelled' | 'refunded'
        }
        Update: {
          status?: 'valid' | 'used' | 'cancelled' | 'refunded'
          checked_in_at?: string | null
        }
      }
    }
  }
}

// Convenient derived types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type TicketTier = Database['public']['Tables']['ticket_tiers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']

export type EventWithTiers = Event & {
  ticket_tiers: TicketTier[]
  profiles: Pick<Profile, 'full_name' | 'email'>
}
