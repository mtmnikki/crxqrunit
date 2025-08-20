// Core data models for ClinicalRxQ - Updated for Supabase schema

export interface User {
  id: string
  email: string
  pharmacy_name?: string
  role: 'member' | 'admin'
  subscription_status?: string
  pharmacy_phone?: string
  address1?: string
  city?: string
  state?: string
  zipcode?: number
  created_at?: string
  updated_at?: string
}

export interface ClinicalProgram {
  id: string
  slug: string
  name: string
  description?: string
  overview?: string
  experience_level?: string
  created_at?: string
  updated_at?: string
}

export interface TrainingModule {
  id: string
  name?: string
  length?: string
  file_path?: string
  sort_order?: number
  program_id?: string
  created_at?: string
  updated_at?: string
}

export interface ProtocolManual {
  id: string
  program_id?: string
  name: string
  file_path?: string
  link?: string
  created_at?: string
  updated_at?: string
}

export interface DocumentationForm {
  id: string
  program_id?: string
  name: string
  category?: string
  subcategory?: string
  file_path?: string
  link?: string
  created_at?: string
  updated_at?: string
}

export interface PatientHandout {
  id: string
  name: string
  file_path?: string
  link?: string
  created_at?: string
  updated_at?: string
}

export interface ClinicalGuideline {
  id: string
  name: string
  file_path?: string
  link?: string
  created_at?: string
  updated_at?: string
}

export interface MedicalBillingResource {
  id: string
  name: string
  file_path?: string
  created_at?: string
  updated_at?: string
}

export interface AdditionalResource {
  id: string
  program_id?: string
  name: string
  file_path?: string
  link?: string
  created_at?: string
  updated_at?: string
}

// Storage file catalog from Supabase
export interface StorageFile {
  id: string
  bucket_name: string
  file_name: string
  file_path: string
  file_url: string
  file_size: number
  mime_type: string
  last_modified: string
  created_at: string
  updated_at: string
}

// UI-specific interfaces for displaying data
export interface ResourceItem {
  id: string
  name: string
  type: string
  category?: string
  program?: string
  condition?: string
  url?: string
  filename?: string
  mediaType?: 'video' | 'document'
  duration?: string
  fileSize?: number
  mimeType?: string
  lastModified?: string
}

export interface ProgramUI {
  id: string
  name: string
  description: string
  slug: string
  level?: string
  moduleCount: number
  resourceCount: number
  image?: string
}