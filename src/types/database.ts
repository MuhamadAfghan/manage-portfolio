export interface Project {
  id: string
  title: string
  description: string
  content: string // Rich text content
  type: 'individual' | 'collaboration' | 'client'
  status: 'draft' | 'published'
  technologies: string[]

  // Media
  thumbnail_url?: string
  images: string[]

  // Links
  demo_url?: string
  github_url?: string

  // Project type specific fields
  client_name?: string // for client projects
  client_contact?: string
  budget?: number
  team_members?: string[] // for collaboration projects
  is_private?: boolean // for individual projects

  // Metadata
  priority: number // for drag-and-drop ordering
  created_at: string
  updated_at: string
  created_by: string
}

export interface Skill {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'other'
  level: 1 | 2 | 3 | 4 | 5 // 1-5 skill level
  icon_url?: string
  created_at: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[] // ['read:projects', 'read:skills']
  is_active: boolean
  created_at: string
  last_used_at?: string
}

export interface ActivityLog {
  id: string
  action: string
  resource_type: 'project' | 'skill' | 'api_key'
  resource_id: string
  user_id: string
  details?: Record<string, any>
  created_at: string
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
      }
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id' | 'created_at'>
        Update: Partial<Omit<Skill, 'id' | 'created_at'>>
      }
      api_keys: {
        Row: ApiKey
        Insert: Omit<ApiKey, 'id' | 'created_at'>
        Update: Partial<Omit<ApiKey, 'id' | 'created_at'>>
      }
      activity_logs: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
