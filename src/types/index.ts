export interface Company {
  id: string
  user_id: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  website: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  title: string | null
  company_id: string | null
  company?: Pick<Company, 'id' | 'name'>
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  name: string
  color: string
  order_index: number
  created_at: string
}

export interface Deal {
  id: string
  user_id: string
  title: string
  value: number
  stage_id: string | null
  stage?: PipelineStage
  contact_id: string | null
  contact?: Pick<Contact, 'id' | 'name'>
  company_id: string | null
  company?: Pick<Company, 'id' | 'name'>
  probability: number
  expected_close: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  subject: string
  body: string | null
  entity_type: 'contact' | 'deal' | 'company'
  entity_id: string
  completed_at: string | null
  created_at: string
}

export type ActivityType = Activity['type']
export type EntityType = Activity['entity_type']
